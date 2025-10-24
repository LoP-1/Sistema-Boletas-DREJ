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
        if (!empty($usuario->correo) && filter_var($usuario->correo, FILTER_VALIDATE_EMAIL)) {
            Mail::to($usuario->correo)->send(new UsuarioBienvenidaMailable($usuario));
        }

        // Enviar correo al admin (nuevo registro)
        $adminMail = env('MAIL_ADMIN', 'admin@tu-dominio.com');
        if (!empty($adminMail) && filter_var($adminMail, FILTER_VALIDATE_EMAIL)) {
            Mail::to($adminMail)->send(new AdminNuevoRegistroMailable($usuario));
        }

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
    $estadoBooleano = filter_var($nuevoEstado, FILTER_VALIDATE_BOOLEAN);
    $usuario = Usuario::findOrFail($id);
    $usuario->estado_cuenta = $estadoBooleano;
    $usuario->save();

    \Log::info('Intentando enviar correo de cuenta aprobada', [
        'usuario_id' => $usuario->id,
        'correo' => $usuario->correo,
        'estadoBooleano' => $estadoBooleano
    ]);

    if ($estadoBooleano && !empty($usuario->correo) && filter_var($usuario->correo, FILTER_VALIDATE_EMAIL)) {
        try {
            Mail::to($usuario->correo)->send(new UsuarioCuentaAprobadaMailable($usuario));
            \Log::info('Correo de cuenta aprobada enviado correctamente', [
                'usuario_id' => $usuario->id,
                'correo' => $usuario->correo
            ]);
        } catch (\Exception $e) {
            \Log::error('Error enviando correo de cuenta aprobada', [
                'usuario_id' => $usuario->id,
                'correo' => $usuario->correo,
                'error' => $e->getMessage()
            ]);
        }
    } else {
        \Log::warning('No se envió correo de cuenta aprobada: correo inválido o estado no aprobado', [
            'usuario_id' => $usuario->id,
            'correo' => $usuario->correo,
            'estadoBooleano' => $estadoBooleano
        ]);
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