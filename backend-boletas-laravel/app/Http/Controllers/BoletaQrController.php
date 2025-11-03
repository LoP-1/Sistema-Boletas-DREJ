<?php

namespace App\Http\Controllers;

use App\Services\BoletaService;
use Illuminate\Http\Request;

class BoletaQrController extends Controller
{
    private BoletaService $boletaService;

    public function __construct(BoletaService $boletaService)
    {
        $this->boletaService = $boletaService;
    }
    public function show($id)
    {
        //obtiene la boleta por id , sirve para mostrar las boletas y su qr
        $dto = $this->boletaService->obtenerBoleta($id);
        if (!$dto) return response()->json(null, 404);
        return response()->json($dto);
    }
}