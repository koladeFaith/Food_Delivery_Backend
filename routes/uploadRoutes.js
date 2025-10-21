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

/* ---------------- Add Product ---------------- */
router.post("/admin/add-product", upload.single("image"), async (req, res) => {
    try {
        const { name, price, description } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded. Field name must be 'image'." });
        }

        const image = `/uploads/${req.file.filename}`;
        const product = new Product({ name, price, description, image });
        await product.save();

        res.json({ message: "✅ Product added successfully", product });
    } catch (error) {
        console.error("Error adding product:", error.message);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});

/* ---------------- Get All Products ---------------- */
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json({ products });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});

/* ---------------- Update Product ---------------- */
router.put("/products/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // Update fields
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;

        // Handle image replacement
        if (req.file) {
            // Delete old image if exists
            if (product.image) {
                const oldPath = path.join(__dirname, "..", product.image);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            product.image = `/uploads/${req.file.filename}`;
        }

        await product.save();
        res.json({ message: "✅ Product updated successfully", product });
    } catch (error) {
        console.error("Error updating product:", error.message);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});

/* ---------------- Delete Product ---------------- */
router.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        // Delete image file if exists
        if (product.image) {
            const imagePath = path.join(__dirname, "..", product.image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await Product.findByIdAndDelete(id);
        res.json({ message: "✅ Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error.message);
        res.status(500).json({ message: "❌ Server error", error: error.message });
    }
});

module.exports = router;
