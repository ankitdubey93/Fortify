const express = require('express');
const { stat } = require('fs');
const path = require('path')
const app = express();
require('./db/connect')
const User = require("./models/signup");
const { error } = require('console');
require('dotenv').config();


const PORT = 3000;
const dashboard_path = path.join(__dirname,"../public/dashboard.html")
const homepage_path = path.join(__dirname,"../public/index.html")
const static_path = path.join(__dirname, "../public")

app.use(express.static(static_path));

app.use(express.json());

app.use(express.urlencoded({extended:true}))

app.get('/',(req,res) => {
    res.sendFile(homepage_path);
})

app.get('/dashboard',async (req,res) => {
    try {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');


        const userId = req.query.user;

        
        const user = await User.findById(userId);
    if(!user) {
        return res.status(400).send("User not found");
    }
    res.sendFile(dashboard_path);
    } catch (error)
    {res.status(500).send(error.message)}
});

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
            }
        );
        const registered = await signUpUser.save();
        res.redirect('/');
       }
       else {
        res.send("Passwords do not match")
       }
    }
    catch (error) {
        res.status(400).send(error);
    }
})

  app.post('/verify', async (req,res) => {
    try {
        const {email,password} = req.body;

        const user = await User.findOne({email});
        console.log(email,password);
        if(!user) {
             throw new Error('User not found.');
        }
        const isPasswordValid = password === user.password;
        if(!isPasswordValid) {
            throw new Error("Invalid email or password.")
        }
        return res.status(200).json({ id: user._id, name: user.name });   
    }
    catch(error) {
        console.log(error)
        if(error.message == 'User not found.' || error.message == 'Invalid email or password.')  {
        return res.status(401).send(error.message);
        }
        else {
            console.log(error);
            return res.status(500).send('Internal server error.');
        }
    }
})



app.post('/login',async (req,res) => {
    try {
        const {email,password} = req.body;
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).send("User not found. Please sign up first.")
        }
        const isPasswordValid = password === user.password;
        if(!isPasswordValid) {
            return res.status(400).send("Invalid email or password.")
        }
         return res.status(200).json({id: user.id});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/api/user/:id", async (req, res) => {
    try { 
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("User not found.");
        }
        res.json({
            name: user.name,
            id: user._id,
            data: user.data,
        });
    } catch (error) {   
        res.status(500).send(error.message);
    }
});


app.post('/api/entry', async (req, res) => {
    try {
        const { userId, website, username, password, notes } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const newEntry = { website, username, password, notes };
        user.data.push(newEntry); // Add the new entry to the `data` array

        await user.save();

        res.status(201).send({ message: "Entry added successfully!"});
    } catch (error) {
        res.status(500).send("Failed to add entry.");
    }
});

app.put('/api/entry/:userId/:entryId', async (req, res) => {
    try{
        const {userId, entryId} = req.params;
        const { website, username, password, notes } = req.body;
        console.log(userId,entryId);
        const user = await User.findById(userId);
       
        if(!user) {
            return res.status(404).send("User not found.")
        }
        const entryIndex = user.data.findIndex((entry) => entry._id.toString() === entryId);
        if(entryIndex === -1) {
            return res.status(404).send("Entry not found.")
        }
        user.data[entryIndex] = {...user.data[entryIndex],website,username,password,notes};

        await user.save();

        res.status(200).send({message: "Entry updated successfully."})
    }catch (error) {
        console.log(error);
        res.status(500).send("Failed to udpate entry.")
    }
})

app.delete('/api/entry/:userId/:entryId', async (req, res) => {
    try {
        const { userId, entryId } = req.params;
       
        const user = await User.findById(userId);
       
        if (!user) {
            return res.status(404).send("User not found.");
        }

        const entryIndex = user.data.findIndex((entry) => entry._id.toString() === entryId);
        
        if (entryIndex === -1) {
            return res.status(404).send("Entry not found.");
        }

        user.data.splice(entryIndex, 1); 
        await user.save(); 

        res.status(200).send({ message: "Entry deleted successfully!" });
    } catch (error) {
        res.status(500).send("Failed to delete entry.");
    }
});


app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
} )