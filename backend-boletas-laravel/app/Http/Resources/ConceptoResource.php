<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ConceptoResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'tipo' => $this->tipo,
            'concepto' => $this->concepto,
            'monto' => $this->monto,
        ];
    }
}