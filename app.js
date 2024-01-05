const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const Registro = require("./models/Registro");


const app = express();
app.use(cookieParser())

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}))
app.use(express.json())
require('./db');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});




app.get('/register', (req, res) => {
    res.render('register');
    
});

app.post('/register', async (req, res) => {
    try {
        const { matricula, senha, nome, isAdmin } = req.body;
        const user = new User({ matricula, senha, nome, isAdmin });
        await user.save();
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Erro no registro');
    }
});


// Middleware para redirecionamento se autenticado
function redirectIfAuthenticated(req, res, next) {
    const token = req.cookies.token;

    if (token) {
        // Usuário autenticado, redirecionar para o dashboard
        return res.redirect('/dashboard');
    }

    // Continuar para a próxima middleware se o usuário não estiver autenticado
    next();
}


// Rota de login
app.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    
    try {
        const { matricula, senha } = req.body;
        const user = await User.findOne({ matricula });
        
        if (user && bcrypt.compareSync(senha, user.senha)) {
            const token = jwt.sign({ matricula: user.matricula }, 'seuSegredo');
            res.cookie('token', token);
            
            res.json({success: true, redirect: '/dashboard'})

        } else {
            res.status(401).json({ success: false, message: 'Credenciais inválidas' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erro no login' });
    }
});

function authenticateToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    jwt.verify(token, 'seuSegredo', (err, decoded) => {
        if (err) {
            return res.redirect('/login');
        }
        req.user = decoded;
        next();
    });

}



// Área protegida
app.get('/dashboard', authenticateToken, async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'seuSegredo');
        const user = await User.findOne({ matricula: decoded.matricula });

        if (!user) {
            return res.redirect('/login');
        }
        

        const registroCards = await Registro.find()
        // Implemente a lógica de paginação
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10; // Defina o tamanho da página
        const skip = (page - 1) * pageSize;

        const registros = await Registro.find().skip(skip).limit(pageSize);
        const totalRegistros = await Registro.countDocuments();

        const totalPages = Math.ceil(totalRegistros / pageSize);

        const registrosAbertos = registroCards.filter(registro => registro.status === 'aberto');
        const registrosFechados = registroCards.filter(registro => registro.status === 'fechado');
        const registrosCancelados = registroCards.filter(registro => registro.status === 'cancelado');
        const registrosFinalizados = registroCards.filter(registro => registro.status === 'finalizada');
        
        const totalGeral = registroCards.length;
        const n1 = registrosFinalizados.length;
        const percent = (n1 / totalGeral) * 100;

        // Renderizar a página protegida com os dados paginados
        res.render('dashboard', { 
            matricula: decoded.matricula, 
            nome: user.nome, 
            isAdmin: user.isAdmin,
            registros,
            registrosAbertos,
            registrosFechados,
            registrosCancelados,
            registrosFinalizados,
            totalGeral,
            percent,
            paginaAtual: page,
            totalPages,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});

app.get('/views', async (req, res)=>{
    const token = req.cookies.token;

    if (!token) {
        return res.json({success: false, message: 'Sessão expirada!'});
    }

    try {
        const decoded = jwt.verify(token, 'seuSegredo');
        const user = await User.findOne({ matricula: decoded.matricula });

        if (!user) {
            return res.json({success: false, message: 'Usuario invalido!'});
        }
        
        const registros = await Registro.find()
        // Renderizar a página protegida com os dados paginados
        res.json({
            registros
        });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
})





app.get('/logout', (req, res) => {
    // Destruir o cookie de autenticação
    res.clearCookie('token');
    // Redirecionar para a página de login
    res.redirect('/login');
});


app.get("*", (req, res)=>{
    res.redirect("/login")
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>console.log(`Rodando na port ${PORT}`))