<?php

namespace App\Http\Controllers;

use App\Models\Persona;

class PersonaController extends Controller
{
    //obtiene la persona por dni
    public function obtenerPersonaDni($dni)
    {
        $persona = Persona::where('documento_identidad', $dni)->first();
        if (!$persona) {
            return response()->json(null, 404);
        }
        return response()->json($persona);
    }
}