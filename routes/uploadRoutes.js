const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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


// ------------------- ADD PRODUCT -------------------
router.post("/add-product", upload.single("image"), async (req, res) => {
    try {
        const { name, price, description } = req.body;

        if (!req.file)
            return res
                .status(400)
                .json({ message: "No file uploaded. Field name must be 'image'." });

        const image = `/uploads/${req.file.filename}`;
        const product = new Product({ name, price, description, image });
        await product.save();

        res.json({ message: "✅ Product added successfully", product });
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});


// ------------------- GET ALL PRODUCTS -------------------
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "❌ Error fetching products", error: error.message });
    }
});


// ------------------- UPDATE PRODUCT -------------------
router.put("/edit-product/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // If a new image is uploaded, delete the old one
        if (req.file) {
            if (product.image && fs.existsSync(`.${product.image}`)) {
                fs.unlinkSync(`.${product.image}`);
            }
            product.image = `/uploads/${req.file.filename}`;
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;

        await product.save();
        res.json({ message: "✅ Product updated successfully", product });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});


// ------------------- DELETE PRODUCT -------------------
router.delete("/delete-product/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        // Delete image from uploads folder
        if (product.image && fs.existsSync(`.${product.image}`)) {
            fs.unlinkSync(`.${product.image}`);
        }

        await Product.findByIdAndDelete(id);

        res.json({ message: "🗑️ Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});

module.exports = router;
