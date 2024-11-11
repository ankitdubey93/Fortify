const express = require('express');
const path = require('path');

const PORT = 3000;

const app = express();

const static_path = path.join(__dirname, "../public")

app.use(express.static(static_path));

app.get('/',(req,res) => {
    res.redirect("/");
})



app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`)
} )