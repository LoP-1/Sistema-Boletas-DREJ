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

    // Listar todas las boletas paginadas (si tu front espera Page<BoletaDTO>, mapea como en el service)
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

    // Subir/crear varias boletas -> usa Service (crea Persona y Conceptos)
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
        $size = (int) $request->get('size', 30);
        $personas = Persona::paginate($size);
        // Si tu front espera formato Page de Spring, mapea igual que en PersonaService->listarPersonasPaginado
        return response()->json([
            'content' => $personas->items(),
            'totalElements' => $personas->total(),
            'totalPages' => $personas->lastPage(),
            'size' => $personas->perPage(),
            'number' => $personas->currentPage() - 1,
        ]);
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