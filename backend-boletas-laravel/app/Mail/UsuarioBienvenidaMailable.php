<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

//Cuando un usuario nuevo se registra, se le envia un correo infomando que se le debe aprovar la , el modelo esta en resources/views/emails
class UsuarioBienvenidaMailable extends Mailable
{
    use Queueable, SerializesModels;

    public $usuario;

    public function __construct($usuario)
    {
        $this->usuario = $usuario;
    }

    public function build()
    {
        return $this->subject('¡Bienvenido al sistema de boletas para Cesantes!')
                    ->markdown('emails.usuario_bienvenida');
    }
}