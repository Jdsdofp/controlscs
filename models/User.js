const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    matricula: {type: Number, required: true, unique: true},
    senha: {type: String, required: true},
    nome: {type: String},
    isAdmin: {type: Number}
})


userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('senha')){
        user.senha = await bcrypt.hash(user.senha, 10);
    }
    next()
});


const User = mongoose.model('User', userSchema);
module.exports = User;