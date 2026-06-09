const mongoose = require('mongoose');
require('dotenv').config();

async function database_mongo() {
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB Connected");
    }
    catch (err) {
        console.log(err);
    }

}

module.exports = database_mongo;