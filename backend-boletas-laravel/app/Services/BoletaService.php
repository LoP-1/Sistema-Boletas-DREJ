<?php

namespace App\Services;

use App\Models\Boleta;
use App\Models\Concepto;
use App\Models\Persona;
use Illuminate\Support\Facades\DB;

class BoletaService
{
    // Subir varias boletas (DTOs)
    public function guardarBoletas(array $lista)
    {
        DB::transaction(function() use ($lista) {
            foreach ($lista as $dto) {
                $this->guardarBoleta($dto);
            }
        });
    }

    // Guardar una boleta (DTO in, BoletaDTO out)
    public function guardarBoleta(array $dto)
    {
        // VALIDACIÓN: documento_identidad es obligatorio
        if (empty($dto['documento_identidad'])) {
            throw new \InvalidArgumentException('El campo documento_identidad es obligatorio');
        }

        // Buscar o crear Persona
        $fechaNac = $dto['fecha_nacimiento'] ?? null;

        $persona = Persona::firstOrCreate(
            ['documento_identidad' => $dto['documento_identidad']],
            [
                'nombres' => $dto['nombres'] ?? '',
                'apellidos' => $dto['apellidos'] ?? '',
                'fecha_nacimiento' => $this->parseFecha($fechaNac),
            ]
        );

        $persona->fill([
            'nombres' => $dto['nombres'] ?? $persona->nombres,
            'apellidos' => $dto['apellidos'] ?? $persona->apellidos,
            'fecha_nacimiento' => $this->parseFecha($fechaNac) ?? $persona->fecha_nacimiento,
        ]);
        $persona->save();

        // Crear boleta
        $boletaData = [
            'archivo_origen' => $dto['archivo_origen'] ?? null,
            'raw_length' => $dto['raw_length'] ?? null,
            'secuencia' => $dto['secuencia'] ?? null,
            'codigo_encabezado' => $dto['codigo_encabezado'] ?? null,
            'ruc_bloque' => $dto['ruc_bloque'] ?? null,
            'mes' => $dto['mes'] ?? null,
            'anio' => $dto['anio'] ?? null,
            'estado' => $dto['estado'] ?? null,
            'establecimiento' => $dto['establecimiento'] ?? null,
            'cargo' => $dto['cargo'] ?? null,
            'tipo_servidor' => $dto['tipo_servidor'] ?? null,
            'tipo_pensionista' => $dto['tipo_pensionista'] ?? null,
            'tipo_pension' => $dto['tipo_pension'] ?? null,
            'nivel_mag_horas' => $dto['nivel_mag_horas'] ?? null,
            'tiempo_servicio' => $dto['tiempo_servicio'] ?? null,
            'leyenda_permanente' => $dto['leyenda_permanente'] ?? null,
            'leyenda_mensual' => $dto['leyenda_mensual'] ?? null,
            'fecha_ingreso_registro' => $dto['fecha_ingreso_registro'] ?? null,
            'fecha_termino_registro' => $dto['fecha_termino_registro'] ?? null,
            'cuenta_principal' => $dto['cuenta_principal'] ?? null,
            'cuentas_todas' => $dto['cuentas_todas'] ?? [],
            'reg_pensionario_detalle' => $dto['reg_pensionario_detalle'] ?? null,
            'regimen_pensionario' => $dto['regimen_pensionario'] ?? null,
            'total_remuneraciones' => $dto['total_remuneraciones'] ?? null,
            'total_descuentos' => $dto['total_descuentos'] ?? null,
            'total_liquido' => $dto['total_liquido'] ?? null,
            'monto_imponible' => $dto['monto_imponible'] ?? null,
            'persona_id' => $persona->id,
        ];

        $boleta = new Boleta($boletaData);
        $boleta->save();

        // Conceptos
        if (isset($dto['conceptos']) && is_array($dto['conceptos'])) {
            foreach ($dto['conceptos'] as $c) {
                $concepto = new Concepto([
                    'tipo' => $c['tipo'] ?? '',
                    'concepto' => $c['concepto'] ?? '',
                    'monto' => $c['monto'] ?? 0,
                ]);
                $concepto->boleta()->associate($boleta);
                $concepto->save();
            }
        }

        return $this->toBoletaDTO($boleta->fresh(['persona', 'conceptos']));
    }

    // Obtener boleta por ID (BoletaDTO)
    public function obtenerBoleta($id)
    {
        $boleta = Boleta::with(['persona', 'conceptos'])->find($id);
        return $boleta ? $this->toBoletaDTO($boleta) : null;
    }

    // Editar boleta (BoletaDTO in, BoletaDTO out)
    public function editarBoleta($id, array $dto)
    {
        $boleta = Boleta::findOrFail($id);
        $boleta->fill($dto);
        $boleta->save();
        return $this->toBoletaDTO($boleta->fresh(['persona', 'conceptos']));
    }

    // Eliminar boleta
    public function eliminarBoleta($id)
    {
        Boleta::destroy($id);
    }

    // Listar boletas paginadas (formato Spring, BoletaDTOs)
    public function listarBoletasPaginado($page = 0, $size = 30)
    {
        $paginator = Boleta::with(['persona', 'conceptos'])->paginate($size, ['*'], 'page', $page + 1);
        return [
            'content' => $paginator->getCollection()->map(fn($b) => $this->toBoletaDTO($b))->all(),
            'totalElements' => $paginator->total(),
            'totalPages' => $paginator->lastPage(),
            'size' => $paginator->perPage(),
            'number' => $paginator->currentPage() - 1,
        ];
    }

    // Obtener boletas por persona_id (BoletaDTOs)
    public function obtenerBoletasPorPersona($personaId)
    {
        return Boleta::where('persona_id', $personaId)->with('conceptos')->get()->map(fn($b) => $this->toBoletaDTO($b));
    }

    // Listar todas las boletas (BoletaDTOs)
    public function listarBoletas()
    {
        return Boleta::with(['persona', 'conceptos'])->get()->map(fn($b) => $this->toBoletaDTO($b));
    }

    // Convertir a DTO (idéntico a record BoletaDTO)
    public function toBoletaDTO($boleta)
    {
        $persona = $boleta->persona;
        return [
            'id' => $boleta->id,
            'archivo_origen' => $boleta->archivo_origen,
            'raw_length' => $boleta->raw_length,
            'conceptos' => $boleta->conceptos->map(fn($c) => [
                'tipo' => $c->tipo,
                'concepto' => $c->concepto,
                'monto' => $c->monto,
            ])->all(),
            'secuencia' => $boleta->secuencia,
            'codigo_encabezado' => $boleta->codigo_encabezado,
            'ruc_bloque' => $boleta->ruc_bloque,
            'mes' => $boleta->mes,
            'anio' => $boleta->anio,
            'estado' => $boleta->estado,
            'apellidos' => $persona?->apellidos,
            'nombres' => $persona?->nombres,
            'fecha_nacimiento' => $persona?->fecha_nacimiento ? (string)$persona->fecha_nacimiento : null,
            'documento_identidad' => $persona?->documento_identidad,
            'establecimiento' => $boleta->establecimiento,
            'cargo' => $boleta->cargo,
            'tipo_servidor' => $boleta->tipo_servidor,
            'tipo_pensionista' => $boleta->tipo_pensionista,
            'tipo_pension' => $boleta->tipo_pension,
            'nivel_mag_horas' => $boleta->nivel_mag_horas,
            'tiempo_servicio' => $boleta->tiempo_servicio,
            'leyenda_permanente' => $boleta->leyenda_permanente,
            'leyenda_mensual' => $boleta->leyenda_mensual,
            'fecha_ingreso_registro' => $boleta->fecha_ingreso_registro,
            'fecha_termino_registro' => $boleta->fecha_termino_registro,
            'cuenta_principal' => $boleta->cuenta_principal,
            'cuentas_todas' => $boleta->cuentas_todas,
            'reg_pensionario_detalle' => $boleta->reg_pensionario_detalle,
            'regimen_pensionario' => $boleta->regimen_pensionario,
            'total_remuneraciones' => $boleta->total_remuneraciones,
            'total_descuentos' => $boleta->total_descuentos,
            'total_liquido' => $boleta->total_liquido,
            'monto_imponible' => $boleta->monto_imponible,
        ];
    }

    private function parseFecha($fecha)
    {
        if (empty($fecha)) return null;
        if (strpos($fecha, '/') !== false) {
            // dd/MM/yyyy → yyyy-MM-dd
            $partes = explode('/', $fecha);
            if (count($partes) === 3) {
                return $partes[2] . '-' . $partes[1] . '-' . $partes[0];
            }
        }
        // Si ya viene yyyy-MM-dd, la retorna tal cual
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
            return $fecha;
        }
        return null;
    }
}