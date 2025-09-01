const express = require("express")
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require("../middleware/user.middleware");

router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Welcome to your profile",
        user: req.user, // comes from token
    });
});
router.post('/signup', userController.signup)
router.post('/signin', userController.signin)
module.exports = router