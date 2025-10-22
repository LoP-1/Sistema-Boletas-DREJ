<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Boleta extends Model
{
    protected $table = 'boletas';

    protected $fillable = [
        'archivo_origen',
        'raw_length',
        'secuencia',
        'codigo_encabezado',
        'ruc_bloque',
        'mes',
        'anio',
        'estado',
        'establecimiento',
        'cargo',
        'tipo_servidor',
        'tipo_pensionista',
        'tipo_pension',
        'nivel_mag_horas',
        'tiempo_servicio',
        'leyenda_permanente',
        'leyenda_mensual',
        'fecha_ingreso_registro',
        'fecha_termino_registro',
        'cuenta_principal',
        'cuentas_todas',
        'reg_pensionario_detalle',
        'regimen_pensionario',
        'total_remuneraciones',
        'total_descuentos',
        'total_liquido',
        'monto_imponible',
        'persona_id',
    ];

    protected $casts = [
        'cuentas_todas' => 'array',
        'reg_pensionario_detalle' => 'array',
    ];

    public function persona()
    {
        return $this->belongsTo(Persona::class);
    }

    public function conceptos()
    {
        return $this->hasMany(Concepto::class);
    }
}