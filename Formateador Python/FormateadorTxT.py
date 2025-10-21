#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json
from pathlib import Path
from typing import List, Dict, Any, Generator, Optional
import sys

# ========== Expresiones regulares y helpers (idéntico a tu lógica) ==========

RE_HEADER = re.compile(r'^DRE JUNIN[^\n]*$', re.MULTILINE)
RE_SEQ_SAME_LINE = re.compile(r'^\.\s*(?P<seq>0{4,}\d+)\s*$', re.MULTILINE)
RE_SEQ_OLD = re.compile(r'\n\s{0,100}(?P<seq>0{4,}\d+)\n\.\s*\n?', re.MULTILINE)
RE_APELLIDOS = re.compile(r'Apellidos\s*:\s*(.*)', re.IGNORECASE)
RE_NOMBRES = re.compile(r'Nombres\s*:\s*(.*)', re.IGNORECASE)
RE_FECHA_NAC = re.compile(r'Fecha de Nacimiento\s*:\s*([0-9]{2}/[0-9]{2}/[0-9]{4})')
RE_DOC = re.compile(r'Documento de Identidad\s*:.*?\b(\d{6,})\b')
RE_ESTAB = re.compile(r'Establecimiento\s*:\s*(.*)')
RE_CARGO = re.compile(r'Cargo\s*:\s*(.*)')
RE_TIPO_SERV = re.compile(r'Tipo de Servidor\s*:\s*(.*)')
RE_TIPO_PENS = re.compile(r'Tipo de Pensionista\s*:\s*(.*)')
RE_TIPO_PENSION = re.compile(r'Tipo de Pension\s*:\s*(.*)')
RE_NIV_MAG = re.compile(r'Niv\.Mag\./[^:]*:\s*(.*)')
RE_TIEMPO_SERV = re.compile(r'Tiempo de Servicio.*:\s*([^\n]*)')
RE_FECHA_REG = re.compile(r'Fecha de Registro\s*:\s*Ingr\.:(\d{2}/\d{2}/\d{4})\s+Termino:(\d{2}/\d{2}/\d{4})')
RE_FECHA_REG_ALT = re.compile(r'Fecha de Registro\s*:\s*Cese\s*:\s*Termino:(\d{2}/\d{2}/\d{4})')
RE_CTA = re.compile(r'(?:Cta\. TeleAhorro o Nro\. Cheque|Cuenta de TeleAhorro)\s*:\s*(.*)')
RE_LEYENDA_PERM = re.compile(r'Leyenda Permanente\s*:\s*(.*)')
RE_LEYENDA_MENS = re.compile(r'Leyenda Mensual\s*:\s*(.*)')
RE_REGIMEN = re.compile(r'Regimen Pensionario\s*:\s*(.*)')
RE_REG_PENS_DET_BLOCK = re.compile(r'Reg\.?Pensionario\s*:\s*(.+?)(?:\n[A-Z]|$)', re.DOTALL)
RE_AFILIACION = re.compile(r'FAfiliacion\s*:\s*([0-9]{2}/[0-9]{2}/[0-9]{4})')
RE_CONCEPT = re.compile(r'^[ \t]*([+-])([A-Za-z0-9ÁÉÍÓÚÑ./ _%]+)\s+([\d.,]+)\s*$', re.MULTILINE)
RE_TOTALS = re.compile(r'T-REMUN\s+([\d.,]+)\s+T-DSCTO\s+([\d.,]+)\s+T-LIQUI\s+([\d.,]+)')
RE_MIMP = re.compile(r'MImponible\s+([\d.,]+)')

def limpiar_monto(txt: str) -> float:
    txt = txt.strip().replace(',', '')
    try:
        return float(txt)
    except ValueError:
        return 0.0

def partir_boletas(contenido: str) -> List[str]:
    starts = [m.start() for m in RE_HEADER.finditer(contenido)]
    if not starts:
        return [contenido.strip()] if contenido.strip() else []
    starts.append(len(contenido))
    partes = []
    for i in range(len(starts)-1):
        frag = contenido[starts[i]:starts[i+1]].strip()
        if frag:
            partes.append(frag)
    return partes

def extraer_conceptos(bloque: str) -> List[Dict[str, Any]]:
    conceptos = []
    secciones = [m.start() for m in re.finditer(r'^=+\s*$', bloque, re.MULTILINE)]
    sub = bloque
    if len(secciones) >= 2:
        sub = bloque[secciones[0]:secciones[-1]]
    for m in RE_CONCEPT.finditer(sub):
        signo, nombre, monto_txt = m.groups()
        conceptos.append({
            "tipo": "ingreso" if signo == '+' else "descuento",
            "concepto": nombre.strip(),
            "monto": limpiar_monto(monto_txt)
        })
    return conceptos

def extraer_reg_pensionario(bloque: str) -> Dict[str, Any]:
    datos: Dict[str, Any] = {}
    m = RE_REG_PENS_DET_BLOCK.search(bloque)
    if m:
        texto = m.group(1)
        lineas = [l.strip() for l in texto.splitlines() if l.strip()]
        datos["raw"] = " ".join(lineas)
        af = RE_AFILIACION.search(texto)
        if af:
            datos["afiliacion"] = af.group(1)
    return datos

def parse_boleta(bloque: str, origen: str) -> Dict[str, Any]:
    d: Dict[str, Any] = {
        "archivo_origen": origen,
        "raw_length": len(bloque),
        "conceptos": []
    }

    ms = RE_SEQ_SAME_LINE.search(bloque) or RE_SEQ_OLD.search(bloque)
    if ms:
        d["secuencia"] = ms.group('seq')

    primeras = bloque.splitlines()[:3]
    header_text = "\n".join(primeras)
    code_match = re.search(r'(CF|CL|CG)\d+[A-Z0-9]*', header_text)
    if code_match:
        d["codigo_encabezado"] = code_match.group(0)

    MESES = "ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SETIEMBRE|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE"
    RE_PERIODO = re.compile(rf'({MESES})\s*-+\s*(\d{{4}})', re.IGNORECASE)
    periodo = RE_PERIODO.search(bloque)
    if periodo:
        d["mes"] = periodo.group(1).capitalize()
        d["anio"] = periodo.group(2)

    estado = re.search(r'\(\d+\)\s+([A-Za-zÁÉÍÓÚÑ]+)', bloque)
    if estado:
        d["estado"] = estado.group(1)

    def poner(regex, key):
        m = regex.search(bloque)
        if m:
            d[key] = m.group(1).strip()

    poner(RE_APELLIDOS, "apellidos")
    poner(RE_NOMBRES, "nombres")
    poner(RE_FECHA_NAC, "fecha_nacimiento")
    poner(RE_DOC, "documento_identidad")
    poner(RE_ESTAB, "establecimiento")
    poner(RE_CARGO, "cargo")
    poner(RE_TIPO_SERV, "tipo_servidor")
    poner(RE_TIPO_PENS, "tipo_pensionista")
    poner(RE_TIPO_PENSION, "tipo_pension")
    poner(RE_NIV_MAG, "nivel_mag_horas")
    poner(RE_TIEMPO_SERV, "tiempo_servicio")
    poner(RE_LEYENDA_PERM, "leyenda_permanente")
    m = RE_LEYENDA_MENS.search(bloque)
    if m:
        leyenda = m.group(1).strip()
        if leyenda and not re.match(r'^=+$', leyenda) and not re.match(r'^[\s=]*$', leyenda):
            d["leyenda_mensual"] = leyenda
    poner(RE_REGIMEN, "regimen_pensionario")

    mfr = RE_FECHA_REG.search(bloque)
    if mfr:
        d["fecha_ingreso_registro"] = mfr.group(1)
        d["fecha_termino_registro"] = mfr.group(2)
    else:
        mfr_alt = RE_FECHA_REG_ALT.search(bloque)
        if mfr_alt:
            d["fecha_termino_registro"] = mfr_alt.group(1)

    cuentas = RE_CTA.findall(bloque)
    if cuentas:
        d["cuenta_principal"] = cuentas[0].strip()
        d["cuentas_todas"] = [c.strip() for c in cuentas if c.strip()]

    reg_det = extraer_reg_pensionario(bloque)
    if reg_det:
        d["reg_pensionario_detalle"] = reg_det

    d["conceptos"] = extraer_conceptos(bloque)

    mt = RE_TOTALS.search(bloque)
    if mt:
        d["total_remuneraciones"] = limpiar_monto(mt.group(1))
        d["total_descuentos"] = limpiar_monto(mt.group(2))
        d["total_liquido"] = limpiar_monto(mt.group(3))
    mimp = RE_MIMP.search(bloque)
    if mimp:
        d["monto_imponible"] = limpiar_monto(mimp.group(1))

    return d

def procesar_archivo(ruta: Path) -> List[Dict[str, Any]]:
    with ruta.open('r', encoding='latin-1', errors='replace') as f:
        contenido = f.read()
    boletas = partir_boletas(contenido)
    out: List[Dict[str, Any]] = []
    for b in boletas:
        try:
            out.append(parse_boleta(b, ruta.name))
        except Exception as e:
            out.append({"archivo_origen": ruta.name, "error": str(e), "fragmento_inicial": b[:200]})
    return out

def iter_registros(directorio: Path) -> Generator[Dict[str, Any], None, None]:
    archivos = sorted(directorio.rglob('*.lis'))
    if not archivos:
        print(f"[!] No se encontraron archivos .lis en {directorio}", file=sys.stderr)
        return
    for p in archivos:
        print(f"Procesando: {p}")
        for r in procesar_archivo(p):
            yield r

def pedir_opcion() -> int:
    print("\n¿Qué deseas hacer?")
    print("  1) Subir JSON a una URL")
    print("  2) Crear un JSON para usar en el backend (archivo .json)")
    while True:
        op = input("Elige 1 o 2: ").strip()
        if op in ("1", "2"):
            return int(op)
        print("Opción inválida. Intenta de nuevo.")

def pedir_directorio() -> Path:
    while True:
        d = input("Directorio raíz con .lis [Listas]: ").strip() or "Listas"
        p = Path(d)
        if p.exists() and p.is_dir():
            return p
        print("Directorio no válido. Intenta de nuevo.")

def pedir_headers() -> Dict[str, str]:
    print("\nPuedes añadir headers HTTP (por ejemplo Authorization: Bearer ...).")
    print("Deja vacío para continuar.")
    headers: Dict[str, str] = {}
    while True:
        linea = input("Header (Clave:Valor) o Enter para terminar: ").strip()
        if not linea:
            break
        if ":" not in linea:
            print("Formato inválido. Usa Clave:Valor")
            continue
        k, v = linea.split(":", 1)
        headers[k.strip()] = v.strip()
    return headers

def pedir_endpoint() -> str:
    while True:
        url = input("URL del endpoint (ej. https://api.tuapp.com/boletas): ").strip()
        if url.startswith("http://") or url.startswith("https://"):
            return url
        print("URL inválida. Debe comenzar con http:// o https://")

def pedir_batch_size() -> int:
    while True:
        txt = input("Tamaño de lote [500]: ").strip()
        if not txt:
            return 500
        try:
            v = int(txt)
            if v > 0:
                return v
        except ValueError:
            pass
        print("Valor inválido. Debe ser un entero > 0.")

def pedir_salida() -> Path:
    por_defecto = "boletas.json"
    txt = input(f"Ruta de salida [{por_defecto}]: ").strip() or por_defecto
    out = Path(txt)
    if not str(out).endswith(".json"):
        out = Path(str(out) + ".json")
    return out

def guardar_json_simple(registros: Generator[Dict[str, Any], None, None], destino: Path, skip_errors: bool = True) -> int:
    total = 0
    arr = []
    for r in registros:
        if skip_errors and "error" in r:
            continue
        arr.append(r)
        total += 1
    with open(destino, "w", encoding="utf-8") as f:
        json.dump(arr, f, ensure_ascii=False, separators=(",", ":"), indent=2)
    return total

def subir_por_lotes(endpoint: str, registros: Generator[Dict[str, Any], None, None],
                    headers: Optional[Dict[str, str]] = None, batch_size: int = 500,
                    skip_errors: bool = True) -> int:
    try:
        import requests
    except ImportError:
        print("Instala requests: pip install requests", file=sys.stderr)
        raise
    headers = dict(headers or {})
    headers.setdefault("Content-Type", "application/json")
    buffer: List[Dict[str, Any]] = []
    total = 0

    def flush():
        nonlocal buffer, total
        if not buffer:
            return
        payload = json.dumps(buffer, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        resp = requests.post(endpoint, data=payload, headers=headers, timeout=60)
        if not (200 <= resp.status_code < 300):
            raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:500]}")
        total += len(buffer)
        print(f"  -> Enviadas {len(buffer)} (acumulado {total})")
        buffer.clear()

    for r in registros:
        if skip_errors and "error" in r:
            continue
        buffer.append(r)
        if len(buffer) >= batch_size:
            flush()
    flush()
    return total

def main():
    print("=== Boletas CLI ===")
    raiz = pedir_directorio()
    opcion = pedir_opcion()

    if opcion == 1:
        endpoint = pedir_endpoint()
        headers = pedir_headers()
        batch = pedir_batch_size()
        print("\nIniciando subida...")
        try:
            total = subir_por_lotes(endpoint, iter_registros(raiz), headers=headers, batch_size=batch, skip_errors=True)
        except Exception as e:
            print(f"[ERROR] Falló la subida: {e}", file=sys.stderr)
            sys.exit(1)
        print(f"\nListo. Enviadas {total} boletas a {endpoint}")
        return

    if opcion == 2:
        salida = pedir_salida()
        print("\nGenerando archivo JSON (array)...")
        try:
            total = guardar_json_simple(iter_registros(raiz), salida, skip_errors=True)
        except Exception as e:
            print(f"[ERROR] Falló la generación: {e}", file=sys.stderr)
            sys.exit(1)
        print(f"\nListo. Procesadas {total} boletas. Archivo: {salida}")

if __name__ == "__main__":
    main()