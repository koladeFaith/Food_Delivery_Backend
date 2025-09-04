const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const saltRounds = 10
// const nodemailer = require("nodemailer")
const jwt = require('jsonwebtoken')
exports.signup = async (request, response) => {
    try {
        const { fullName, email, password } = request.body;

        if (!email) {
            return response.status(400).json({ message: "Email is required" });
        }

        const existinguser = await User.findOne({ email });
        if (existinguser) {
            return response.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user with empty cart
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            cart: [] 
        });

        await user.save();

        return response.status(200).json({
            message: "Account registered successfully",
            status: "success",
            data: {
                user: {
                    id: user._id,
                    fullName,
                    email,
                    cart: [] 
                }
            },
        });
    } catch (err) {
        console.error(err);
        return response.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};
exports.signin = async (request, response) => {
    try {
        const { email, password } = request.body;

        // Find user and include cart data
        const user = await User.findOne({ email }).select('+password'); // Include password for comparison

        if (!user) {
            return response.status(400).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return response.status(401).json({ message: "Incorrect password" });
        }

        // Create token with longer expiry 
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" } 
        );

        response.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                cart: user.cart || []
            },
            status: "success"
        });
    } catch (error) {
        console.error('Signin error:', error);
        response.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};