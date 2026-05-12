<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="Realiza una donación o compra en Zoocial y ayuda a nuestras mascotas.">
    <title>Pagar con PayPal — Zoocial</title>

    {{-- PayPal JS SDK — usa el client_id real del backend --}}
    <script src="https://www.paypal.com/sdk/js?client-id={{ $client_id }}&components=buttons&currency=MXN"></script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <style>
        :root {
            --bg:       #0b0d17;
            --surface:  #12141f;
            --surface2: #1a1d2e;
            --border:   rgba(255,255,255,0.07);
            --accent:   #5b6ef5;
            --teal:     #3ecfb2;
            --text:     #e8eaf6;
            --muted:    #737a9e;
            --danger:   #e85d5d;
            --radius:   16px;
            --radius-sm:10px;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Outfit', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
        }

        /* Blobs de fondo */
        body::before, body::after {
            content: '';
            position: fixed;
            border-radius: 50%;
            filter: blur(120px);
            z-index: 0;
            pointer-events: none;
        }
        body::before {
            width: 500px; height: 500px;
            top: -150px; left: -150px;
            background: radial-gradient(circle, rgba(91,110,245,0.18) 0%, transparent 70%);
        }
        body::after {
            width: 400px; height: 400px;
            bottom: -150px; right: -100px;
            background: radial-gradient(circle, rgba(62,207,178,0.15) 0%, transparent 70%);
        }

        .page-wrapper {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 480px;
        }

        /* Brand */
        .brand {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            justify-content: center;
            margin-bottom: 1.8rem;
        }
        .brand-icon {
            width: 36px; height: 36px;
            background: linear-gradient(135deg, var(--accent), var(--teal));
            border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.1rem;
        }
        .brand-name {
            font-size: 1.4rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--accent), var(--teal));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Card */
        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 2.2rem 2rem;
            box-shadow: 0 24px 60px rgba(0,0,0,0.5);
        }

        .card-title {
            font-size: 1.3rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 0.3rem;
        }
        .card-subtitle {
            text-align: center;
            color: var(--muted);
            font-size: 0.88rem;
            margin-bottom: 1.6rem;
        }

        /* Amount display */
        .amount-display {
            background: var(--surface2);
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            padding: 1rem;
            text-align: center;
            margin-bottom: 1.6rem;
        }
        .amount-display .label {
            font-size: 0.78rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--muted);
            margin-bottom: 0.3rem;
        }
        .amount-display .value {
            font-size: 2.2rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--accent), var(--teal));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .amount-display .currency {
            font-size: 0.85rem;
            color: var(--muted);
            margin-top: 0.2rem;
        }

        /* Divider */
        .divider {
            height: 1px;
            background: var(--border);
            margin: 1.4rem 0;
        }

        /* Info row */
        .info-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.88rem;
            color: var(--muted);
            margin-bottom: 0.5rem;
        }
        .info-row span:last-child { color: var(--text); }

        /* PayPal button container */
        #paypal-button-container {
            margin-top: 1.4rem;
            border-radius: var(--radius-sm);
            overflow: hidden;
        }

        /* Status messages */
        .status-msg {
            display: none;
            padding: 0.85rem 1rem;
            border-radius: var(--radius-sm);
            font-size: 0.9rem;
            margin-top: 1rem;
            text-align: center;
        }
        .status-msg.error {
            background: rgba(232,93,93,0.12);
            border: 1px solid rgba(232,93,93,0.3);
            color: #f59090;
        }
        .status-msg.success {
            background: rgba(62,207,178,0.1);
            border: 1px solid rgba(62,207,178,0.3);
            color: var(--teal);
        }

        /* Secure badge */
        .secure-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            color: var(--muted);
            font-size: 0.78rem;
            margin-top: 1.2rem;
        }

        @media (max-width: 420px) {
            .card { padding: 1.6rem 1.2rem; }
        }
    </style>
</head>
<body>

<div class="page-wrapper">

    <div class="brand">
        <div class="brand-icon">🐾</div>
        <span class="brand-name">Zoocial</span>
    </div>

    <div class="card">
        <h1 class="card-title">Apoya a nuestras mascotas</h1>
        <p class="card-subtitle">Tu contribución hace la diferencia 💚</p>

        {{-- Monto recibido desde la ruta /payment/{amount} --}}
        <div class="amount-display">
            <div class="label">Total a pagar</div>
            <div class="value">${{ number_format($amount, 2) }}</div>
            <div class="currency">Pesos mexicanos (MXN)</div>
        </div>

        <div class="info-row">
            <span>Concepto</span>
            <span>Zoocial</span>
        </div>
        <div class="info-row">
            <span>Método de pago</span>
            <span>PayPal</span>
        </div>

        <div class="divider"></div>

        {{-- Mensajes de estado --}}
        <div id="msg-error" class="status-msg error"></div>
        <div id="msg-success" class="status-msg success"></div>

        {{-- Botones de PayPal JS SDK --}}
        <div id="paypal-button-container"></div>

        <div class="secure-badge">
            🔒 Transacción encriptada y segura con PayPal
        </div>
    </div>

</div>

<script>
    // Comunicación con React Native WebView (app móvil Zoocial)
    function sendToReactNative(data) {
        if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(data));
        }
    }

    function showError(msg) {
        const el = document.getElementById('msg-error');
        el.textContent = '⚠️ ' + msg;
        el.style.display = 'block';
        document.getElementById('msg-success').style.display = 'none';
    }

    function showSuccess(msg) {
        const el = document.getElementById('msg-success');
        el.textContent = '✅ ' + msg;
        el.style.display = 'block';
        document.getElementById('msg-error').style.display = 'none';
    }

    paypal.Buttons({

        // ── CREAR ORDEN en el backend ──────────────────────────────
        async createOrder() {
            try {
                const response = await fetch('/paypal/create-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    },
                    body: JSON.stringify({
                        amount: '{{ $amount }}',
                    }),
                });

                const orderData = await response.json();

                if (orderData.id) {
                    return orderData.id;
                }

                const errorDetail = orderData?.details?.[0];
                const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);

                throw new Error(errorMessage);

            } catch (error) {
                console.error('createOrder error:', error);
                sendToReactNative({ type: 'payment_error', error: error.message });
                showError(`Error al crear la orden: ${error.message}`);
            }
        },

        // ── CAPTURAR PAGO aprobado ──────────────────────────────────
        async onApprove(data, actions) {
            try {
                const response = await fetch('/paypal/capture-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    },
                    body: JSON.stringify({
                        orderID: data.orderID,
                    }),
                });

                const orderData = await response.json();
                const errorDetail = orderData?.details?.[0];

                if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
                    return actions.restart();
                }

                if (errorDetail) {
                    throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                }

                if (orderData.status === 'COMPLETED') {
                    showSuccess('¡Pago completado con éxito! Gracias por apoyar a Zoocial.');

                    sendToReactNative({
                        type: 'payment_success',
                        details: orderData,
                    });

                    // Redirigir al SPA después de 2 segundos
                    setTimeout(() => {
                        window.location.href = '{{ config("app.frontend_url", config("app.url")) }}';
                    }, 2500);

                } else {
                    throw new Error('El pago no pudo ser completado');
                }

            } catch (error) {
                console.error('onApprove error:', error);
                sendToReactNative({ type: 'payment_error', error: error.message });
                showError(`Error al capturar el pago: ${error.message}`);
            }
        },

        // ── ERRORES de PayPal ───────────────────────────────────────
        onError(err) {
            console.error('PayPal SDK Error:', err);
            sendToReactNative({ type: 'payment_error', error: err.toString() });
            showError('Error al procesar el pago con PayPal.');
        },

        // ── CANCELADO por el usuario ────────────────────────────────
        onCancel(data) {
            sendToReactNative({ type: 'payment_cancel', data: data });
            showError('Pago cancelado. Puedes intentarlo nuevamente.');
        },

    }).render('#paypal-button-container');
</script>

</body>
</html>
