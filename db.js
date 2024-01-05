const mongoose = require("mongoose");
require('dotenv').config();


mongoose.connect(process.env.MONGO_URI).then(()=>console.info("DB connected")).catch(e=>console.error(`Erro no connected DB: ${e}`))

