# Guia de Deploy na KingHost

## Passo a Passo para Deploy

### 1. Preparação dos Arquivos
- ✅ app.js criado (servidor Express otimizado)
- ✅ package.json atualizado com dependências corretas
- ✅ README.md com instruções completas

### 2. Upload dos Arquivos
1. Acesse o painel da KingHost
2. Vá em "Gerenciador de Arquivos" ou use FTP
3. Faça upload de todos os arquivos para a pasta `public_html`

### 3. Configuração do Node.js
1. No painel KingHost, vá em "Node.js"
2. Configure:
   - **Arquivo Principal**: `app.js`
   - **Versão Node.js**: 16.x ou superior
   - **Comando de Start**: `node app.js`

### 4. Instalação de Dependências
No terminal SSH da KingHost:
```bash
cd public_html
npm install --production
```

### 5. Variáveis de Ambiente
Configure no painel da KingHost em "Variáveis de Ambiente":
```
EMAIL_USER=saofranciscosf65@gmail.com
EMAIL_PASS=sua-senha-de-app-gmail
NODE_ENV=production
```

### 6. Configurações de Domínio
- O sistema estará disponível no seu domínio principal
- Página de login: `https://seudominio.com`
- Área admin: `https://seudominio.com/admin`

### 7. Teste Final
1. Reinicie a aplicação no painel
2. Acesse o site
3. Teste o login com: `saofranciscof` / `sf1234$$`
4. Verifique todas as funcionalidades

## Credenciais do Sistema
- **Usuário**: saofranciscof
- **Senha**: sf1234$$

## Funcionalidades Disponíveis
- ✅ Sistema de login seguro
- ✅ Cadastro de registros de óbito
- ✅ Busca e filtros avançados
- ✅ Paginação automática
- ✅ Geração de PDF
- ✅ Backup por email
- ✅ Interface responsiva

## Suporte
Em caso de problemas, verifique:
1. Se todas as dependências foram instaladas
2. Se as variáveis de ambiente estão configuradas
3. Se o arquivo app.js está sendo executado
4. Logs de erro no painel da KingHost
