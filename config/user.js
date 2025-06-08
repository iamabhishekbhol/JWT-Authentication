const bcrypt = require("bcryptjs");

// Dummy plain password
const dummyPassword = "DummyPassword123@";

// Dummy user object (simulating a user from DB)
const user = {
  id: 1,
  username: "John",
  password: "", // will be filled with hashed password
};

// Immediately hash the password and store it


(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(dummyPassword, salt);
  user.password = hashedPassword;
  console.log("🔒 Hashed dummy password:", user.password);
})();

module.exports = user;
