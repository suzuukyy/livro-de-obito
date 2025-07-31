# Configuração do Sistema de Email - São Francisco

## ✅ Problema Resolvido

O sistema agora envia emails automáticos para cada novo registro de óbito cadastrado.

## 📧 Como Configurar o Email

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta do projeto com as seguintes configurações:

```
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gmail
EMAIL_DESTINATARIO=email-para-receber-backups@exemplo.com
```

### 2. Configurar Gmail (Recomendado)

1. **Ativar autenticação de 2 fatores** na sua conta Gmail
2. **Gerar senha de app**:
   - Acesse: https://myaccount.google.com/security
   - Clique em "Senhas de app"
   - Selecione "Aplicativo personalizado"
   - Digite "Sistema Livro Óbito"
   - Use a senha gerada no arquivo `.env`

### 3. Alternativa Sem Configuração

Se não configurar as variáveis de ambiente, o sistema continuará funcionando normalmente, apenas não enviará emails (será exibida mensagem no console).

## 🚀 Como Iniciar o Sistema

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start
```

O servidor rodará em: http://localhost:3000

## 📋 O que Acontece Agora

- ✅ Cada novo registro salvo dispara automaticamente um email
- ✅ Email contém todos os dados do registro formatados
- ✅ Email tem visual profissional da São Francisco
- ✅ Sistema funciona mesmo sem email configurado
- ✅ Logs no console mostram status do envio

## 🔧 Testando

1. Configure o email seguindo os passos acima
2. Inicie o servidor
3. Faça login no sistema (usuário: `saofranciscof`, senha: `sf1234$$`)
4. Cadastre um novo registro
5. Verifique se o email chegou na caixa de entrada configurada

## 📞 Suporte

Se tiver problemas com a configuração do email, verifique:
- Se as credenciais estão corretas no arquivo `.env`
- Se a senha de app foi gerada corretamente
- Se o email de destino está correto
- Os logs no console do servidor para mais detalhes
