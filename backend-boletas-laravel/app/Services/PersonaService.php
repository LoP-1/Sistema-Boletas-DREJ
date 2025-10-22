<?php

namespace App\Services;

use App\Models\Persona;
use Illuminate\Pagination\LengthAwarePaginator;

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

    // Listar todas las personas (entidad)
    public function listarPersonas()
    {
        return Persona::all();
    }

    // Listar todas las personas (DTO)
    public function listarPersonasDTO()
    {
        return Persona::all()->map(fn($p) => $this->toDTO($p));
    }

    // Listar personas paginadas (DTO, formato Spring)
    public function listarPersonasPaginado($page = 0, $size = 30)
    {
        /** @var LengthAwarePaginator $paginator */
        $paginator = Persona::paginate($size, ['*'], 'page', $page + 1);
        return [
            'content' => $paginator->getCollection()->map(fn($p) => $this->toDTO($p))->all(),
            'totalElements' => $paginator->total(),
            'totalPages' => $paginator->lastPage(),
            'size' => $paginator->perPage(),
            'number' => $paginator->currentPage() - 1,
        ];
    }

    // Crear persona (DTO in, DTO out)
    public function crearPersona(array $dto)
    {
        $persona = Persona::create([
            'apellidos' => $dto['apellidos'],
            'nombres' => $dto['nombres'],
            'documento_identidad' => $dto['documentoIdentidad'] ?? $dto['documento_identidad'],
            'fecha_nacimiento' => $dto['fechaNacimiento'] ?? $dto['fecha_nacimiento'] ?? null,
        ]);
        return $this->toDTO($persona);
    }

    // Editar persona (DTO in, DTO out)
    public function editarPersona($id, array $dto)
    {
        $persona = Persona::findOrFail($id);
        $persona->fill([
            'apellidos' => $dto['apellidos'] ?? $persona->apellidos,
            'nombres' => $dto['nombres'] ?? $persona->nombres,
            'documento_identidad' => $dto['documentoIdentidad'] ?? $dto['documento_identidad'] ?? $persona->documento_identidad,
            'fecha_nacimiento' => $dto['fechaNacimiento'] ?? $dto['fecha_nacimiento'] ?? $persona->fecha_nacimiento,
        ]);
        $persona->save();
        return $this->toDTO($persona);
    }

    // Eliminar persona
    public function eliminarPersona($id)
    {
        Persona::destroy($id);
    }

    // Conversión segura a DTO (igual a PersonaDTO record)
    public function toDTO($persona)
    {
        return [
            'id' => $persona->id,
            'apellidos' => $persona->apellidos,
            'nombres' => $persona->nombres,
            'documentoIdentidad' => $persona->documento_identidad,
            'fechaNacimiento' => $persona->fecha_nacimiento ? $persona->fecha_nacimiento->toDateString() : null,
        ];
    }
}