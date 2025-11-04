<?php

namespace App\Http\Controllers;

use App\Models\Boleta;
use App\Models\Persona;
use App\Models\Usuario;
use App\Services\BoletaService;
use Illuminate\Http\Request;
use App\Services\UsuarioService;

class AdminController extends Controller
{
    public function __construct(private BoletaService $boletaService) {}

    // --- BOLETAS (ADMIN) ---
    // Listar todas las boletas paginadas
    public function listarBoletas(Request $request)
    {
        $page = (int) $request->get('page', 0);
        $size = (int) $request->get('size', 30);
        $pageData = $this->boletaService->listarBoletasPaginado($page, $size);
        return response()->json($pageData);
    }

    // Listar boletas de una persona por id
    public function listarBoletasPorPersona($personaId)
    {
        $boletas = $this->boletaService->obtenerBoletasPorPersona($personaId);
        return response()->json($boletas);
    }

    // Subir/crear varias boletas
    public function subirBoletas(Request $request)
    {
        $boletas = $request->all();
        $this->boletaService->guardarBoletas($boletas);
        return response()->json(true);
    }

    // Editar boleta
    public function editarBoleta($id, Request $request)
    {
        $boleta = $this->boletaService->editarBoleta($id, $request->all());
        return response()->json($boleta);
    }

    // Eliminar boleta
    public function eliminarBoleta($id)
    {
        $this->boletaService->eliminarBoleta($id);
        return response()->json(true);
    }

    // --- PERSONAS (ADMIN) ---
    public function listarPersonas(Request $request)
    {
        $personas = Persona::all();
        return response()->json([
            'content' => $personas->values()->all(),
            'totalElements' => $personas->count(),
            'totalPages' => 1,
            'size' => $personas->count(),
            'number' => 0,
        ]);
    }

    //crear una persona
    public function crearPersona(Request $request)
    {
        $persona = Persona::create($request->all());
        return response()->json($persona);
    }

    //editar una persona
    public function editarPersona($id, Request $request)
    {
        $persona = Persona::findOrFail($id);
        $persona->update($request->all());
        return response()->json($persona);
    }
    //elimina una persona
    public function eliminarPersona($id)
    {
        Persona::destroy($id);
        return response()->json(true);
    }

    // --- USUARIOS (ADMIN) ---
    public function listarUsuarios()
    {
        $usuarios = \App\Models\Usuario::all()->map(function ($u) {
            return [
                'id' => $u->id,
                'nombre' => $u->nombre,
                'apellido' => $u->apellido,
                'correo' => $u->correo,
                'dni' => $u->dni,
                'telefono' => $u->telefono,
                'rol' => $u->rol,
                'estadoCuenta' => (bool)$u->estado_cuenta,
                'created_at' => $u->created_at,
                'updated_at' => $u->updated_at,
            ];
        });
        return response()->json($usuarios);
    }

    //actualiza el estado de la persona (permite acceder al sistema)
    public function cambiarEstado($id, Request $request)
    {
        $nuevoEstado = $request->json()->all();
        if (is_array($nuevoEstado) && count($nuevoEstado) === 1 && array_key_exists(0, $nuevoEstado)) {
            $nuevoEstado = $nuevoEstado[0];
        } elseif (is_array($nuevoEstado) && isset($nuevoEstado['nuevo_estado'])) {
            $nuevoEstado = $nuevoEstado['nuevo_estado'];
        } elseif (is_array($nuevoEstado) && isset($nuevoEstado['nuevoEstado'])) {
            $nuevoEstado = $nuevoEstado['nuevoEstado'];
        }
        if (!in_array($nuevoEstado, [0, 1, true, false, '0', '1'], true)) {
            return response()->json(['error' => 'Debe enviar un estado booleano'], 422);
        }

        $usuario = $this->usuarioService->actualizarEstado($id, $nuevoEstado);
        return response()->json($usuario);
    }
}