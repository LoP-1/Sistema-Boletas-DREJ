<?php

namespace App\Http\Controllers;

use App\Models\Boleta;
use App\Models\Persona;
use App\Models\Usuario;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // --- BOLETAS (ADMIN) ---

    // Listar todas las boletas paginadas
    public function listarBoletas(Request $request)
    {
        $size = $request->get('size', 30);
        $boletas = Boleta::paginate($size);
        return response()->json($boletas);
    }

    // Listar boletas de una persona por id
    public function listarBoletasPorPersona($personaId)
    {
        $boletas = Boleta::where('persona_id', $personaId)->get();
        return response()->json($boletas);
    }

    // Subir/crear varias boletas
    public function subirBoletas(Request $request)
    {
        $boletas = $request->all();
        foreach ($boletas as $boletaData) {
            Boleta::create($boletaData);
        }
        return response()->json(true);
    }

    // Editar boleta
    public function editarBoleta($id, Request $request)
    {
        $boleta = Boleta::findOrFail($id);
        $boleta->update($request->all());
        return response()->json($boleta);
    }

    // Eliminar boleta
    public function eliminarBoleta($id)
    {
        Boleta::destroy($id);
        return response()->json(true);
    }

    // --- PERSONAS (ADMIN) ---
    public function listarPersonas(Request $request)
    {
        $size = $request->get('size', 30);
        $personas = Persona::paginate($size);
        return response()->json($personas);
    }

    public function crearPersona(Request $request)
    {
        $persona = Persona::create($request->all());
        return response()->json($persona);
    }

    public function editarPersona($id, Request $request)
    {
        $persona = Persona::findOrFail($id);
        $persona->update($request->all());
        return response()->json($persona);
    }

    public function eliminarPersona($id)
    {
        Persona::destroy($id);
        return response()->json(true);
    }

    // --- USUARIOS (ADMIN) ---

    public function listarUsuarios()
    {
        return response()->json(Usuario::all());
    }

    public function cambiarEstado($id, Request $request)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->estado_cuenta = $request->input('nuevoEstado');
        $usuario->save();
        return response()->json($usuario);
    }
}