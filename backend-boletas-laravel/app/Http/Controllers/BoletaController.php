<?php

namespace App\Http\Controllers;

use App\Services\BoletaService;
use Illuminate\Http\Request;

class BoletaController extends Controller
{
    public function __construct(private BoletaService $boletaService) {}

    //llama al servicio para subir las boletas
    public function subirBoletas(Request $request)
    {
        $boletas = $request->all();
        $this->boletaService->guardarBoletas($boletas);
        return response()->json('Boletas guardadas correctamente.');
    }
    //lista todas las boletas
    public function listarBoletas()
    {
        return response()->json($this->boletaService->listarBoletas());
    }
    //encuentra todas las boletas de una persona
    public function listarBoletasPersona($personaId)
    {
        return response()->json($this->boletaService->obtenerBoletasPorPersona($personaId));
    }
}