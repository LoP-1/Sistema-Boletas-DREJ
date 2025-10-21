<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PersonaResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'apellidos' => $this->apellidos,
            'nombres' => $this->nombres,
            'documento_identidad' => $this->documento_identidad,
            'fecha_nacimiento' => $this->fecha_nacimiento,
        ];
    }
}