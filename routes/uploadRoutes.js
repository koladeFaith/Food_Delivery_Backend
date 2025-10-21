const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// POST: Add Product
router.post("/add-product", upload.single("image"), async (req, res) => {
    try {
        const { name, price, description } = req.body;

        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        const image = `/uploads/${req.file.filename}`;
        const product = new Product({ name, price, description, image });
        await product.save();

        res.json({ message: "✅ Product added successfully", product });
    } catch (error) {
        console.error("Error adding product:", error.message);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});

module.exports = router;
