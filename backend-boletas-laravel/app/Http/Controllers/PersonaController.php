<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use Illuminate\Http\Request;

class PersonaController extends Controller
{
    // Obtener persona por DNI
    public function obtenerPersonaDni($dni)
    {
        $persona = Persona::where('dni', $dni)->first();
        if (!$persona) return response()->json(null, 404);
        return response()->json($persona);
    }
}