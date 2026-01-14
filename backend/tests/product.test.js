const request = require("supertest");
const mongoose = require("mongoose");
const { app } = require("../index");
const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");



let testUser, testCategory, productId;

beforeAll(async () => {
    // Use the existing DB connection — do NOT call mongoose.connect()

    // Create a test user (seller)
    testUser = await User.create({
        firstName: "Test",
        lastName: "Admin",
        username: "testadmin",
        email: "testadmin@example.com",
        password: "hashedpassword",
    });

    // Create a test category
    testCategory = await Category.create({
        name: "Test Category",
    });
});

afterAll(async () => {
    // Delete only test-created documents
    await Product.deleteMany({ userId: testUser._id });
    await Category.deleteOne({ _id: testCategory._id });
    await User.deleteOne({ _id: testUser._id });

    await mongoose.disconnect(); // clean shutdown
});

describe("Product API", () => {
    test("01 - Create product with missing fields", async () => {
        const res = await request(app)
            .post("/api/admin/product")
            .field("name", "Incomplete Product")
            .field("price", "99.99");

        expect(res.statusCode).toBe(403); // or your actual error code
    });

    test("02 - Create product with image and addons", async () => {
        const filePath = path.join(__dirname, "sample-image.png");
        const imageBuffer = fs.readFileSync(filePath);

        const res = await request(app)
            .post("/api/admin/product")
            .field("name", "Test Product")
            .field("price", "29.99")
            .field("description", "A great product.")
            .field("categoryId", testCategory._id.toString())
            .field("userId", testUser._id.toString())
            .field("addons", JSON.stringify([{ name: "Extra Sauce", price: 10 }]))
            // Attach buffer instead of path
            .attach("productImage", imageBuffer, {
                filename: "sample-image.png",
                contentType: "image/png",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Test Product");
        productId = res.body.data._id;
    });
    test("03 - Get all products", async () => {
        const res = await request(app).get("/api/admin/product");
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("04 - Get product by ID", async () => {
        const res = await request(app).get(`/api/admin/product/${productId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.data._id).toBe(productId);
    });

    test("05 - Update product details", async () => {
        const res = await request(app)
            .put(`/api/admin/product/${productId}`)
            .field("name", "Updated Product")
            .field("price", "49.99")
            .attach("productImage", path.join(__dirname, "sample-image.png"));

        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe("Updated Product");
    });

    test("06 - Get products by category", async () => {
        const res = await request(app).get(`/api/admin/product/category/${testCategory._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

  

    test("08 - Add second product (bulk test)", async () => {
        const res = await request(app)
            .post("/api/admin/product")
            .field("name", "Bulk Product")
            .field("price", "59.99")
            .field("description", "Another product.")
            .field("categoryId", testCategory._id.toString())
            .field("userId", testUser._id.toString())
            .attach("productImage", path.join(__dirname, "sample-image.png"));

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("09 - Delete product", async () => {
        const res = await request(app).delete(`/api/admin/product/${productId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("10 - Fetch deleted product returns 404", async () => {
        const res = await request(app).get(`/api/admin/product/${productId}`);
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
    });
});
