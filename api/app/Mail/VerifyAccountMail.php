<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerifyAccountMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $nombreUsuario;
    public string $verifyUrl;

    public function __construct(string $nombreUsuario, string $verifyUrl)
    {
        $this->nombreUsuario = $nombreUsuario;
        $this->verifyUrl     = $verifyUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Bienvenido a Zoocial – Verifica tu cuenta');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.verify_account');
    }

    public function attachments(): array
    {
        return [];
    }
}
