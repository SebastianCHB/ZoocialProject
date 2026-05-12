<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verifica tu cuenta – Zoocial</title>
<style>
  body { margin: 0; padding: 0; background: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: linear-gradient(135deg, #0ea5e9, #6366f1); padding: 32px 40px; text-align: center; }
  .header h1 { color: white; margin: 0; font-size: 1.6rem; font-weight: 800; }
  .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 0.95rem; }
  .body { padding: 32px 40px; color: #334155; line-height: 1.7; }
  .btn { display: inline-block; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: white; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; margin: 24px 0; }
  .feature-list { background: #f0f9ff; border-radius: 12px; padding: 16px 20px; margin: 20px 0; }
  .feature-list li { color: #0369a1; margin: 6px 0; font-size: 0.9rem; }
  .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header">
    <h1>🐾 ¡Bienvenido a Zoocial!</h1>
    <p>Hola {{ $nombreUsuario }}, ya casi estás listo</p>
  </div>
  <div class="body">
    <p>Gracias por unirte a <strong>Zoocial</strong>, la plataforma de rescate y adopción de animales. Verifica tu cuenta para acceder a todas las funcionalidades:</p>
    <ul class="feature-list">
      <li> Adopta mascotas que necesitan un hogar</li>
      <li> Conecta con otros amantes de los animales</li>
      <li> Dona y apoya a los refugios</li>
    </ul>
    <div style="text-align:center;">
      <a href="{{ $verifyUrl }}" class="btn"> Verificar mi cuenta</a>
    </div>
    <p style="font-size:0.85rem;color:#64748b;">Este enlace expira en 24 horas. Si no creaste una cuenta en Zoocial, ignora este correo.</p>
  </div>
  <div class="footer">
    <p>Este correo fue enviado automáticamente por <strong>Zoocial</strong>. Por favor no respondas a este email.</p>
  </div>
</div>
</body>
</html>
