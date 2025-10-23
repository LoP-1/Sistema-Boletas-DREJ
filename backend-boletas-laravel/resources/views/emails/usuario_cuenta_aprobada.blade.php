<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>¡Cuenta aprobada!</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #f7fafc; color: #2d3748; }
    .container { max-width: 480px; margin: 30px auto; background: #fff; border-radius: 16px; box-shadow: 0 8px 32px #0001; padding: 32px 24px; }
    .logo { display: block; margin: 0 auto 20px auto; height: 64px; }
    .button {
      display: block;
      width: fit-content;
      margin: 24px auto 0 auto;
      background: #2563eb;
      color: #fff !important;
      padding: 12px 28px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      box-shadow: 0 2px 8px #2563eb22;
    }
    .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center;}
  </style>
</head>
<body>
  <div class="container">
    <img src="{{ asset('logo-drej.png') }}" alt="Logo DREJ" class="logo">
    <h2>¡Cuenta aprobada{{ isset($usuario->nombre) ? ', ' . $usuario->nombre : '' }}!</h2>
    <p>
      Nos complace informarte que tu cuenta ha sido revisada y <b>aprobada</b>.<br>
      Ahora puedes ingresar al sistema con tus credenciales.
    </p>
    @if($usuario->correo)
      <p>
        <b>Usuario:</b> {{ $usuario->correo }}
      </p>
    @endif
    <a class="button" href="https://boletas.drej.edu.pe/login">Ingresar al sistema</a>
    <p>Si tienes preguntas, responde a este correo.<br>
    ¡Bienvenido(a) a DREJ!</p>
    <div class="footer">
      Saludos,<br>El equipo DREJ<br>
      &copy; {{ date('Y') }} DREJ
    </div>
  </div>
</body>
</html>