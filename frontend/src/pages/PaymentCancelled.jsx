import { useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function PaymentCancelled() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 max-w-md w-full text-center shadow-2xl">
                <XCircle className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Payment Cancelled
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Your payment was cancelled. Your cart items are still saved.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate("/normal")}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={() => navigate("/normal/myorders")}
                        className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        My Orders
                    </button>
                </div>
            </div>
        </div>
    );
}