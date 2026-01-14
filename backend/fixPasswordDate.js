require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected to DB");

        const result = await User.updateOne(
            { email: "admin@gmail.com" },
            { $unset: { passwordChangedAt: "" } }
        );

        console.log("Update result:", result);

        // Verify it's gone
        const user = await User.findOne({ email: "admin@gmail.com" });
        console.log("passwordChangedAt value:", user.passwordChangedAt);

        process.exit(0);
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });