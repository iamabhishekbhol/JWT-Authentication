require("dotenv").config(); // Load .env variables at the start
const express = require("express");
const authRoutes = require("./routes/auth");
const connectDB = require("./db/connect");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Auth API 🚀");
});

//connect to DB and start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
});
