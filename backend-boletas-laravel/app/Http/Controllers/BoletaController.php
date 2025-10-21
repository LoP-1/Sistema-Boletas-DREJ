<?php

namespace App\Http\Controllers;

use App\Models\Boleta;
use Illuminate\Http\Request;

class BoletaController extends Controller
{
    // Subir boletas (array)
    public function subirBoletas(Request $request)
    {
        $boletas = $request->all();
        foreach ($boletas as $boletaData) {
            Boleta::create($boletaData);
        }
        return response()->json('Boletas guardadas correctamente.');
    }

    // Listar boletas
    public function listarBoletas()
    {
        return Boleta::all();
    }

    // Listar boletas por personaId
    public function listarBoletasPersona($personaId)
    {
        $boletas = Boleta::where('persona_id', $personaId)->get();
        return response()->json($boletas);
    }
}