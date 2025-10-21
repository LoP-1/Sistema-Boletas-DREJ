<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RegPensionarioDetalleResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'raw' => $this->raw ?? null,
            'afiliacion' => $this->afiliacion ?? null,
        ];
    }
}