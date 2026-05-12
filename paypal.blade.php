<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <script src="https://www.paypal.com/sdk/js?client-id={{$client_id}}&components=buttons&currency=MXN"></script>

    <style>
        body {
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: transparent;
            box-sizing: border-box;
        }

        #paypal-button-container {
            width: 100%;
            max-width: 400px;
        }
    </style>
</head>

<body>
    <div id="paypal-button-container"></div>
    <script>
        function sendToReactNative(data) {
            if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify(data));
            }
        }

        paypal.Buttons({
            // Call your server to set up the transaction
            async createOrder() {
                try {
                    const response = await fetch("/paypal/create-order", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": "{{ csrf_token() }}"
                        },
                        body: JSON.stringify({
                            amount: "{{ $amount }}"
                        })
                    });

                    const orderData = await response.json();

                    if (orderData.id) {
                        return orderData.id;
                    } else {
                        const errorDetail = orderData?.details?.[0];
                        const errorMessage = errorDetail ?
                            `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})` :
                            JSON.stringify(orderData);

                        throw new Error(errorMessage);
                    }
                } catch (error) {
                    console.error(error);
                    sendToReactNative({
                        type: 'payment_error',
                        error: error.message
                    });
                    alert(`Error al crear la orden: ${error.message}`);
                }
            },

            // Call your server to finalize the transaction
            async onApprove(data, actions) {
                try {
                    const response = await fetch("/paypal/capture-order", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-TOKEN": "{{ csrf_token() }}"
                        },
                        body: JSON.stringify({
                            orderID: data.orderID
                        })
                    });

                    const orderData = await response.json();
                    
                    const errorDetail = orderData?.details?.[0];

                    if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                        return actions.restart();
                    } else if (errorDetail) {
                        throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
                    } else if (orderData.status === 'COMPLETED') {
                        alert('¡Pago completado con éxito!');
                        
                        sendToReactNative({
                            type: 'payment_success',
                            details: orderData
                        });
                        
                    } else {
                        throw new Error('El pago no pudo ser completado');
                    }
                } catch (error) {
                    console.error(error);
                    sendToReactNative({
                        type: 'payment_error',
                        error: error.message
                    });
                    alert(`Error al capturar el pago: ${error.message}`);
                }
            },

            onError: function (err) {
                console.error('PayPal Error:', err);
                sendToReactNative({
                    type: 'payment_error',
                    error: err.toString()
                });
                alert('Error al procesar el pago con PayPal');
            },

            onCancel: function (data) {
                sendToReactNative({
                    type: 'payment_cancel',
                    data: data
                });
                alert('Pago cancelado por el usuario');
            }
        }).render('#paypal-button-container');
    </script>
</body>

</html>