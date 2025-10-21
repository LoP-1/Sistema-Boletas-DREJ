<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class BoletaResource extends JsonResource
{
    public function toArray($request)
    {
        // Si reg_pensionario_detalle es array/objeto, lo formateamos usando el resource
        $regPensionario = $this->reg_pensionario_detalle
            ? new RegPensionarioDetalleResource((object)$this->reg_pensionario_detalle)
            : null;

        return [
            'id' => $this->id,
            'archivo_origen' => $this->archivo_origen,
            'raw_length' => $this->raw_length,
            'conceptos' => ConceptoResource::collection($this->whenLoaded('conceptos')),
            'secuencia' => $this->secuencia,
            'codigo_encabezado' => $this->codigo_encabezado,
            'ruc_bloque' => $this->ruc_bloque,
            'mes' => $this->mes,
            'anio' => $this->anio,
            'estado' => $this->estado,
            'apellidos' => $this->persona?->apellidos,
            'nombres' => $this->persona?->nombres,
            'fecha_nacimiento' => $this->persona?->fecha_nacimiento,
            'documento_identidad' => $this->persona?->documento_identidad,
            'establecimiento' => $this->establecimiento,
            'cargo' => $this->cargo,
            'tipo_servidor' => $this->tipo_servidor,
            'tipo_pensionista' => $this->tipo_pensionista,
            'tipo_pension' => $this->tipo_pension,
            'nivel_mag_horas' => $this->nivel_mag_horas,
            'tiempo_servicio' => $this->tiempo_servicio,
            'leyenda_permanente' => $this->leyenda_permanente,
            'leyenda_mensual' => $this->leyenda_mensual,
            'fecha_ingreso_registro' => $this->fecha_ingreso_registro,
            'fecha_termino_registro' => $this->fecha_termino_registro,
            'cuenta_principal' => $this->cuenta_principal,
            'cuentas_todas' => $this->cuentas_todas,
            'reg_pensionario_detalle' => $regPensionario,
            'regimen_pensionario' => $this->regimen_pensionario,
            'total_remuneraciones' => $this->total_remuneraciones,
            'total_descuentos' => $this->total_descuentos,
            'total_liquido' => $this->total_liquido,
            'monto_imponible' => $this->monto_imponible,
        ];
    }
}