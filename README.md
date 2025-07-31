# Sistema de Livro de Óbito - São Francisco Serviços Funerários

Sistema completo para gerenciamento de registros de óbito com interface web moderna e segura.

## 🚀 Funcionalidades

- **Sistema de Login Seguro** - Autenticação com hash e proteção contra ataques
- **Gestão de Registros** - Criar, visualizar, buscar e remover registros de óbito
- **Busca Avançada** - Filtros por nome, data, cartório, cemitério
- **Paginação** - Navegação eficiente entre registros
- **Geração de PDF** - Relatórios profissionais dos registros
- **Backup por Email** - Sistema automático de backup via email
- **Interface Responsiva** - Funciona em desktop, tablet e mobile

## 📋 Pré-requisitos

- Node.js 14.0.0 ou superior
- NPM 6.0.0 ou superior

## 🔧 Instalação Local

1. Clone o repositório:
```bash
git clone https://github.com/suzuukyy/livro-de-obito.git
cd livro-de-obito
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações de email.

4. Inicie o servidor:
```bash
npm start
```

5. Acesse o sistema:
- Página inicial: `http://localhost:3000`
- Área administrativa: `http://localhost:3000/admin`

## 🌐 Deploy na KingHost

### Passo 1: Preparação
1. Faça upload dos arquivos via FTP ou Git
2. Configure as variáveis de ambiente no painel da KingHost
3. Instale as dependências via terminal SSH

### Passo 2: Configuração
```bash
# No terminal SSH da KingHost
cd public_html
npm install --production
```

### Passo 3: Configuração do Node.js
1. No painel da KingHost, vá em "Node.js"
2. Configure:
   - **Arquivo de entrada**: `app.js`
   - **Versão do Node.js**: 14.x ou superior
   - **Porta**: Deixe automático (a KingHost define)

### Passo 4: Variáveis de Ambiente
Configure no painel da KingHost:
```
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
PORT=3000
```

### Passo 5: Inicialização
1. Clique em "Reiniciar Aplicação" no painel
2. Acesse seu domínio para verificar se está funcionando

## 🔐 Credenciais de Acesso

- **Usuário**: `saofranciscof`
- **Senha**: `sf1234$$`

## 📁 Estrutura do Projeto

```
livro-de-obito/
├── app.js              # Servidor principal (KingHost)
├── server.js           # Servidor local
├── index.html          # Página de login
├── admin.html          # Interface administrativa
├── script.js           # JavaScript do frontend
├── styles.css          # Estilos CSS
├── registros.json      # Banco de dados JSON
├── package.json        # Configurações do Node.js
├── .env                # Variáveis de ambiente
└── README.md           # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Banco de Dados**: JSON (arquivo local)
- **PDF**: jsPDF + AutoTable
- **Email**: Nodemailer
- **Segurança**: Hash personalizado, validação de sessão

## 📧 Configuração de Email

Para o sistema de backup funcionar:

1. Use uma conta Gmail
2. Ative a verificação em 2 etapas
3. Gere uma "Senha de App" específica
4. Configure no arquivo `.env`:

```
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=sua-senha-de-app-de-16-digitos
```

## 🔒 Segurança

- Hash personalizado para senhas
- Proteção contra força bruta
- Validação de sessão com timeout
- Sanitização de dados de entrada
- HTTPS recomendado em produção

## 📞 Suporte

Para suporte técnico, entre em contato através do repositório GitHub.

## 📄 Licença

Este projeto está licenciado sob a Licença ISC.

---

**São Francisco Serviços Funerários** - Sistema desenvolvido com tecnologia moderna e segura.
