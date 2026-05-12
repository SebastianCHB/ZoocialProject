<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdopcionStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $nombreUsuario;
    public string $nombreMascota;
    public string $estado;
    public ?string $nota;

    public function __construct(string $nombreUsuario, string $nombreMascota, string $estado, ?string $nota = null)
    {
        $this->nombreUsuario = $nombreUsuario;
        $this->nombreMascota = $nombreMascota;
        $this->estado        = $estado;
        $this->nota          = $nota;
    }

    public function envelope(): Envelope
    {
        $emoji  = $this->estado === 'aprobado' ? 'Y' : ($this->estado === 'rechazado' ? 'N' : 'Y');
        $label  = $this->estado === 'aprobado' ? 'aprobada' : ($this->estado === 'rechazado' ? 'rechazada' : 'actualizada');
        return new Envelope(subject: "{$emoji} Tu solicitud de adopción fue {$label} – Zoocial");
    }

    public function content(): Content
    {
        return new Content(view: 'emails.adopcion_status');
    }

    public function attachments(): array
    {
        return [];
    }
}
