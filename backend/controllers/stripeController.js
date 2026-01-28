const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/Order");

// Create Checkout Session
// exports.createCheckoutSession = async (req, res) => {
//     try {
//         const { orderData } = req.body;

//         if (!orderData || !orderData.products || orderData.products.length === 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid order data"
//             });
//         }

//         const lineItems = orderData.products.map(product => {
//             const addonsTotal = (product.addons || []).reduce(
//                 (sum, addon) => sum + addon.price * addon.quantity,
//                 0
//             );

//             const unitPrice = product.price + addonsTotal;

//             return {
//                 price_data: {
//                     currency: "npr",
//                     product_data: {
//                         name: product.name,
//                         description: product.addons?.length
//                             ? `Includes: ${product.addons.map(a => `${a.name} x${a.quantity}`).join(", ")}`
//                             : undefined,

//                     },
//                     unit_amount: Math.round(unitPrice * 100),
//                 },
//                 quantity: product.quantity,
//             };
//         });


//         // Create Stripe checkout session
//         const session = await stripe.checkout.sessions.create({
//             payment_method_types: ["card"],
//             line_items: lineItems,
//             mode: "payment",
//             success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//             cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-cancelled`,
//             metadata: {
//                 orderId: orderData._id,
//                 userId: orderData.userId,
//             },
//             customer_email: orderData.deliveryInfo?.email,
//         });

//         // Save order with pending payment status
//         const order = new Order({
//             ...orderData,
//             paymentStatus: "pending",
//             status: "pending",
//         });

//         await order.save();

//         res.status(200).json({
//             success: true,
//             sessionId: session.id,
//             url: session.url,
//         });
//     } catch (error) {
//         console.error("Stripe checkout error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to create checkout session",
//             error: error.message,
//         });
//     }
// };


exports.createCheckoutSession = async (req, res) => {
    try {
        const { orderData } = req.body;

        if (!orderData || !orderData.products || orderData.products.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order data",
            });
        }

        // ✅ Generate custom order number
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const lineItems = orderData.products.map(product => {
            const addonsTotal = (product.addons || []).reduce(
                (sum, addon) => sum + addon.price * addon.quantity,
                0
            );

            const unitPrice = product.price + addonsTotal;

            return {
                price_data: {
                    currency: "npr",
                    product_data: {
                        name: product.name,
                        description: product.addons?.length
                            ? `Includes: ${product.addons.map(a => `${a.name} x${a.quantity}`).join(", ")}`
                            : undefined,
                    },
                    unit_amount: Math.round(unitPrice * 100),
                },
                quantity: product.quantity,
            };
        });
        // Save order FIRST (Mongo generates _id)
        const order = await Order.create({
            userId: orderData.userId,
            products: orderData.products,
            deliveryInfo: orderData.deliveryInfo,
            total: orderData.totalAmount,        // match schema
            orderId,                             // optional custom order id
            paymentMethod: "online",             // required
            paymentStatus: "pending",
            status: "pending",
        });

        // ✅ Create Stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/payment-cancelled`,
            metadata: {
                orderMongoId: order._id.toString(), // ✅ Mongo ID
                orderId: order.orderId,             // ✅ readable order no
                userId: order.userId.toString(),
            },
            customer_email: orderData.deliveryInfo?.email,
        });

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });

    } catch (error) {
        console.error("Stripe checkout error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create checkout session",
            error: error.message,
        });
    }
};


// Webhook handler for payment confirmation
// exports.handleWebhook = async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//     } catch (err) {
//         console.error("Webhook signature verification failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle the event
//     if (event.type === "checkout.session.completed") {
//         const session = event.data.object;
//         const orderId = session.metadata.orderId;

//         try {
//             // Update order payment status
//             await Order.findByIdAndUpdate(orderId, {
//                 paymentStatus: "paid",
//                 status: "processing",
//             });

//             console.log(`✅ Payment confirmed for order: ${orderId}`);

//             // Emit Socket.IO notification (optional)
//             if (global.io) {
//                 const userId = session.metadata.userId;
//                 global.io.to(userId).emit("paymentSuccess", {
//                     orderId,
//                     message: "Payment successful! Your order is being processed.",
//                 });
//             }
//         } catch (error) {
//             console.error("Error updating order:", error);
//         }
//     }

//     res.json({ received: true });
// };

exports.handleWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const orderMongoId = session.metadata.orderMongoId;

        try {
            await Order.findByIdAndUpdate(orderMongoId, {
                paymentStatus: "paid",
                status: "processing",
            });

            console.log(`✅ Payment confirmed for order ${session.metadata.orderId}`);

            if (global.io) {
                global.io.to(session.metadata.userId).emit("paymentSuccess", {
                    orderId: session.metadata.orderId,
                    message: "Payment successful! Your order is being processed.",
                });
            }
        } catch (error) {
            console.error("Error updating order:", error);
        }
    }

    res.json({ received: true });
};


// Verify payment status
// exports.verifyPayment = async (req, res) => {
//     try {
//         const { sessionId } = req.params;

//         const session = await stripe.checkout.sessions.retrieve(sessionId);

//         if (session.payment_status === "paid") {
//             const orderId = session.metadata.orderId;

//             // Get updated order
//             const order = await Order.findById(orderId);

//             res.status(200).json({
//                 success: true,
//                 paymentStatus: "paid",
//                 order,
//             });
//         } else {
//             res.status(200).json({
//                 success: false,
//                 paymentStatus: session.payment_status,
//             });
//         }
//     } catch (error) {
//         console.error("Payment verification error:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to verify payment",
//             error: error.message,
//         });
//     }
// };

exports.verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            const orderMongoId = session.metadata.orderMongoId;

            const order = await Order.findById(orderMongoId);

            return res.status(200).json({
                success: true,
                paymentStatus: "paid",
                order,
            });
        }

        res.status(200).json({
            success: false,
            paymentStatus: session.payment_status,
        });
    } catch (error) {
        console.error("Payment verification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify payment",
            error: error.message,
        });
    }
};
