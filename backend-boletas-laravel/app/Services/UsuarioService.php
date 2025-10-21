<?php

namespace App\Services;

use App\Models\Usuario;
use App\Models\Persona;
use Illuminate\Support\Facades\Hash;

class UsuarioService
{
    // Registrar usuario
    public function registrarUsuario(array $data)
    {
        $persona = Persona::firstOrCreate(
            ['documento_identidad' => $data['dni']],
            [
                'nombres' => $data['nombre'],
                'apellidos' => $data['apellido'],
                'documento_identidad' => $data['dni'],
            ]
        );

        if (Usuario::where('correo', $data['correo'])->exists()) {
            throw new \Exception('El correo ya está registrado.');
        }

        $usuario = new Usuario([
            'nombre' => $data['nombre'],
            'apellido' => $data['apellido'],
            'correo' => $data['correo'],
            'dni' => $data['dni'],
            'telefono' => $data['telefono'] ?? null,
            'rol' => $data['rol'],
            'estado_cuenta' => false,
            'contrasena' => Hash::make($data['contrasena']),
        ]);
        $usuario->save();
        return $usuario;
    }

    // Buscar usuario por correo
    public function buscarPorCorreo($correo)
    {
        return Usuario::where('correo', $correo)->first();
    }

    // Actualizar estado cuenta
    public function actualizarEstado($id, $nuevoEstado)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->estado_cuenta = $nuevoEstado;
        $usuario->save();
        return $usuario;
    }

    // Listar todos los usuarios
    public function listarTodos()
    {
        return Usuario::all();
    }

    // Actualizar datos
    public function actualizarDatos($id, array $data)
    {
        $usuario = Usuario::findOrFail($id);

        if (isset($data['correo']) && Usuario::where('correo', $data['correo'])->where('id', '!=', $id)->exists()) {
            throw new \Exception('El correo ya está registrado por otro usuario.');
        }

        $usuario->fill($data);
        $usuario->save();
        return $usuario;
    }

    // Eliminar usuario
    public function eliminarUsuario($id)
    {
        Usuario::destroy($id);
    }

    // Cambiar contraseña
    public function cambiarContrasena($id, $nuevaContrasena)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->contrasena = Hash::make($nuevaContrasena);
        $usuario->save();
    }

    // Buscar usuario por ID
    public function buscarPorId($id)
    {
        return Usuario::find($id);
    }
}