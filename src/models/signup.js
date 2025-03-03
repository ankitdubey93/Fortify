const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required:true
    },
    email: {
        type:String,
        required:true,
        unique: true
    },
    password: {
        type:String,
        required:true
    },
    data: [
        {
            website: String,
            username: String,
            password: String,
            notes: String
        }
    ]
})

const User = new mongoose.model("User",userSchema);
module.exports = User;