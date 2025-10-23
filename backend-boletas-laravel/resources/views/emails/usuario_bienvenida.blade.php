<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>¡Bienvenido!</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #f7fafc; color: #2d3748; }
    .container { max-width: 480px; margin: 30px auto; background: #fff; border-radius: 16px; box-shadow: 0 8px 32px #0001; padding: 32px 24px; }
    .logo { display: block; margin: 0 auto 20px auto; height: 64px; }
    .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center;}
  </style>
</head>
<body>
  <div class="container">
    <img src="{{ asset('logo-drej.png') }}" alt="Logo DREJ" class="logo">
    <h2>¡Bienvenido{{ isset($usuario->nombre) ? ', ' . $usuario->nombre : '' }}!</h2>
    <p>
      Gracias por registrarte en el <b>Sistema de Boletas DREJ</b>.<br>
      Tu cuenta está en proceso de revisión y pronto será activada.<br>
      Te avisaremos por este medio cuando puedas acceder.
    </p>
    @if($usuario->dni)
      <p>
        <b>DNI:</b> {{ $usuario->dni }}
      </p>
    @endif
    <p>Si tienes dudas, responde a este correo.</p>
    <div class="footer">
      Saludos,<br>El equipo DREJ<br>
      &copy; {{ date('Y') }} DREJ
    </div>
  </div>
</body>
</html>