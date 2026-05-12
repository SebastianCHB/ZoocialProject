<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pago Exitoso — Zoocial</title>
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
            border: 1px solid rgba(99, 218, 190, 0.3);
            border-radius: 20px;
            padding: 3rem 2.5rem;
            text-align: center;
            max-width: 480px;
            width: 90%;
            box-shadow: 0 0 60px rgba(99, 218, 190, 0.1);
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
            color: #63dabc;
            margin-bottom: 0.6rem;
        }
        p { color: #a0a8c0; line-height: 1.6; margin-bottom: 1.6rem; }
        .order-id {
            background: rgba(99, 218, 190, 0.1);
            border-radius: 8px;
            padding: 0.6rem 1rem;
            font-size: 0.85rem;
            color: #63dabc;
            margin-bottom: 2rem;
            word-break: break-all;
        }
        a {
            display: inline-block;
            background: linear-gradient(135deg, #63dabc, #4ca8e0);
            color: #0f0f1a;
            font-weight: 700;
            padding: 0.85rem 2rem;
            border-radius: 50px;
            text-decoration: none;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        a:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(99, 218, 190, 0.35);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✅</div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu pago fue procesado correctamente. Gracias por apoyar a Zoocial y a nuestras mascotas.</p>

        @if(request('token'))
            <div class="order-id">
                Order ID: {{ request('token') }}
            </div>
        @endif

        <a href="{{ config('app.frontend_url', config('app.url')) }}">
            Volver a Zoocial
        </a>
    </div>
</body>
</html>
