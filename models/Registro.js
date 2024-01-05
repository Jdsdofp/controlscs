const mongoose = require("mongoose");


const solicitacaoSchema = new mongoose.Schema({
    solicitante: String,
    cod_registro: Number,
    cod_loja: Number,
    loja: String,
    arquivo_1: String,
    arquivo_2: String,
    class_servico: [String],
    data_abertura: String,
    data_solicitacao: String,
    desc_servico: String,
    fornecedor: String,
    tp_urg: String,
    gr_complexidade: String,
    nr_chamado: String,
    nr_solicitacao: Number,
    status: String,
    oc: Number,
    NF: String,
    atendente: String,
    data_atendimento: String,
    imagem_1: String,
    imagem_2: String,
    imagem_3: String,
    imagem_4: String
});

const Registro = mongoose.model('Registro', solicitacaoSchema);
module.exports = Registro;