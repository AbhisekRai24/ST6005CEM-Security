import React, { useState } from 'react';

function EsewaPayment() {
  const [message, setMessage] = useState('');

  async function handlePayment() {
    try {
      const amount = 100; // Amount in NPR (adjust as needed)

      const response = await fetch('/api/esewa/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect user to eSewa payment page
        window.location.href = data.url;
      } else {
        setMessage('Failed to get payment URL from server.');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setMessage('Payment initiation failed. Check console.');
    }
  }

  return (
    <div>
      <button onClick={handlePayment}>Pay with eSewa</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EsewaPayment;








