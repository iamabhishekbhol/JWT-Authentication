const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    
    username: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    //Strore all active refreshh tokens for this user.
    // By persisting them we can revoke or rotate later

    refreshTokens: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model("UserModel", userSchema);