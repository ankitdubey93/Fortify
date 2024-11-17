const mongoose = require("mongoose");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    confirmpassword: {
        type: String,
        required: true
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

//creating a collection

const User = new mongoose.model("User",userSchema);

module.exports = User;