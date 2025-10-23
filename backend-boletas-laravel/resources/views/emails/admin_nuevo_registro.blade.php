<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Nuevo registro de usuario</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #f7fafc; color: #2d3748; }
    .container { max-width: 480px; margin: 30px auto; background: #fff; border-radius: 16px; box-shadow: 0 8px 32px #0001; padding: 32px 24px; }
    .logo { display: block; margin: 0 auto 20px auto; height: 64px; }
    .footer { margin-top: 32px; font-size: 12px; color: #64748b; text-align: center;}
    ul { padding-left: 18px; }
    li { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <img src="{{ asset('logo-drej.png') }}" alt="Logo DREJ" class="logo">
    <h2>Nuevo registro de usuario</h2>
    <p>Se ha registrado un nuevo usuario en el sistema:</p>
    <ul>
      <li><b>Nombre:</b> {{ $usuario->nombre }} {{ $usuario->apellido }}</li>
      <li><b>Correo:</b> {{ $usuario->correo }}</li>
      <li><b>DNI:</b> {{ $usuario->dni }}</li>
      <li><b>Teléfono:</b> {{ $usuario->telefono }}</li>
    </ul>
    <p>¡Revisa y aprueba la cuenta desde el panel de administración!</p>
    <div class="footer">
      &copy; {{ date('Y') }} DREJ
    </div>
  </div>
</body>
</html>