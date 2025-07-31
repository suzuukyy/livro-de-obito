const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// Arquivo de dados
const REGISTROS_FILE = path.join(__dirname, 'registros.json');

// Função para ler registros
function lerRegistros() {
    try {
        if (fs.existsSync(REGISTROS_FILE)) {
            const data = fs.readFileSync(REGISTROS_FILE, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Erro ao ler registros:', error);
        return [];
    }
}

// Função para salvar registros
function salvarRegistros(registros) {
    try {
        fs.writeFileSync(REGISTROS_FILE, JSON.stringify(registros, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar registros:', error);
        return false;
    }
}

// Rotas da API
app.get('/api/registros', (req, res) => {
    try {
        const registros = lerRegistros();
        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar registros:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.post('/api/registros', (req, res) => {
    try {
        const novoRegistro = req.body;
        const registros = lerRegistros();
        
        // Gerar ID único
        const maxId = registros.length > 0 ? Math.max(...registros.map(r => r.id || 0)) : 0;
        novoRegistro.id = maxId + 1;
        novoRegistro.timestamp = new Date().toISOString();
        
        registros.push(novoRegistro);
        
        if (salvarRegistros(registros)) {
            res.status(201).json(novoRegistro);
        } else {
            res.status(500).json({ error: 'Erro ao salvar registro' });
        }
    } catch (error) {
        console.error('Erro ao criar registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

app.delete('/api/registros/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const registros = lerRegistros();
        
        const indice = registros.findIndex(r => r.id === id);
        if (indice === -1) {
            return res.status(404).json({ error: 'Registro não encontrado' });
        }
        
        registros.splice(indice, 1);
        
        if (salvarRegistros(registros)) {
            res.json({ message: 'Registro removido com sucesso' });
        } else {
            res.status(500).json({ error: 'Erro ao remover registro' });
        }
    } catch (error) {
        console.error('Erro ao remover registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Rota para envio de email
app.post('/api/enviar-email', async (req, res) => {
    try {
        const { destinatario, assunto, texto, anexo } = req.body;
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return res.status(500).json({ error: 'Configuração de email não encontrada' });
        }
        
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: destinatario,
            subject: assunto,
            text: texto
        };
        
        if (anexo) {
            mailOptions.attachments = [{
                filename: 'backup-registros.pdf',
                content: anexo,
                encoding: 'base64'
            }];
        }
        
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email enviado com sucesso' });
        
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        res.status(500).json({ error: 'Erro ao enviar email' });
    }
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para página admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
});

module.exports = app;
