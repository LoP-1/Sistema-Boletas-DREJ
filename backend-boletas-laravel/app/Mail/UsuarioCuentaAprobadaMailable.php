<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

//Cuando un usuario nuevo se le aprueba la cuenta se le envia un correo informando, el modelo esta en resources/views/emails
class UsuarioCuentaAprobadaMailable extends Mailable
{
    use Queueable, SerializesModels;

    public $usuario;

    public function __construct($usuario)
    {
        $this->usuario = $usuario;
    }

    public function build()
    {
        return $this->subject('¡Tu cuenta ha sido aprobada!')
                    ->markdown('emails.usuario_cuenta_aprobada');
    }
}