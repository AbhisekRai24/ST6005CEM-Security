const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
require("dotenv").config();

const seedDatabase = async () => {
    try {
        // Connect to your NEW MongoDB database
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("Connected to MongoDB");



        // Hash passwords
        const hashedAdminPassword = await bcrypt.hash("password", 10);
        const hashedUserPassword = await bcrypt.hash("password", 10);

        // Create admin user
        const admin = new User({
            username: "admin",
            email: "admin@gmail.com",
            firstName: "Admin",
            lastName: "User",
            password: hashedAdminPassword,
            role: "admin", // Make sure your User model has a role field
            profileImage: null,
        });

        // Create regular user
        const user = new User({
            username: "marky",
            email: "marky@gmail.com",
            firstName: "Marky",
            lastName: "User",
            password: hashedUserPassword,
            role: "user",
            profileImage: null,
        });

        // Save users
        await admin.save();
        await user.save();

        console.log("✅ Admin created: admin@gmail.com / password");
        console.log("✅ User created: marky@gmail.com / password");

        // Close connection
        await mongoose.connection.close();
        console.log("Database seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
};

seedDatabase();