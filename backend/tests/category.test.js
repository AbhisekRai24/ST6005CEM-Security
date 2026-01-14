
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
// const app = require("../index"); // your Express app
const { app } = require("../index");
const Category = require("../models/Category");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear all test data from categories collection after each test
    await Category.deleteMany({});
});

describe("Category API", () => {
    test("Create category successfully", async () => {
        const res = await request(app)
            .post("/api/admin/category")
            .field("name", "Test Category");

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("Test Category");
    });

    test("Fail to create category with missing name", async () => {
        const res = await request(app)
            .post("/api/admin/category")
            .field("name", "");  // empty name

        expect(res.statusCode).toBe(500); // Or your validation error code
        expect(res.body.success).toBe(false);
    });

    test("Get all categories", async () => {
        await Category.create({ name: "Category1" });
        await Category.create({ name: "Category2" });

        const res = await request(app).get("/api/admin/category");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(2);
    });

    test("Get category by id", async () => {
        const category = await Category.create({ name: "SingleCategory" });

        const res = await request(app).get(`/api/admin/category/${category._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("SingleCategory");
    });

    test("Update category", async () => {
        const category = await Category.create({ name: "OldName" });

        const res = await request(app)
            .put(`/api/admin/category/${category._id}`)
            .field("name", "NewName");

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe("NewName");
    });

    test("Delete category", async () => {
        const category = await Category.create({ name: "ToDelete" });

        const res = await request(app).delete(`/api/admin/category/${category._id}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        const found = await Category.findById(category._id);
        expect(found).toBeNull();
    });

});
