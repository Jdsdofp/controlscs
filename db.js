const mongoose = require("mongoose");

mongoose.connect('mongodb+srv://dgmap:eUGY7AF2zVSpM5lK@mpgd.oauqahr.mongodb.net/mpgd?retryWrites=true&w=majority').then(()=>console.info("DB connected")).catch(e=>console.error(`Erro no connected DB: ${e}`))

