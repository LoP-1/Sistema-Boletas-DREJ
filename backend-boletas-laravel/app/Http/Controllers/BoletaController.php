<?php

namespace App\Http\Controllers;

use App\Services\BoletaService;
use Illuminate\Http\Request;

class BoletaController extends Controller
{
    public function __construct(private BoletaService $boletaService) {}

    public function subirBoletas(Request $request)
    {
        $boletas = $request->all();
        $this->boletaService->guardarBoletas($boletas);
        return response()->json('Boletas guardadas correctamente.');
    }

    public function listarBoletas()
    {
        return response()->json($this->boletaService->listarBoletas());
    }

    public function listarBoletasPersona($personaId)
    {
        return response()->json($this->boletaService->obtenerBoletasPorPersona($personaId));
    }
}