const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../index");
const Order = require("../models/Order");
const User = require("../models/User");
const Notification = require("../models/Notification");

let testUser;
let testOrderId;

beforeAll(async () => {
    // Use existing DB connection

    // Create a test user for orders
    testUser = await User.create({
        firstName: "Order",
        lastName: "Tester",
        username: "ordertester",
        email: "ordertester@example.com",
        password: "hashedpassword",
    });
});

afterAll(async () => {
    // Clean up test data only
    await Order.deleteMany({ userId: testUser._id });
    await Notification.deleteMany({ userId: testUser._id });
    await User.deleteOne({ _id: testUser._id });

    await mongoose.disconnect();
});

describe("Order API", () => {
    test("01 - POST /orders - should create a new order with valid data", async () => {
        const orderData = {
            userId: testUser._id.toString(),
            products: [
                {
                    _id: "6878afed07839b51509c4258", // updated product ID
                    quantity: 2,
                    price: 10,
                    addons: [
                        { addonId: "6878afed07839b51509c4259", name: "Extra Cheese", price: 2, quantity: 1 } // updated addon ID
                    ]
                }
            ],
            total: 22,
            orderType: "dine-in",
        };

        const res = await request(app).post("/api/orders").send(orderData);

        expect(res.statusCode).toBe(201);
        expect(res.body.userId).toBe(testUser._id.toString());
        expect(res.body.products.length).toBe(1);
        expect(res.body.total).toBe(22);

        testOrderId = res.body._id; // Save for later tests
    });

    test("02 - POST /orders - should fail if products array is missing", async () => {
        const res = await request(app).post("/api/orders").send({
            userId: testUser._id.toString(),
            total: 10,
            orderType: "takeaway",
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/products/i);
    });

    test("03 - GET /orders - should get all orders", async () => {
        const res = await request(app).get("/api/orders");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.some(o => o._id === testOrderId)).toBe(true);
    });

    test("04 - GET /orders/:userId - should get orders for user", async () => {
        const res = await request(app).get(`/api/orders/${testUser._id}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].userId).toBe(testUser._id.toString());
    });

    test("05 - PUT /orders/:id/status - should update order status and create notification", async () => {
        const newStatus = "completed";

        const res = await request(app)
            .put(`/api/orders/${testOrderId}/status`)
            .send({ status: newStatus });

        expect(res.statusCode).toBe(200);
        expect(res.body.order.status).toBe(newStatus);
        expect(res.body.message).toMatch(/updated/i);

        // Check notification created in DB
        const notifications = await Notification.find({ userId: testUser._id });
        expect(notifications.length).toBeGreaterThan(0);
        expect(notifications[notifications.length - 1].message).toMatch(newStatus);
    });

    test("06 - PUT /orders/:id/status - should reject invalid status", async () => {
        const res = await request(app)
            .put(`/api/orders/${testOrderId}/status`)
            .send({ status: "notavalidstatus" });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/invalid status/i);
    });

    test("07 - DELETE /api/orders/:id - should delete order", async () => {
        const res = await request(app).delete(`/api/orders/${testOrderId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/deleted/i);

        // Confirm order no longer exists
        const deletedOrder = await Order.findById(testOrderId);
        expect(deletedOrder).toBeNull();
    });
});
