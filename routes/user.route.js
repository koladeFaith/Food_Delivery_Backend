const express = require("express")
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require("../middleware/user.middleware");

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Welcome to your profile",
        user: req.user,
    });
});
router.post('/signup', userController.signup)
router.post('/signin', userController.signin)
// Get user cart
router.get("/cart", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({ cart: user.cart || [] });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Update user cart
router.put("/cart", authMiddleware, async (req, res) => {
    try {
        const { cart } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { cart },
            { new: true }
        );
        res.json({
            message: "Cart updated successfully",
            cart: user.cart
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
module.exports = router