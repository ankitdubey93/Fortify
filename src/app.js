const express = require('express');
const { stat } = require('fs');
const path = require('path')
const app = express();
require('./db/connect')
const User = require("./models/signup")

require('dotenv').config();

const PORT = 3000;
const dashboard_path = path.join(__dirname,"../public/dashboard.html")


const static_path = path.join(__dirname, "../public")

app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.get('/',(req,res) => {
    res.redirect("/");
})

app.get('/dashboard',(req,res) => {
    res.sendFile(dashboard_path);
})

app.post("/signup",async (req,res) => {
    try {
       const password = req.body.password;
       const cpassword = req.body['confirm-password'];

       const existingUser = await User.findOne({ email: req.body.email });
       if (existingUser) {
           return res.status(400).send("Email already registered. Please use a different email.");
       }

       if(password === cpassword) {
        const signUpUser = new User(
            {
                name: req.body.name,
                email: req.body.email,
                password: password,
                confirmpassword: cpassword,
            }
        )
        const registered = await signUpUser.save();
        res.redirect('/')
       }
       else {
        res.send("Passwords do not match")
       }
    }
    catch (error) {
        res.status(400).send(error);
    }
})



app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
} )