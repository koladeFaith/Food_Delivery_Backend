import Product from "../models/Product.js";

// GET all products
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch products", error });
    }
};

// ADD product
export const addProduct = async (req, res) => {
    try {
        const { name, description, price, category, imageUrl } = req.body;

        const product = new Product({
            name,
            description,
            price,
            category,
            imageUrl
        });

        await product.save();
        res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Failed to add product", error });
    }
};

// UPDATE product
export const updateProduct = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
        });
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Update failed", error });
    }
};

// DELETE product
export const deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed", error });
    }
};
