<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Concepto extends Model
{
    protected $table = 'conceptos';

    protected $fillable = [
        'tipo',
        'concepto',
        'monto',
        'boleta_id',
    ];

    public function boleta()
    {
        return $this->belongsTo(Boleta::class);
    }
}