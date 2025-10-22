<?php

namespace App\Http\Controllers;

use App\Services\UsuarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class UsuarioController extends Controller
{
    public function __construct(private UsuarioService $usuarioService) {}

    public function registrar(Request $request)
    {
        $data = $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'correo' => 'required|email|unique:usuarios,correo',
            'dni' => 'required|string|max:30',
            'telefono' => 'nullable|string|max:30',
            'rol' => 'required|string|max:30',
            'contrasena' => 'required|string|min:6',
        ]);
        $usuario = $this->usuarioService->registrarUsuario($data);
        return response()->json($usuario);
    }

    // Login
    public function login(Request $request)
    {
        $credentials = $request->only('correo', 'contrasena');
        $usuario = $this->usuarioService->buscarPorCorreo($credentials['correo']);

        if (!$usuario || !Hash::check($credentials['contrasena'], $usuario->contrasena)) {
            return response('Credenciales inválidas', 401);
        }
        if (!$usuario->estado_cuenta) {
            return response('Cuenta no aprobada', 403);
        }

        $token = JWTAuth::fromUser($usuario);
        return response($token, 200);
    }

    // Actualizar datos del usuario (propietario o admin)
    public function actualizarUsuario($id, Request $request)
    {
        $usuario = $this->usuarioService->actualizarDatos($id, $request->all());
        return response()->json($usuario);
    }

    // Cambiar contraseña (propietario o admin)
    public function cambiarContrasena($id, Request $request)
    {
        // Aquí delega al servicio, que acepta ambos formatos
        return $this->usuarioService->cambiarContrasena($id, $request);
    }

    // Mostrar usuario
    public function obtenerUsuario($id)
    {
        $usuario = $this->usuarioService->buscarPorId($id);
        if (!$usuario) {
            return response()->json(null, 404);
        }
        return response()->json($usuario);
    }
}