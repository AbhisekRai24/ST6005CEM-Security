import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (sessionId) {
      // Verify payment with backend
      axios
        .get(`http://localhost:5050/api/stripe/verify-payment/${sessionId}`)
        .then((response) => {
          if (response.data.success) {
            setPaymentStatus("success");
            setVerifying(false);

            // Clear cart
            localStorage.removeItem("cart");

            // Redirect to orders after 3 seconds
            setTimeout(() => {
              navigate("/normal/myorders");
            }, 3000);
          } else {
            setPaymentStatus("pending");
            setVerifying(false);
          }
        })
        .catch((error) => {
          console.error("Payment verification error:", error);
          setPaymentStatus("error");
          setVerifying(false);
        });
    } else {
      setVerifying(false);
      setPaymentStatus("error");
    }
  }, [searchParams, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Verifying your payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 max-w-md w-full text-center shadow-2xl">
        {paymentStatus === "success" ? (
          <>
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Your order has been confirmed and is being processed.
            </p>
            <button
              onClick={() => navigate("/normal/myorders")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View My Orders
            </button>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Payment Verification Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We couldn't verify your payment. Please contact support.
            </p>
            <button
              onClick={() => navigate("/normal")}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Back to Shop
            </button>
          </>
        )}
      </div>
    </div>
  );
}