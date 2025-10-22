<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    protected $table = 'personas';

    protected $fillable = [
        'apellidos',
        'nombres',
        'documento_identidad',
        'fecha_nacimiento',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
    ];

    public function boletas()
    {
        return $this->hasMany(Boleta::class);
    }
}