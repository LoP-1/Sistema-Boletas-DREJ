<?php

namespace App\Services;

use App\Models\Persona;

class PersonaService
{
    // Buscar persona por DNI
    public function buscarPersonaDni($dni)
    {
        return Persona::where('documento_identidad', $dni)->first();
    }

    // Buscar persona por ID
    public function buscarPersonaId($id)
    {
        return Persona::find($id);
    }

    // Listar todas las personas
    public function listarPersonas()
    {
        return Persona::all();
    }

    // Listar personas paginadas (formato Spring)
    public function listarPersonasPaginado($page = 0, $size = 30)
    {
        $paginator = Persona::paginate($size, ['*'], 'page', $page + 1);
        return [
            'content' => $paginator->items(),
            'totalElements' => $paginator->total(),
            'totalPages' => $paginator->lastPage(),
            'size' => $paginator->perPage(),
            'number' => $paginator->currentPage() - 1,
        ];
    }

    // Crear persona
    public function crearPersona(array $data)
    {
        return Persona::create($data);
    }

    // Editar persona
    public function editarPersona($id, array $data)
    {
        $persona = Persona::findOrFail($id);
        $persona->fill($data);
        $persona->save();
        return $persona;
    }

    // Eliminar persona
    public function eliminarPersona($id)
    {
        Persona::destroy($id);
    }
}