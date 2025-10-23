<?php

namespace App\Services;

use App\Models\Usuario;
use App\Models\Persona;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Http\Request;
use App\Mail\UsuarioBienvenidaMailable;
use App\Mail\AdminNuevoRegistroMailable;
use App\Mail\UsuarioCuentaAprobadaMailable;

class UsuarioService
{
    // Registrar usuario (DTO in, entidad out)
    public function registrarUsuario(array $data)
    {
        \Log::info('Intentando crear persona', ['dni' => $data['dni'], 'nombre' => $data['nombre'], 'apellido' => $data['apellido']]);
        $persona = Persona::firstOrCreate(
            ['documento_identidad' => $data['dni']],
            [
                'nombres' => $data['nombre'],
                'apellidos' => $data['apellido'],
                'documento_identidad' => $data['dni'],
            ]
        );
        \Log::info('Persona creada o encontrada', ['persona_id' => $persona->id, 'documento_identidad' => $persona->documento_identidad]);

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

        // Enviar correo al usuario (bienvenida/pendiente)
        Mail::to($usuario->correo)->send(new UsuarioBienvenidaMailable($usuario));

        // Enviar correo al admin (nuevo registro)
        Mail::to('correo del admin')->send(new AdminNuevoRegistroMailable($usuario));

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
    // Asegura que cualquier valor "1", "true", 1, true, etc. sea true
    $estadoBooleano = filter_var($nuevoEstado, FILTER_VALIDATE_BOOLEAN);

    $usuario = Usuario::findOrFail($id);
    $usuario->estado_cuenta = $estadoBooleano;
    $usuario->save();

    if ($estadoBooleano) {
        \Mail::to($usuario->correo)->send(new \App\Mail\UsuarioCuentaAprobadaMailable($usuario));
    }

    return $usuario;
}

    // Listar todos los usuarios
    public function listarTodos()
    {
        return Usuario::all();
    }

    // Actualizar datos (DTO in, entidad out)
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
    public function cambiarContrasena($id, Request $request)
    {
        $nueva = $request->input('nuevaContrasena');
        if (!$nueva) {
            $nueva = $request->getContent();
            $nueva = trim($nueva, "\"");
        }
        if (!$nueva) {
            return response()->json('Debe enviar la nueva contraseña en el body', 422);
        }
        $usuario = \App\Models\Usuario::findOrFail($id);
        $usuario->contrasena = Hash::make($nueva);
        $usuario->save();
        return response()->json('Contraseña actualizada correctamente');
    }

    // Buscar usuario por ID
    public function buscarPorId($id)
    {
        return Usuario::find($id);
    }
}