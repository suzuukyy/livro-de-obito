const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const nodemailer = require('nodemailer');

// Configuração de email
const EMAIL_CONFIG = {
    service: 'gmail', // Pode ser alterado para outros provedores
    user: process.env.EMAIL_USER || '', // Email do remetente
    pass: process.env.EMAIL_PASS || '', // Senha do app ou senha do email
    destinatario: process.env.EMAIL_DESTINATARIO || '' // Email de destino para backup
};

// Configurar transporter do nodemailer
let emailTransporter = null;
if (EMAIL_CONFIG.user && EMAIL_CONFIG.pass) {
    emailTransporter = nodemailer.createTransporter({
        service: EMAIL_CONFIG.service,
        auth: {
            user: EMAIL_CONFIG.user,
            pass: EMAIL_CONFIG.pass
        }
    });
    console.log('Sistema de email configurado');
} else {
    console.log('Sistema de email não configurado - defina EMAIL_USER, EMAIL_PASS e EMAIL_DESTINATARIO');
}

// Tentar usar SQLite, se não disponível usar JSON como fallback
let sqlite3;
try {
    sqlite3 = require('sqlite3').verbose();
    console.log('SQLite3 carregado com sucesso');
} catch (error) {
    console.log('SQLite3 não encontrado, usando arquivo JSON como fallback');
    sqlite3 = null;
}

// Configuração do banco de dados
const DB_FILE = './registros.db';
const JSON_FILE = './registros.json';
let db;

// Inicializar banco de dados
function inicializarBanco() {
    if (sqlite3) {
        db = new sqlite3.Database(DB_FILE, (err) => {
            if (err) {
                console.error('Erro ao conectar com SQLite:', err.message);
                return;
            }
            console.log('Conectado ao banco SQLite.');
        });
        
        // Criar tabela se não existir
        db.run(`CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            data TEXT NOT NULL,
            servicos TEXT NOT NULL,
            cartorio TEXT NOT NULL,
            endereco TEXT NOT NULL,
            cemiterio TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err.message);
            } else {
                console.log('Tabela de registros criada/verificada com sucesso.');
            }
        });
    }
}

// Função para ler registros (SQLite ou JSON)
function lerRegistros() {
    return new Promise((resolve, reject) => {
        if (sqlite3 && db) {
            db.all('SELECT * FROM registros ORDER BY created_at DESC', [], (err, rows) => {
                if (err) {
                    console.error('Erro ao ler registros do SQLite:', err.message);
                    resolve(lerRegistrosJSON());
                } else {
                    resolve(rows);
                }
            });
        } else {
            resolve(lerRegistrosJSON());
        }
    });
}

// Função para ler registros do JSON (fallback)
function lerRegistrosJSON() {
    try {
        if (fs.existsSync(JSON_FILE)) {
            const data = fs.readFileSync(JSON_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.log('Erro ao ler registros JSON:', error);
    }
    return [];
}

// Função para salvar registro (SQLite ou JSON)
function salvarRegistro(registro) {
    return new Promise((resolve, reject) => {
        if (sqlite3 && db) {
            const stmt = db.prepare(`INSERT INTO registros 
                (nome, data, servicos, cartorio, endereco, cemiterio, timestamp) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`);
            
            stmt.run([
                registro.nome,
                registro.data,
                registro.servicos,
                registro.cartorio,
                registro.endereco,
                registro.cemiterio,
                registro.timestamp
            ], function(err) {
                if (err) {
                    console.error('Erro ao salvar no SQLite:', err.message);
                    resolve(salvarRegistroJSON(registro));
                } else {
                    registro.id = this.lastID;
                    resolve({ success: true, registro });
                }
            });
            
            stmt.finalize();
        } else {
            resolve(salvarRegistroJSON(registro));
        }
    });
}

// Função para salvar registro no JSON (fallback)
function salvarRegistroJSON(registro) {
    try {
        const registros = lerRegistrosJSON();
        registro.id = Date.now().toString();
        registros.push(registro);
        fs.writeFileSync(JSON_FILE, JSON.stringify(registros, null, 2));
        return { success: true, registro };
    } catch (error) {
        console.log('Erro ao salvar registro JSON:', error);
        return { success: false, error: 'Erro ao salvar registro' };
    }
}

// Função para enviar email de backup
async function enviarEmailBackup(registro) {
    if (!emailTransporter || !EMAIL_CONFIG.destinatario) {
        console.log('Email não configurado - pulando envio de backup');
        return;
    }

    try {
        const dataObito = new Date(registro.data).toLocaleDateString('pt-BR');
        const dataRegistro = new Date(registro.timestamp).toLocaleDateString('pt-BR') + ' às ' + new Date(registro.timestamp).toLocaleTimeString('pt-BR');

        const mailOptions = {
            from: EMAIL_CONFIG.user,
            to: EMAIL_CONFIG.destinatario,
            subject: `Novo Registro de Óbito - ${registro.nome} - São Francisco`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2c3e50; margin: 0;">SÃO FRANCISCO</h1>
                        <h2 style="color: #7f8c8d; margin: 10px 0;">Backup Automático - Novo Registro de Óbito</h2>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Dados do Registro:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Nome do Falecido:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${registro.nome}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Data do Óbito:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${dataObito}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Serviços:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${registro.servicos}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Cartório:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${registro.cartorio}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Endereço:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${registro.endereco}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Cemitério:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${registro.cemiterio}</td></tr>
                            <tr><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Data de Registro:</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${dataRegistro}</td></tr>
                        </table>
                    </div>
                    
                    <div style="text-align: center; color: #7f8c8d; font-size: 12px; margin-top: 30px;">
                        <p>Este é um backup automático gerado pelo Sistema de Livro de Óbito da São Francisco.</p>
                        <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                </div>
            `
        };

        await emailTransporter.sendMail(mailOptions);
        console.log(`Email de backup enviado para ${EMAIL_CONFIG.destinatario} - Registro: ${registro.nome}`);
    } catch (error) {
        console.error('Erro ao enviar email de backup:', error);
    }
}

// Função para excluir registro
async function excluirRegistro(id) {
    if (sqlite3 && db) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM registros WHERE id = ?', [id], function(err) {
                if (err) {
                    console.error('Erro ao excluir registro do SQLite:', err.message);
                    resolve({ success: false, error: 'Erro ao excluir registro' });
                } else if (this.changes === 0) {
                    resolve({ success: false, error: 'Registro não encontrado' });
                } else {
                    console.log(`Registro ${id} excluído do SQLite`);
                    resolve({ success: true, message: 'Registro excluído com sucesso' });
                }
            });
        });
    } else {
        // Fallback para JSON
        return excluirRegistroJSON(id);
    }
}

// Função para excluir registro do JSON (fallback)
function excluirRegistroJSON(id) {
    try {
        let registros = [];
        if (fs.existsSync(JSON_FILE)) {
            const data = fs.readFileSync(JSON_FILE, 'utf8');
            registros = JSON.parse(data);
        }
        
        const indiceOriginal = registros.findIndex(r => r.id && r.id.toString() === id.toString());
        
        if (indiceOriginal === -1) {
            return { success: false, error: 'Registro não encontrado' };
        }
        
        // Remover o registro
        registros.splice(indiceOriginal, 1);
        
        // Salvar arquivo atualizado
        fs.writeFileSync(JSON_FILE, JSON.stringify(registros, null, 2));
        console.log(`Registro ${id} excluído do JSON`);
        
        return { success: true, message: 'Registro excluído com sucesso' };
    } catch (error) {
        console.error('Erro ao excluir registro do JSON:', error);
        return { success: false, error: 'Erro ao excluir registro' };
    }
}

// Função para processar exclusão (usada pelo endpoint DELETE)
async function processarExclusao(registroId, res) {
    console.log('Processando exclusão do registro ID:', registroId);
    
    if (!registroId) {
        console.error('ID do registro não fornecido');
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'ID do registro é obrigatório' }));
        return;
    }
    
    try {
        const resultado = await excluirRegistro(registroId);
        console.log('Resultado da exclusão:', resultado);
        
        if (resultado.success) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resultado));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(resultado));
        }
    } catch (error) {
        console.error('Erro ao processar exclusão:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Erro ao excluir registro' }));
    }
}

// Inicializar banco ao carregar o módulo
inicializarBanco();

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // API para registros
    if (pathname === '/api/registros' || pathname.startsWith('/api/registros/')) {
        if (req.method === 'GET' && pathname === '/api/registros') {
            // Retornar todos os registros
            lerRegistros().then(registros => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(registros));
            }).catch(error => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Erro ao buscar registros' }));
            });
            return;
        } else if (req.method === 'POST' && pathname === '/api/registros') {
            // Adicionar novo registro
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const novoRegistro = JSON.parse(body);
                    
                    // Adicionar timestamp
                    novoRegistro.timestamp = new Date().toISOString();
                    
                    const resultado = await salvarRegistro(novoRegistro);
                    
                    if (resultado.success) {
                        // Enviar email de backup
                        enviarEmailBackup(novoRegistro);
                        
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resultado));
                    } else {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(resultado));
                    }
                } catch (error) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Dados inválidos' }));
                }
            });
            return;
        } else if (req.method === 'DELETE' && pathname.startsWith('/api/registros/')) {
            console.log('🗑️ Requisição DELETE recebida para:', pathname);
            
            // Extrair ID da URL: /api/registros/{id}
            const urlParts = pathname.split('/');
            const registroId = urlParts[3]; // /api/registros/{id}
            
            console.log('🗑️ ID extraído da URL:', registroId);
            
            if (!registroId || registroId === '') {
                console.error('❌ ID do registro não fornecido na URL');
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'ID do registro é obrigatório na URL' }));
                return;
            }
            
            // Processar exclusão
            await processarExclusao(registroId, res);
            return;
        }
        return;
    }
    
    // Servir arquivos estáticos
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Página não encontrada</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Erro do servidor: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
