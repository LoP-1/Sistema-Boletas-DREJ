#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Parser de boletas .lis (UGEL / DRE) para extraer datos estructurados.

Uso:
  python parse_boletas.py archivos/*.lis --salida boletas.json --formato json
  python parse_boletas.py activo-concepcion.lis "Boleta Cesantes.lis" --formato csv --salida boletas.csv

Notas:
 - El script intenta ser robusto ante ligeras variaciones de formato.
 - Los conceptos entre las líneas de ===== se capturan (+ y -).
 - Los totales (T-REMUN, T-DSCTO, T-LIQUI, MImponible) se parsean si están presentes.
"""

import re
import json
import csv
import argparse
from pathlib import Path
from typing import List, Dict, Any, Optional

# Regex helpers
RE_START = re.compile(r'(^|\n)DRE JUNIN[^\n]*', re.MULTILINE)
RE_END_NUMBER = re.compile(r'\n\s{0,100}(?P<seq>0{4,}\d+)\n\.\s*\n?')  # Captura el número final y el punto
RE_FIELD = re.compile(r'^([A-ZÁÉÍÓÚÑ./ ]+):\s*(.*)$')
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
RE_TIEMPO_SERV = re.compile(r'Tiempo de Servicio.*:\s*([0-9\-]{2,}|--)')
RE_FECHA_REG = re.compile(r'Fecha de Registro\s*:\s*Ingr\.:(\d{2}/\d{2}/\d{4})\s+Termino:(\d{2}/\d{2}/\d{4})')
RE_FECHA_REG_ALT = re.compile(r'Fecha de Registro\s*:\s*Cese\s*:\s*Termino:(\d{2}/\d{2}/\d{4})')
RE_CTA = re.compile(r'Cta\. TeleAhorro o Nro\. Cheque:\s*(.*)')
RE_LEYENDA_PERM = re.compile(r'Leyenda Permanente\s*:\s*(.*)')
RE_LEYENDA_MENS = re.compile(r'Leyenda Mensual\s*:\s*(.*)')
RE_REGIMEN = re.compile(r'Regimen Pensionario\s*:\s*(.*)')
RE_REG_PENS_DET_BLOCK = re.compile(r'Reg\.?Pensionario\s*:\s*(.+?)(?:\n[A-Z]|$)', re.DOTALL)
RE_AFILIACION = re.compile(r'FAfiliacion\s*:\s*([0-9]{2}/[0-9]{2}/[0-9]{4})')
RE_CONCEPT_LINE = re.compile(r'^[ \t]*([+-])([A-Za-z0-9ÁÉÍÓÚÑ./ %_]+)\s+([\d.,]+)\s*$', re.MULTILINE)
RE_TOTALS = re.compile(r'T-REMUN\s+([\d.,]+)\s+T-DSCTO\s+([\d.,]+)\s+T-LIQUI\s+([\d.,]+)')
RE_MIMP = re.compile(r'MImponible\s+([\d.,]+)')

def limpiar_monto(txt: str) -> float:
    txt = txt.strip().replace(',', '')
    try:
        return float(txt)
    except ValueError:
        return 0.0

def partir_boletas(contenido: str) -> List[str]:
    """
    Divide el archivo en boletas usando el patrón de número final y/o inicio.
    """
    trabajo = contenido
    indices = []
    for match in RE_END_NUMBER.finditer(trabajo):
        end_idx = match.end()
        indices.append((match.start(), end_idx))
    if not indices:
        partes = RE_START.split(trabajo)
        partes = [p.strip() for p in partes if p.strip().startswith('DRE JUNIN')]
        return partes

    boletas = []
    last_start = 0
    for (start_num, end_num) in indices:
        prev_dre = trabajo.rfind('DRE JUNIN', last_start, start_num)
        if prev_dre == -1:
            prev_dre = last_start
        fragment = trabajo[prev_dre:end_num]
        if fragment.strip():
            boletas.append(fragment.strip())
        last_start = end_num
    return boletas

def extraer_conceptos(bloque: str) -> List[Dict[str, Any]]:
    """
    Extrae TODAS las líneas de conceptos entre las líneas de =====
    """
    conceptos = []
    secciones = [m.start() for m in re.finditer(r'^=+\s*$', bloque, re.MULTILINE)]
    if len(secciones) >= 2:
        sub = bloque[secciones[0]:secciones[-1]]
        for m in re.finditer(r'([+-])([A-Za-z0-9ÁÉÍÓÚÑ./ _%]+)\s+([\d.,]+)', sub):
            signo, nombre, monto_txt = m.groups()
            conceptos.append({
                "tipo": "ingreso" if signo == '+' else "descuento",
                "concepto": nombre.strip(),
                "monto": limpiar_monto(monto_txt)
            })
    return conceptos

def extraer_reg_pensionario(bloque: str) -> Dict[str, Any]:
    datos = {}
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

    # Número secuencial
    seq = RE_END_NUMBER.search(bloque)
    if seq:
        d["secuencia"] = seq.group('seq')

    # Encabezado (códigos: CF..., CL..., etc.)
    primera_linea = bloque.splitlines()[0]
    code_match = re.search(r'(CF|CL|CG)\d+[A-Z0-9]*', primera_linea)
    if code_match:
        d["codigo_encabezado"] = code_match.group(0)

    # RUC / cadena con códigos
    ruc_line = re.search(r'RUC\s*-\s*\d+\s+[0-9\-A-Z]+', bloque)
    if ruc_line:
        d["ruc_bloque"] = ruc_line.group(0)

    # Periodo (ej: DICIEMBRE - 2015)
    MESES = "ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SETIEMBRE|SEPTIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE"
    RE_PERIODO = re.compile(rf'({MESES})\s*-\s*(\d{{4}})', re.IGNORECASE)
    periodo = RE_PERIODO.search(bloque)
    if periodo:
        d["mes"] = periodo.group(1).capitalize()
        d["anio"] = periodo.group(2)

    # Estado (palabra Activo / Habilitado)
    estado = re.search(r'\(\d+\)\s+([A-Za-zÁÉÍÓÚÑ]+)', bloque)
    if estado:
        d["estado"] = estado.group(1)

    def extract_single(regex, key):
        m = regex.search(bloque)
        if m:
            d[key] = m.group(1).strip()

    extract_single(RE_APELLIDOS, "apellidos")
    extract_single(RE_NOMBRES, "nombres")
    extract_single(RE_FECHA_NAC, "fecha_nacimiento")
    extract_single(RE_DOC, "documento_identidad")
    extract_single(RE_ESTAB, "establecimiento")
    extract_single(RE_CARGO, "cargo")
    extract_single(RE_TIPO_SERV, "tipo_servidor")
    extract_single(RE_TIPO_PENS, "tipo_pensionista")
    extract_single(RE_TIPO_PENSION, "tipo_pension")
    extract_single(RE_NIV_MAG, "nivel_mag_horas")
    extract_single(RE_TIEMPO_SERV, "tiempo_servicio")
    extract_single(RE_LEYENDA_PERM, "leyenda_permanente")
    # Leyenda Mensual - solo si no es vacía ni igual
    m = RE_LEYENDA_MENS.search(bloque)
    if m:
        leyenda = m.group(1).strip()
        if leyenda and not re.match(r'^=+$', leyenda) and not re.match(r'^[\s=]*$', leyenda):
            d["leyenda_mensual"] = leyenda
    extract_single(RE_REGIMEN, "regimen_pensionario")

    # Fechas ingreso / término
    mfr = RE_FECHA_REG.search(bloque)
    if mfr:
        d["fecha_ingreso_registro"] = mfr.group(1)
        d["fecha_termino_registro"] = mfr.group(2)
    else:
        mfr_alt = RE_FECHA_REG_ALT.search(bloque)
        if mfr_alt:
            d["fecha_termino_registro"] = mfr_alt.group(1)

    # Cuenta (si hay varias, tomamos la primera y listamos todas)
    cuentas = RE_CTA.findall(bloque)
    if cuentas:
        d["cuenta_principal"] = cuentas[0].strip()
        d["cuentas_todas"] = [c.strip() for c in cuentas]

    # Régimen detallado (afiliación AFP etc.)
    reg_det = extraer_reg_pensionario(bloque)
    if reg_det:
        d["reg_pensionario_detalle"] = reg_det

    # Conceptos
    d["conceptos"] = extraer_conceptos(bloque)

    # Totales
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
    resultado = []
    for b in boletas:
        try:
            resultado.append(parse_boleta(b, ruta.name))
        except Exception as e:
            resultado.append({
                "archivo_origen": ruta.name,
                "error": str(e),
                "fragmento_inicial": b[:200]
            })
    return resultado

def escribir_json(registros: List[Dict[str, Any]], destino: Path):
    with destino.open('w', encoding='utf-8') as f:
        json.dump(registros, f, ensure_ascii=False, indent=2)

def escribir_csv(registros: List[Dict[str, Any]], destino: Path):
    campos_basicos = set()
    for r in registros:
        for k, v in r.items():
            if k not in ("conceptos", "reg_pensionario_detalle"):
                campos_basicos.add(k)
    columnas = sorted(campos_basicos)

    with destino.open('w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(columnas + ["conceptos_json"])
        for r in registros:
            fila = [r.get(c, "") for c in columnas]
            fila.append(json.dumps(r.get("conceptos", []), ensure_ascii=False))
            writer.writerow(fila)

def main():
    parser = argparse.ArgumentParser(description="Parser de boletas .lis")
    parser.add_argument('archivos', nargs='+', help='Rutas de archivos .lis')
    parser.add_argument('--salida', '-o', help='Archivo de salida (json o csv)', required=True)
    parser.add_argument('--formato', '-f', choices=['json', 'csv'], default='json')
    args = parser.parse_args()

    todas: List[Dict[str, Any]] = []
    for ruta in args.archivos:
        p = Path(ruta)
        if not p.exists():
            print(f"[ADVERTENCIA] No existe: {p}")
            continue
        registros = procesar_archivo(p)
        todas.extend(registros)

    out = Path(args.salida)
    if args.formato == 'json':
        escribir_json(todas, out)
    else:
        escribir_csv(todas, out)

    print(f"Procesadas {len(todas)} boletas. Salida: {out}")

if __name__ == '__main__':
    main()