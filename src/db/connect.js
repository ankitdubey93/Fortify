require('dotenv').config();
const mongoose = require('mongoose');


const connectionString = process.env.MONGODB_URI;



    mongoose.connect(connectionString).then(() => {console.log('CONNECTED TO THE DB.....')}).catch(
        (err) => console.log("no connection to database")
    )