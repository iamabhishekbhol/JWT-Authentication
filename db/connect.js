const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("MongoDB connection error: ", error.message);
        process.exit(1); //Exit on failure
    }
}


module.exports = connectDB;