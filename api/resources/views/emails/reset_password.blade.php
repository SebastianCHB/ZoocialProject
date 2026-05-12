<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Recupera tu contraseña – Zoocial</title>
<style>
  body { margin: 0; padding: 0; background: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 40px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 1.6rem; font-weight: 800; }
  .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 0.95rem; }
  .body { padding: 32px 40px; color: #334155; line-height: 1.7; }
  .btn { display: inline-block; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; margin: 24px 0; }
  .warning { background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 8px; padding: 12px 16px; font-size: 0.85rem; color: #7c2d12; margin-top: 20px; }
  .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  .url-fallback { word-break: break-all; font-size: 0.8rem; color: #6366f1; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1> Recuperar Contraseña</h1>
    <p>Hola {{ $nombreUsuario }}, recibimos tu solicitud</p>
  </div>
  <div class="body">
    <p>Haz clic en el siguiente botón para crear una nueva contraseña. Este enlace <strong>expira en 60 minutos</strong>.</p>
    <div style="text-align:center;">
      <a href="{{ $resetUrl }}" class="btn">Restablecer mi contraseña</a>
    </div>
    <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
    <p class="url-fallback">{{ $resetUrl }}</p>
    <div class="warning">
       Si no solicitaste este cambio, ignora este correo. Tu contraseña seguirá siendo la misma.
    </div>
  </div>
  <div class="footer">
    <p>Este correo fue enviado automáticamente por <strong>Zoocial</strong>. Por favor no respondas a este email.</p>
  </div>
</div>
</body>
</html>
