<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array {
    return [
        'id' => $this->id_animalito,
        'nombre' => $this->nombre,
        'genero' => $this->genero,
        'raza' => $this->raza->raza, // Accede al nombre de la raza
        'especie' => $this->raza->especie->nombre,
        'fotos' => $this->fotos,
    ];
}
}
