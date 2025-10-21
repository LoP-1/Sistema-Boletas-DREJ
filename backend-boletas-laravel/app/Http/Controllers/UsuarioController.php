<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class UsuarioController extends Controller
{
    // Registro
    public function registrar(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'apellido' => 'required|string|max:255',
            'correo' => 'required|email|unique:usuarios,correo',
            'dni' => 'required|string|max:30',
            'telefono' => 'nullable|string|max:30',
            'rol' => 'required|string|max:30',
            'contrasena' => 'required|string|min:6',
        ]);

        $data = $request->all();
        $data['contrasena'] = Hash::make($data['contrasena']);
        $usuario = Usuario::create($data);

        return response()->json($usuario);
    }

    // Login
    public function login(Request $request)
    {
        $credentials = $request->only('correo', 'contrasena');
        $usuario = Usuario::where('correo', $credentials['correo'])->first();

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
        $usuario = Usuario::findOrFail($id);
        // Aquí puedes verificar permisos según tu lógica JWT
        $usuario->update($request->all());
        return response()->json($usuario);
    }

    // Cambiar contraseña (propietario o admin)
    public function cambiarContrasena($id, Request $request)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->contrasena = Hash::make($request->input('nuevaContrasena'));
        $usuario->save();
        return response()->json('Contraseña actualizada correctamente');
    }

    // Mostrar usuario
    public function obtenerUsuario($id)
    {
        $usuario = Usuario::find($id);
        if (!$usuario) {
            return response()->json(null, 404);
        }
        return response()->json($usuario);
    }
}