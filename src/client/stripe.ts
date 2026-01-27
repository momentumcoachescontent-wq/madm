interface CheckoutOptions {
  stripeKey: string;
  paypalClientId: string;
  courseId: number;
  currency: string;
  price: number;
}

export function initCheckout(options: CheckoutOptions) {
  const { stripeKey, paypalClientId, courseId, currency } = options;

  // Initialize Stripe
  if (typeof (window as any).Stripe === 'undefined') {
    // Wait for Stripe to load
    const interval = setInterval(() => {
        if (typeof (window as any).Stripe !== 'undefined') {
            clearInterval(interval);
            setupStripe(options);
        }
    }, 100);
    setTimeout(() => clearInterval(interval), 10000); // 10s timeout
    return;
  }

  setupStripe(options);
}

function setupStripe(options: CheckoutOptions) {
  const { stripeKey, paypalClientId, courseId, currency } = options;

  const stripe = (window as any).Stripe(stripeKey);
  const elements = stripe.elements();
  const cardElement = elements.create('card', {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        '::placeholder': { color: '#94a3b8' }
      }
    }
  });

  const cardElementContainer = document.getElementById('card-element');
  if (cardElementContainer) {
    cardElement.mount('#card-element');
  }

  // Handle card errors
  cardElement.on('change', (event: any) => {
    const displayError = document.getElementById('card-errors');
    if (displayError) {
      displayError.textContent = event.error ? event.error.message : '';
    }
  });

  // Payment Method Selection - Expose to global scope for HTML onclick
  (window as any).selectPaymentMethod = function(method: 'stripe' | 'paypal') {
    const stripeBtn = document.getElementById('select-stripe');
    const paypalBtn = document.getElementById('select-paypal');
    const stripeDiv = document.getElementById('stripe-payment');
    const paypalDiv = document.getElementById('paypal-payment');

    if (method === 'stripe') {
      stripeBtn?.classList.add('active');
      if (stripeBtn) stripeBtn.style.borderColor = '#8b5cf6';

      paypalBtn?.classList.remove('active');
      if (paypalBtn) paypalBtn.style.borderColor = '#e2e8f0';

      if (stripeDiv) stripeDiv.style.display = 'block';
      if (paypalDiv) paypalDiv.style.display = 'none';
    } else {
      paypalBtn?.classList.add('active');
      if (paypalBtn) paypalBtn.style.borderColor = '#8b5cf6';

      stripeBtn?.classList.remove('active');
      if (stripeBtn) stripeBtn.style.borderColor = '#e2e8f0';

      if (paypalDiv) paypalDiv.style.display = 'block';
      if (stripeDiv) stripeDiv.style.display = 'none';

      loadPayPalButton(paypalClientId, currency, courseId);
    }
  };

  // Also attach event listeners directly if possible (in case inline onclick is removed)
  const stripeBtn = document.getElementById('select-stripe');
  if (stripeBtn && !stripeBtn.getAttribute('onclick')) {
      stripeBtn.addEventListener('click', () => (window as any).selectPaymentMethod('stripe'));
  }
  const paypalBtn = document.getElementById('select-paypal');
  if (paypalBtn && !paypalBtn.getAttribute('onclick')) {
      paypalBtn.addEventListener('click', () => (window as any).selectPaymentMethod('paypal'));
  }

  // Handle Stripe Form Submission
  const form = document.getElementById('payment-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitButton = document.getElementById('submit-stripe') as HTMLButtonElement;
      const messageDiv = document.getElementById('checkout-message');
      const cardHolderNameInput = document.getElementById('card-holder-name') as HTMLInputElement;

      if (!submitButton || !cardHolderNameInput) {
        console.error('Missing required elements for payment processing');
        return;
      }

      const originalText = submitButton.innerHTML;

      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
      if (messageDiv) messageDiv.style.display = 'none';

      try {
        // Create Payment Intent
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: courseId,
            paymentMethod: 'stripe'
          })
        });

        const { clientSecret, error } = await response.json() as any;

        if (error) {
          throw new Error(error);
        }

        // Confirm Payment
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardHolderNameInput.value
            }
          }
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        // Verify Payment on Server
        const verifyResponse = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: result.paymentIntent.id,
            courseId: courseId
          })
        });

        const verifyData = await verifyResponse.json() as any;

        if (verifyData.success) {
          window.location.href = `/pago-exitoso?courseId=${courseId}`;
        } else {
          throw new Error('Error al verificar el pago');
        }

      } catch (error: any) {
        if (messageDiv) {
          messageDiv.className = 'auth-message error';
          messageDiv.textContent = error.message;
          messageDiv.style.display = 'block';
        }
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    });
  }
}

function loadPayPalButton(clientId: string, currency: string, courseId: number) {
  if ((window as any).paypalLoaded) return;

  const script = document.createElement('script');
  script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
  script.onload = () => {
    (window as any).paypalLoaded = true;

    if (typeof (window as any).paypal === 'undefined') return;

    (window as any).paypal.Buttons({
      createOrder: async () => {
        try {
          const response = await fetch('/api/create-paypal-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseId: courseId })
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json() as any;
          if (!data.orderId) {
             throw new Error('No order ID received');
          }
          return data.orderId;
        } catch (error) {
          console.error('Error creating PayPal order:', error);
          throw error;
        }
      },
      onApprove: async (data: any) => {
        try {
          const response = await fetch('/api/capture-paypal-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data.orderID,
              courseId: courseId
            })
          });

          if (!response.ok) {
             throw new Error('Network response was not ok');
          }

          const result = await response.json() as any;
          if (result.success) {
            window.location.href = `/pago-exitoso?courseId=${courseId}`;
          } else {
             throw new Error(result.error || 'Payment capture failed');
          }
        } catch (error: any) {
          console.error('Error capturing PayPal order:', error);
          const messageDiv = document.getElementById('checkout-message');
          if (messageDiv) {
            messageDiv.className = 'auth-message error';
            messageDiv.textContent = error.message || 'Error al procesar el pago con PayPal';
            messageDiv.style.display = 'block';
          }
        }
      },
      onError: (err: any) => {
        console.error(err);
        const messageDiv = document.getElementById('checkout-message');
        if (messageDiv) {
          messageDiv.className = 'auth-message error';
          messageDiv.textContent = 'Error al procesar el pago con PayPal';
          messageDiv.style.display = 'block';
        }
      }
    }).render('#paypal-button-container');
  };
  document.head.appendChild(script);
}

export function init() {
  const config = document.getElementById('checkout-config');
  if (config) {
    const options = {
      stripeKey: config.dataset.stripeKey!,
      paypalClientId: config.dataset.paypalClientId!,
      courseId: parseInt(config.dataset.courseId!),
      currency: config.dataset.currency!,
      price: parseFloat(config.dataset.price!)
    };
    initCheckout(options);
  }
}
