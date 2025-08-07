# Sistema de Livro de Óbito

Sistema web para gerenciamento de registros de óbito com frontend em HTML/JavaScript e backend em Node.js/Express.

## Estrutura do Projeto

```
├── index.html          # Página de login do sistema
├── admin.html          # Página administrativa principal
├── teste-registros.html # Página de testes e diagnóstico
├── script.js           # Lógica frontend e funções JavaScript
├── app.js              # Backend Node.js com Express
├── styles.css          # Estilos CSS do sistema
├── registros.json      # Arquivo de armazenamento de dados
├── package.json        # Configuração do projeto Node.js
└── node_modules/       # Dependências do projeto
```

## Páginas do Sistema

### 1. index.html - Página de Login

**Função:** Ponto de entrada do sistema, responsável pela autenticação de usuários.

**Características:**
- Formulário de login com campos de usuário e senha
- Validação de credenciais através de `script.js`
- Integração com sistema de segurança avançado
- Design responsivo para dispositivos móveis
- Proteção contra tentativas de acesso não autorizadas

### 2. admin.html - Página Administrativa

**Função:** Interface principal para gerenciamento de registros de óbito.

**Características:**
- CRUD completo (Create, Read, Update, Delete) de registros
- Formulário para criação de novos registros
- Tabela para exibição de registros com paginação
- Sistema de busca e filtros avançados
- Funcionalidade de backup por email
- Geração de PDF dos registros
- Design totalmente responsivo para mobile
- Interface intuitiva e amigável

**Seções principais:**
- Cabeçalho com informações da empresa
- Formulário de criação de novos registros
- Seção de configuração de email
- Sistema de busca com filtros por nome, serviços e data
- Tabela de registros com paginação
- Controles de navegação

### 2.1 admin-simples.html - Interface Alternativa

**Função:** Interface simplificada para gerenciamento de registros.

**Características:**
- Design minimalista e direto
- Funcionalidades básicas de CRUD
- Formulário simples para criação de registros
- Lista de registros ordenada por data
- Mensagens de feedback para o usuário
- Layout responsivo básico

### 3. teste-registros.html - Página de Testes

**Função:** Ferramenta de diagnóstico e teste do sistema.

**Características:**
- Visualização direta dos registros do banco de dados
- Teste de conectividade com a API backend
- Funcionalidade de exclusão de registros
- Feedback visual de sucesso/erro
- Carregamento automático ao abrir a página

**Funcionalidades:**
- Botão "CARREGAR REGISTROS DO BANCO" para testar a API
- Botão "LIMPAR" para limpar resultados
- Exibição detalhada de todos os registros
- Confirmação de exclusão de registros
- Logs de depuração no console

## Arquivos de Código

### script.js

**Função:** Lógica frontend do sistema.

**Principais funcionalidades:**
- Sistema de segurança avançado com hash de senhas
- Validação de credenciais e controle de sessão
- Funções de CRUD para interação com a API
- Manipulação do DOM para atualização da interface
- Sistema de paginação e busca
- Geração de PDF dos registros
- Configuração e envio de emails
- Tratamento de responsividade para mobile

### app.js

**Função:** Backend principal do sistema utilizando Node.js e Express.

**Principais funcionalidades:**
- Rotas da API REST para gerenciamento de registros (GET, POST, PUT, DELETE)
- Leitura e escrita no arquivo `registros.json`
- Configuração de CORS para segurança
- Middleware para parsing de JSON
- Geração de IDs únicos para registros
- Tratamento de erros e validações
- Integração com sistema de envio de emails
- Serviço de arquivos estáticos

### server.js

**Função:** Servidor alternativo com suporte a SQLite como fallback.

**Características:**
- Implementação com módulos nativos do Node.js (http, fs)
- Suporte a banco de dados SQLite com fallback para JSON
- Sistema de email para backup automático
- Rotas da API REST para gerenciamento de registros
- Serviço de arquivos estáticos

### styles.css

**Função:** Estilização completa do sistema.

**Características:**
- Design moderno e profissional
- Paleta de cores personalizada
- Layout responsivo com media queries
- Animações e transições suaves
- Estilos específicos para mobile
- Componentes reutilizáveis

## Pasta node_modules

**Função:** Dependências do projeto Node.js.

**Principais dependências:**
- **express**: Framework web para Node.js
- **nodemailer**: Envio de emails
- **dotenv**: Gerenciamento de variáveis de ambiente

## Arquivo de Dados

### registros.json

**Função:** Armazenamento persistente dos registros de óbito.

**Formato:** Arquivo JSON contendo um array de objetos com os seguintes campos:
- `id`: Identificador único do registro
- `nome`: Nome do falecido
- `data`: Data do óbito
- `servicos`: Serviços prestados
- `cartorio`: Cartório responsável
- `endereco`: Endereço do falecido
- `cemiterio`: Cemitério de sepultamento
- `timestamp`: Data e hora do registro

## Funcionalidades Especiais

### Sistema de Segurança
- Hash seguro de senhas
- Bloqueio por tentativas de login
- Monitoramento de inatividade
- Proteção contra ferramentas de desenvolvedor
- Tokens de sessão únicos

### Responsividade Mobile
- Design adaptativo para diferentes tamanhos de tela
- Media queries otimizadas
- Elementos touch-friendly
- Layout ajustável para mobile

### Backup por Email
- Configuração de email para backup automático
- Envio de PDF com registros
- Integração com EmailJS

### Geração de PDF
- Exportação de registros em formato PDF
- Layout profissional para documentos
- Paginação e formatação adequada

## Como Usar

1. **Instalação:**
   ```bash
   npm install
   ```

2. **Configuração:**
   - Copiar o arquivo `.env.example` para `.env`
   - Configurar as variáveis de ambiente no arquivo `.env`:
     - `EMAIL_USER`: Email do remetente (Gmail recomendado)
     - `EMAIL_PASS`: Senha de app do Gmail (não use sua senha normal)
     - `EMAIL_DESTINATARIO`: Email de destino para receber os backups
   - Para criar uma senha de app no Gmail: https://support.google.com/accounts/answer/185833

3. **Execução:**
   ```bash
   npm start
   ```

4. **Acesso:**
   - Acesse `http://localhost:3000` para a página de login
   - Utilize as credenciais configuradas para acessar o sistema

## Manutenção

- O sistema realiza backup automático dos registros
- Logs de erro são registrados no console
- Atualizações podem ser feitas via Git
- O arquivo `registros.json` deve ser mantido como backup adicional
