const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const userRouters = require("./routes/user.route");
app.use("/user", userRouters);
const uploadRoutes = require("./routes/uploadRoutes")
app.use("/api/admin", uploadRoutes);
const productRoutes = require("./routes/productRoutes");
app.use("/api", productRoutes);
// Public route
app.get('/', (req, res) => {
    res.send('Hello from Express with Mongo, JWT, CORS, etc!');
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
