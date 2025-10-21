<?php

namespace App\Http\Controllers;

use App\Models\Boleta;
use Illuminate\Http\Request;

class BoletaQrController extends Controller
{
    // Obtener boleta por id (QR)
    public function show($id)
    {
        $boleta = Boleta::find($id);
        if (!$boleta) return response()->json(null, 404);
        return response()->json($boleta);
    }
}