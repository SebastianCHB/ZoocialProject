<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Cancelado — Zoocial</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #0f0f1a;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .card {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 1px solid rgba(230, 100, 100, 0.3);
            border-radius: 20px;
            padding: 3rem 2.5rem;
            text-align: center;
            max-width: 480px;
            width: 90%;
            box-shadow: 0 0 60px rgba(230, 100, 100, 0.08);
        }
        .icon {
            font-size: 4rem;
            margin-bottom: 1.2rem;
            animation: pop 0.5s ease;
        }
        @keyframes pop {
            0%   { transform: scale(0); }
            80%  { transform: scale(1.15); }
            100% { transform: scale(1); }
        }
        h1 {
            font-size: 1.8rem;
            font-weight: 700;
            color: #e46464;
            margin-bottom: 0.6rem;
        }
        p { color: #a0a8c0; line-height: 1.6; margin-bottom: 2rem; }
        a {
            display: inline-block;
            background: linear-gradient(135deg, #e46464, #c0392b);
            color: #fff;
            font-weight: 700;
            padding: 0.85rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        a:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(230, 100, 100, 0.35);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">❌</div>
        <h1>Pago Cancelado</h1>
        <p>Tu pago fue cancelado. No se realizó ningún cargo. Puedes intentarlo nuevamente cuando quieras.</p>
        <a href="{{ config('app.frontend_url', config('app.url')) }}">
            Volver a Zoocial
        </a>
    </div>
</body>
</html>
