<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $nombreUsuario;
    public string $resetUrl;

    public function __construct(string $nombreUsuario, string $resetUrl)
    {
        $this->nombreUsuario = $nombreUsuario;
        $this->resetUrl      = $resetUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: ' Recupera tu contraseña – Zoocial');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.reset_password');
    }

    public function attachments(): array
    {
        return [];
    }
}
