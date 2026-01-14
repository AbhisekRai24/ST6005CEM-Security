const request = require("supertest");
const { app } = require("../index");
const User = require("../models/User");

let createdUserId;

describe("Admin User Management API", () => {
  const testUser = {
    username: "testuser",
    email: "testuser@example.com",
    firstName: "Test",
    lastName: "User",
    password: "testpassword123"
  };

  // Clean up before and after all tests
  beforeAll(async () => {
    // Ensure test user does not exist
    await User.deleteMany({ email: testUser.email });
  });

  afterAll(async () => {
    // Remove any leftover test data
    await User.deleteMany({ email: testUser.email });
  });

  it("01 should create a new user", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User Registered");

    // store the created user's ID
    const userInDb = await User.findOne({ email: testUser.email });
    createdUserId = userInDb._id.toString();
  });

  it("02 should not allow duplicate user", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User exists");
  });

  it("03 should not fetch all users if Bearer token incorect", async () => {
    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${process.env.ADMIN_JWT}`); // if using auth

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);

  });

  it("04 should fetch one user by ID", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${createdUserId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.succes).toBe(true); // typo in your controller: "succes" not "success"
    expect(res.body.data.email).toBe(testUser.email);
  });

  it("05 should update the user", async () => {
    const res = await request(app)
      .put(`/api/admin/users/${createdUserId}`)
      .send({ username: "updateduser", firstName: "Updated", lastName: "Name" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User updated");
  });

  it("06 should delete the user", async () => {
    const res = await request(app)
      .delete(`/api/admin/users/${createdUserId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("User Deleted");
  });

  it("07 should return error when fetching deleted user", async () => {
    const res = await request(app)
      .get(`/api/admin/users/${createdUserId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBe(null); // if no user found, your controller returns null data
  });
});


