const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const saltRounds = 10
const nodemailer = require("nodemailer")
const jwt = require('jsonwebtoken')
exports.signup = async (request, response) => {
    try {
        const { fullName, email, password } = request.body;
        const existinguser = await User.findOne({ email });

        if (existinguser) {
            return response.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = new User({ fullName, email, password: hashedPassword });
        await user.save();

        if (!email) {
            return response.status(400).json({ message: "Email is required" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Welcome to NutriPlan",
            html: "<p>Welcome to NutriPlan 🎉</p>",
        };


        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Email error:", error);
                // Just log it, don’t break signup
            } else {
                console.log("Email sent:", info.response);
            }
        });


        return response.status(200).json({
            message: "Account registered successfully",
            status: "success",
            data: { user: { fullName, email } },
        });
    } catch (err) {
        console.error(err);
        return response.status(500).json({ message: "Server error" });
    }
};

exports.signin = async (request, response) => {
    const { email, password } = request.body
    const user = await User.findOne({ email })
    if (!user) {
        response.status(400).json({ message: "User not found" })
        return
    }
    const match = await bcrypt.compare(password, user.password)
    if (!match) return response.status(401).json({ message: "Incorrect password" })
    const token = jwt.sign(
        { id: user.id, email: user.email, fullName: user.fullName },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
    );
    response.status(200).json({
        message: "Login successful",
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email },
        status: "success"
    })
}
