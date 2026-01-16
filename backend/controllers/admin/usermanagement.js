// 🔐 ADMIN USER MANAGEMENT WITH ENCRYPTION
// Location: backend/controllers/admin/usermanagement.js

const User = require("../../models/User");
const bcrypt = require("bcrypt");

// 1. CREATE USER (Admin creates new user)
exports.createUser = async (req, res) => {
    const { username, email, firstName, lastName, password, phoneNumber, address } = req.body;
    
    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing required fields"
        });
    }
    
    try {
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });
        
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // 🔐 Create user with encrypted fields
        const newUser = new User({
            username,
            email,
            firstName,
            lastName,
            password: hashedPassword,
            phoneNumber, // 🔐 Will be auto-encrypted
            address // 🔐 Will be auto-encrypted
        });
        
        await newUser.save(); // 🔐 Encryption happens automatically
        
        // Return safe data (no sensitive info)
        const safeUserData = newUser.getSafeData();
        
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: safeUserData
        });
    } catch (err) {
        console.error("Create user error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// 2. GET ALL USERS (Admin sees all users with decrypted data)
exports.getAllUsers = async (req, res) => {
    try {
        // Check if user is admin (should be done by authorize middleware)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const users = await User.find().select("-password -passwordHistory");

        // 🔐 Decrypt all users' data for admin view
        const decryptedUsers = users.map(user => user.getDecryptedData());

        return res.status(200).json({
            success: true,
            count: users.length,
            message: "All users fetched",
            data: decryptedUsers
        });
    } catch (err) {
        console.error("Get all users error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// 3. GET ONE USER (Admin sees one user with decrypted data)
exports.getOneUser = async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).select("-password -passwordHistory");
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // 🔐 Return decrypted data (admin can see everything)
        const decryptedUser = user.getDecryptedData();
        
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: decryptedUser
        });
    } catch (err) {
        console.error("Get one user error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// 4. UPDATE ONE USER (Admin updates user data)
exports.updateOne = async (req, res) => {
    const { username, firstName, lastName, phoneNumber, address } = req.body;
    const _id = req.params.id;
    
    try {
        const user = await User.findById(_id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        // Update non-encrypted fields
        if (username) user.username = username;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        
        // 🔐 Update encrypted fields (if provided)
        if (phoneNumber) {
            user.phoneNumber = phoneNumber; // Will be auto-encrypted on save
        }
        
        if (address) {
            user.address = {
                street: address.street || user.address?.street,
                city: address.city || user.address?.city,
                state: address.state || user.address?.state,
                postalCode: address.postalCode || user.address?.postalCode,
                country: address.country || user.address?.country
            };
        }
        
        await user.save(); // 🔐 Encryption happens automatically
        
        // Return decrypted data
        const decryptedUser = user.getDecryptedData();
        
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: decryptedUser
        });
    } catch (err) {
        console.error("Update user error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// 5. DELETE ONE USER
exports.deleteOne = async (req, res) => {
    const _id = req.params.id;
    
    try {
        const user = await User.findByIdAndDelete(_id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (err) {
        console.error("Delete user error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};