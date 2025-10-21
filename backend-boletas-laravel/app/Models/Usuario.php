<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Usuario extends Authenticatable implements JWTSubject
{
    protected $table = 'usuarios'; // Especifica el nombre de la tabla si no es 'users'

    protected $fillable = [
        'nombre',
        'apellido',
        'correo',
        'dni',
        'telefono',
        'rol',
        'estado_cuenta',
        'contrasena',
    ];

    protected $hidden = [
        'contrasena',
        'remember_token',
    ];

    // Métodos requeridos por JWTSubject
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [
            'rol' => $this->rol,
            'dni' => $this->dni,
        ];
    }

    // Para que Laravel use 'contrasena' como password
    public function getAuthPassword()
    {
        return $this->contrasena;
    }
}