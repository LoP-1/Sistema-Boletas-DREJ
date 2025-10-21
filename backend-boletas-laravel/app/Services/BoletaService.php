<?php

namespace App\Services;

use App\Models\Boleta;
use App\Models\Concepto;
use App\Models\Persona;
use Illuminate\Support\Facades\DB;

class BoletaService
{
    // Subir varias boletas
    public function guardarBoletas(array $lista)
    {
        DB::transaction(function() use ($lista) {
            foreach ($lista as $dto) {
                $this->guardarBoleta($dto);
            }
        });
    }

    // Guardar una boleta
    public function guardarBoleta(array $dto)
    {
        // Buscar o crear Persona
        $persona = Persona::firstOrCreate(
            ['documento_identidad' => $dto['documento_identidad']],
            [
                'nombres' => $dto['nombres'],
                'apellidos' => $dto['apellidos'],
                'fecha_nacimiento' => $dto['fecha_nacimiento'] ?? null,
            ]
        );

        // Actualizar si cambió
        $persona->fill([
            'nombres' => $dto['nombres'],
            'apellidos' => $dto['apellidos'],
            'fecha_nacimiento' => $dto['fecha_nacimiento'] ?? null,
        ]);
        $persona->save();

        // Crear boleta
        $boleta = new Boleta([
            // ...todos los campos como en tu DTO...
            'persona_id' => $persona->id,
            // demás campos...
        ]);
        $boleta->save();

        // Conceptos
        if (isset($dto['conceptos']) && is_array($dto['conceptos'])) {
            foreach ($dto['conceptos'] as $c) {
                $concepto = new Concepto([
                    'tipo' => $c['tipo'],
                    'concepto' => $c['concepto'],
                    'monto' => $c['monto'],
                ]);
                $concepto->boleta()->associate($boleta);
                $concepto->save();
            }
        }

        return $boleta;
    }

    // Obtener boleta por ID
    public function obtenerBoleta($id)
    {
        return Boleta::with(['persona', 'conceptos'])->find($id);
    }

    // Editar boleta
    public function editarBoleta($id, array $dto)
    {
        $boleta = Boleta::findOrFail($id);
        $boleta->fill($dto);
        $boleta->save();
        return $boleta;
    }

    // Eliminar boleta
    public function eliminarBoleta($id)
    {
        Boleta::destroy($id);
    }

    // Listar boletas paginadas (formato Spring)
    public function listarBoletasPaginado($page = 0, $size = 30)
    {
        $paginator = Boleta::with(['persona', 'conceptos'])->paginate($size, ['*'], 'page', $page + 1);
        return [
            'content' => $paginator->items(),
            'totalElements' => $paginator->total(),
            'totalPages' => $paginator->lastPage(),
            'size' => $paginator->perPage(),
            'number' => $paginator->currentPage() - 1,
        ];
    }

    // Obtener boletas por persona_id
    public function obtenerBoletasPorPersona($personaId)
    {
        return Boleta::where('persona_id', $personaId)->with('conceptos')->get();
    }

    // Listar todas las boletas
    public function listarBoletas()
    {
        return Boleta::all();
    }
}