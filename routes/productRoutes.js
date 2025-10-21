const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/Product");

const router = express.Router();

/* ---------------- MULTER SETUP ---------------- */
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

/* ---------------- ADD PRODUCT ---------------- */
router.post("/admin/add-product", upload.single("image"), async (req, res) => {
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
        console.error("Error adding product:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/* ---------------- FETCH ALL PRODUCTS ---------------- */
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        console.error("Fetch error:", error.message);
        res.status(500).json({ message: "Failed to fetch products" });
    }
});

/* ---------------- EDIT PRODUCT ---------------- */
router.put("/products/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // If new image uploaded, replace old one
        if (req.file) {
            if (product.image && fs.existsSync("." + product.image)) {
                fs.unlinkSync("." + product.image);
            }
            product.image = `/uploads/${req.file.filename}`;
        }

        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;

        await product.save();

        res.json({ message: "✅ Product updated successfully", product });
    } catch (error) {
        console.error("Error updating product:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/* ---------------- DELETE PRODUCT ---------------- */
router.delete("/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) return res.status(404).json({ message: "Product not found" });

        // Delete image from filesystem if exists
        if (product.image && fs.existsSync("." + product.image)) {
            fs.unlinkSync("." + product.image);
        }

        await Product.findByIdAndDelete(id);

        res.json({ message: "🗑️ Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

/* ---------------- SERVE UPLOADS ---------------- */
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

module.exports = router;
