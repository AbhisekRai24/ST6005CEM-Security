const request = require("supertest");
// const app = require("../index");
const { app } = require("../index"); // ✅ correct: import only the Express app

const User = require("../models/User");
const mongoose = require("mongoose");



let authToken;
let userId;

beforeAll(async () => {
    // Delete only the test user by email
    await User.deleteMany({ email: "ab@gmail.com" });
});

afterAll(async () => {
    await mongoose.disconnect();
});
describe("validates the registration form", () => {
    test("Fail to register without username", async () => {
        const res = await request(app).post("/api/auth/register").send({
            email: "ab@gmail.com",
            password: "password123"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Missing fields");
    });

    test("Fail to register without email", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "aa",
            password: "password123"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Missing fields");
    });

    test("Fail to register without password", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "aa",
            email: "ab@gmail.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Missing fields");
    });

    test("Successful registration", async () => {
        const res = await request(app).post("/api/auth/register").send({
            firstName: "ab",
            lastName: "rai",
            username: "aa",
            email: "ab@gmail.com",
            password: "password123"
        });
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });

    test("Fail to register duplicate username", async () => {
        const res = await request(app).post("/api/auth/register").send({
            firstName: "someone",
            lastName: "else",
            username: "aa",
            email: "different@gmail.com",
            password: "password123"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("User exists");
    });

    test("Fail to register duplicate email", async () => {
        const res = await request(app).post("/api/auth/register").send({
            firstName: "someone",
            lastName: "else",
            username: "differentuser",
            email: "ab@gmail.com",
            password: "password123"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("User exists");
    });
    test("Fail to register with invalid email format", async () => {
        const res = await request(app).post("/api/auth/register").send({
            username: "newuser",
            email: "invalid-email",
            password: "password123"
        });
        expect(res.statusCode).toBe(400);

    });
});

describe("validates the login form", () => {

    test("Login fails with no email", async () => {
        const res = await request(app).post("/api/auth/login").send({
            password: "password123"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Missing field");
    });
    test("Login fails with invalid email format", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "notanemail",
            password: "password123"
        });
        expect(res.statusCode).toBe(403);
    });
    const path = require("path");

    // test("Update user profile with image", async () => {
    //     const res = await request(app)
    //         .put(`/api/auth/${userId}`)
    //         .attach("profileImage", path.resolve(__dirname, "test-image.jpg"))
    //         .field("firstName", "imguser");
    //     expect(res.statusCode).toBe(200);
    //     expect(res.body.success).toBe(true);
    //     expect(res.body.data.firstName).toBe("imguser");
    // });


});


describe("Admin Route Tesing", () => {
    beforeAll(async () => {
        await User.updateOne({ email: "ab@gmail.com" }, { role: "admin" });
    });

    test("Admin can fetch user list", async () => {
        const res = await request(app).get("/api/admin/users")
            .set("Authorization", "Bearer " + authToken);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("Fails if token is missing", async () => {
        const res = await request(app).get("/api/admin/users");
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Token required");
    });
    test("Admin gets user list with required fields", async () => {
        await User.updateOne({ email: "ab@gmail.com" }, { role: "admin" });
        const res = await request(app)
            .get("/api/admin/users")
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data[0]).toHaveProperty("username");
        expect(res.body.data[0]).not.toHaveProperty("password");
    });


    test("Fails if non-admin tries to access", async () => {
        await User.updateOne({ email: "ab@gmail.com" }, { role: "normal" });
        const res = await request(app).get("/api/admin/users")
            .set("Authorization", "Bearer " + authToken);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe("Unauthorized");

    });

    test("Login fails with no password", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "ab@gmail.com"
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe("Missing field");
    });

    test("Login fails with non-existent user", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "nouser@test.com",
            password: "password123"
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("User not found");
    });

    test("Login fails with wrong password", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "ab@gmail.com",
            password: "wrongpassword"
        });
        expect(res.statusCode).toBe(403);
        expect(res.body.message).toBe("Invalid credentials");
    }); test("Successful login", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "ab@gmail.com",
            password: "password123"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toEqual(expect.any(String));
        authToken = res.body.token;
        userId = res.body.data._id;
    });
    test("Login response includes expected user data", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "ab@gmail.com",
            password: "password123"
        });
        const user = res.body.data;
        expect(user).toHaveProperty("email", "ab@gmail.com");
        expect(user).toHaveProperty("username");
        expect(user).not.toHaveProperty("password");
    });

    test("Get user by ID", async () => {
        const res = await request(app).get(`/api/auth/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe("ab@gmail.com");
        expect(res.body.data).not.toHaveProperty("password");
    });

    test("Fail to get user with invalid ID", async () => {
        const res = await request(app).get(`/api/auth/invalid-id`);
        expect(res.statusCode).toBe(500);
        expect(res.body.message).toBe("Server error");
    });

    test("Fail to get user with non-existent ID", async () => {
        const res = await request(app).get(`/api/auth/000000000000000000000000`);
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User not found");
    });


    test("Update user profile info", async () => {
        const res = await request(app).put(`/api/auth/${userId}`).send({
            firstName: "updated",
            lastName: "last"
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.data.firstName).toBe("updated");
    });

    test("Update user with empty body succeeds (no-op)", async () => {
        const res = await request(app).put(`/api/auth/${userId}`).send({});
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test("Update non-existing user fails", async () => {
        const res = await request(app).put(`/api/auth/000000000000000000000000`).send({
            firstName: "None"
        });
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe("User not found");
    });


});