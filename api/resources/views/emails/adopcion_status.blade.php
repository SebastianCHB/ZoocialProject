<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Estado de tu solicitud – Zoocial</title>
<style>
  body { margin: 0; padding: 0; background: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; }
  .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { padding: 32px 40px; text-align: center; }
  .header-approved { background: linear-gradient(135deg, #16a34a, #4ade80); }
  .header-rechazado { background: linear-gradient(135deg, #dc2626, #f87171); }
  .header-pendiente { background: linear-gradient(135deg, #ea580c, #fb923c); }
  .header h1 { color: white; margin: 0; font-size: 1.6rem; font-weight: 800; }
  .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 0.95rem; }
  .body { padding: 32px 40px; }
  .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; margin-bottom: 20px; }
  .badge-aprobado { background: #dcfce7; color: #15803d; }
  .badge-rechazado { background: #fee2e2; color: #b91c1c; }
  .badge-pendiente { background: #fff7ed; color: #c2410c; }
  .pet-card { background: #f8fafc; border-radius: 12px; padding: 16px 20px; margin: 20px 0; border-left: 4px solid #6366f1; }
  .pet-card h3 { margin: 0 0 4px; color: #1e293b; font-size: 1rem; }
  .pet-card p { margin: 0; color: #64748b; font-size: 0.875rem; }
  .note-box { background: #f1f5f9; border-radius: 10px; padding: 14px 18px; margin: 16px 0; font-size: 0.875rem; color: #475569; font-style: italic; }
  .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 0.8rem; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  .btn { display: inline-block; background: #6366f1; color: white; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 0.9rem; margin-top: 20px; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="header header-{{ $estado }}">
    @if($estado === 'aprobado') <h1> ¡Solicitud Aprobada!</h1>
    @elseif($estado === 'rechazado') <h1> Solicitud Rechazada</h1>
    @else <h1> Actualización de Solicitud</h1>
    @endif
    <p>Hola {{ $nombreUsuario }}, hay novedades sobre tu solicitud</p>
  </div>
  <div class="body">
    <span class="status-badge badge-{{ $estado }}">
      @if($estado === 'aprobado')  Aprobado
      @elseif($estado === 'rechazado')  Rechazado
      @else  Pendiente
      @endif
    </span>

    <div class="pet-card">
      <h3>🐾 {{ $nombreMascota }}</h3>
      <p>Tu solicitud de adopción para esta mascota fue <strong>{{ $estado }}</strong>.</p>
    </div>

    @if($nota)
    <div class="note-box">
      <strong>Nota del equipo:</strong><br>{{ $nota }}
    </div>
    @endif

    @if($estado === 'aprobado')
    <p style="color:#334155;line-height:1.6;">¡Felicidades! El equipo de Zoocial se pondrá en contacto contigo pronto para coordinar los próximos pasos de la adopción. Revisa también tu bandeja de mensajes dentro de la app.</p>
    @elseif($estado === 'rechazado')
    <p style="color:#334155;line-height:1.6;">Lamentamos informarte que tu solicitud no pudo ser procesada en este momento. Puedes ver la nota del equipo arriba y contactarnos si tienes dudas.</p>
    @endif

    <a href="{{ env('FRONTEND_URL', 'https://zooocial.alwaysdata.net') }}/#/adoptions" class="btn">Ver mis solicitudes</a>
  </div>
  <div class="footer">
    <p>Este correo fue enviado automáticamente por <strong>Zoocial</strong>. Por favor no respondas a este email.</p>
  </div>
</div>
</body>
</html>
