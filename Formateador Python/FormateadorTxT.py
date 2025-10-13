#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import re
import json
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional, Generator
from datetime import datetime
import sys
import gzip

# =========================
# Regex de detección
# =========================
RE_HEADER = re.compile(r'^DRE JUNIN[^\n]*$', re.MULTILINE)
RE_SEQ_SAME_LINE = re.compile(r'^\.\s*(?P<seq>0{4,}\d+)\s*$', re.MULTILINE)  # ". 00001290"
RE_SEQ_OLD = re.compile(r'\n\s{0,100}(?P<seq>0{4,}\d+)\n\.\s*\n?', re.MULTILINE)  # variante antigua

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
    # Encuentra cada cabecera "DRE JUNIN" y corta hasta la siguiente o EOF
    starts = [m.start() for m in RE_HEADER.finditer(contenido)]
    if not starts:
        # Si no encuentra cabeceras, intenta con el patrón antiguo (no recomendado)
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
    # Entre la primera y la última línea de "===="
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

    # Secuencia final: soporta ". 00001290" y variante antigua en líneas separadas
    ms = RE_SEQ_SAME_LINE.search(bloque) or RE_SEQ_OLD.search(bloque)
    if ms:
        d["secuencia"] = ms.group('seq')

    # Encabezado CF/CL/CG en primeras líneas
    primeras = bloque.splitlines()[:3]
    header_text = "\n".join(primeras)
    code_match = re.search(r'(CF|CL|CG)\d+[A-Z0-9]*', header_text)
    if code_match:
        d["codigo_encabezado"] = code_match.group(0)

    # Periodo "MES - YYYY"
    MESES = "ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SETIEMBRE|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE"
    RE_PERIODO = re.compile(rf'({MESES})\s*-+\s*(\d{{4}})', re.IGNORECASE)
    periodo = RE_PERIODO.search(bloque)
    if periodo:
        d["mes"] = periodo.group(1).capitalize()
        d["anio"] = periodo.group(2)

    # Estado después del código de situación (si existiera)
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
        print(f"No se encontraron archivos .lis en {directorio}", file=sys.stderr)
        return
    for p in archivos:
        print(f"Procesando: {p}")
        for r in procesar_archivo(p):
            yield r

# =========================
# Writers simples
# =========================

def escribir_ndjson_gz(registros: Generator[Dict[str, Any], None, None], destino: Path, skip_errors: bool = True) -> int:
    total = 0
    with gzip.open(destino, "wt", encoding="utf-8") as f:
        for r in registros:
            if skip_errors and "error" in r:
                continue
            f.write(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n")
            total += 1
    return total

def escribir_json_array_gz(registros: Generator[Dict[str, Any], None, None], destino: Path, skip_errors: bool = True) -> int:
    total = 0
    first = True
    with gzip.open(destino, "wt", encoding="utf-8") as f:
        f.write("[")
        for r in registros:
            if skip_errors and "error" in r:
                continue
            if not first:
                f.write(",")
            else:
                first = False
            f.write(json.dumps(r, ensure_ascii=False, separators=(",", ":")))
            total += 1
        f.write("]")
    return total

# =========================
# Uploader HTTP simple
# =========================

class HttpUploader:
    def __init__(self, endpoint: str, batch_size: int = 500, timeout: int = 60, headers: Optional[Dict[str, str]] = None):
        try:
            import requests  # noqa
        except ImportError:
            print("Instala requests: pip install requests", file=sys.stderr)
            raise
        import requests
        self.requests = requests
        self.endpoint = endpoint
        self.batch_size = batch_size
        self.timeout = timeout
        self.headers = headers or {"Content-Type": "application/json"}
        self.buffer: List[Dict[str, Any]] = []
        self.total = 0

    def flush(self):
        if not self.buffer:
            return
        payload = json.dumps(self.buffer, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        resp = self.requests.post(self.endpoint, data=payload, headers=self.headers, timeout=self.timeout)
        if not (200 <= resp.status_code < 300):
            raise RuntimeError(f"HTTP {resp.status_code}: {resp.text[:500]}")
        self.total += len(self.buffer)
        self.buffer.clear()

    def write(self, r: Dict[str, Any]):
        self.buffer.append(r)
        if len(self.buffer) >= self.batch_size:
            self.flush()

def main():
    ap = argparse.ArgumentParser(description="Parser de boletas .lis con exportación y subida simples")
    ap.add_argument("--directorio", "-d", default="Listas", help="Directorio raíz donde buscar .lis")
    ap.add_argument("--modo", choices=["json", "ndjson", "upload-http"], default="ndjson",
                    help="json: JSON array .gz; ndjson: 1 objeto/linea .gz; upload-http: enviar a endpoint")
    ap.add_argument("--salida", "-o", help="Ruta de salida (se recomienda .gz) para json/ndjson")
    ap.add_argument("--skip-errors", action="store_true", default=True, help="Omitir registros con 'error'")
    # HTTP
    ap.add_argument("--http-endpoint", help="URL del endpoint para upload-http")
    ap.add_argument("--batch-size", type=int, default=500, help="Tamaño del lote HTTP")
    ap.add_argument("--timeout", type=int, default=60, help="Timeout HTTP en segundos")
    ap.add_argument("--header", action="append", default=[], help='Headers extra "Clave:Valor" (puede repetirse)')

    args = ap.parse_args()
    raiz = Path(args.directorio)

    # Construir headers si se pasan
    headers = None
    if args.header:
        headers = {}
        for h in args.header:
            if ":" not in h:
                print(f"Ignorando header inválido: {h}", file=sys.stderr)
                continue
            k, v = h.split(":", 1)
            headers[k.strip()] = v.strip()

    registros = iter_registros(raiz)

    if args.modo in ("json", "ndjson"):
        if not args.salida:
            print("--salida es requerido para modo json/ndjson", file=sys.stderr)
            sys.exit(2)
        out = Path(args.salida)
        if not str(out).endswith(".gz"):
            out = Path(str(out) + ".gz")
        if args.modo == "ndjson":
            total = escribir_ndjson_gz(registros, out, skip_errors=args.skip_errors)
        else:
            total = escribir_json_array_gz(registros, out, skip_errors=args.skip_errors)
        print(f"Procesadas {total} boletas. Salida: {out}")
        return

    if args.modo == "upload-http":
        if not args.http_endpoint:
            print("--http-endpoint es requerido para upload-http", file=sys.stderr)
            sys.exit(2)
        up = HttpUploader(args.http_endpoint, batch_size=args.batch_size, timeout=args.timeout, headers=headers)
        total = 0
        for r in registros:
            if args.skip_errors and "error" in r:
                continue
            up.write(r)
        up.flush()
        print(f"Enviadas {up.total} boletas a {args.http_endpoint}")
        return

if __name__ == "__main__":
    main()