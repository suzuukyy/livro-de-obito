# 📧 CONFIGURAÇÃO DO SISTEMA DE BACKUP POR EMAIL

## 🎯 COMO CONFIGURAR O ENVIO REAL DE EMAILS

Para que os emails cheguem realmente na sua caixa de entrada, siga estes passos:

### 1️⃣ **CRIAR CONTA NO EMAILJS**

1. Acesse: https://www.emailjs.com/
2. Clique em "Sign Up" (Cadastrar)
3. Crie sua conta gratuita
4. Confirme seu email

### 2️⃣ **CONFIGURAR SERVIÇO DE EMAIL**

1. No painel do EmailJS, clique em "Email Services"
2. Clique em "Add New Service"
3. Escolha "Gmail" (recomendado)
4. Conecte sua conta Gmail
5. Anote o **Service ID** (ex: service_xxxxxxx)

### 3️⃣ **CRIAR TEMPLATE DE EMAIL**

1. Clique em "Email Templates"
2. Clique em "Create New Template"
3. Use este template:

```
Assunto: {{subject}}

Para: {{to_name}}
De: {{from_name}}

{{message}}

---
Anexo: PDF do registro em base64
{{pdf_content}}
```

4. Salve e anote o **Template ID** (ex: template_xxxxxxx)

### 4️⃣ **OBTER CHAVE PÚBLICA**

1. Vá em "Account" > "General"
2. Copie sua **Public Key** (ex: user_xxxxxxxxxxxxxxx)

### 5️⃣ **ATUALIZAR O CÓDIGO**

Abra o arquivo `script.js` e encontre esta seção:

```javascript
const EMAIL_CONFIG = {
    serviceId: 'service_gmail', // COLE SEU SERVICE ID AQUI
    templateId: 'template_backup', // COLE SEU TEMPLATE ID AQUI
    publicKey: 'mOqKOKTlHqhNgqYeH' // COLE SUA PUBLIC KEY AQUI
};
```

Substitua pelos seus valores reais do EmailJS.

### 6️⃣ **TESTAR O SISTEMA**

1. Acesse o sistema: http://127.0.0.1:53243
2. Faça login com: `saofranciscof` / `sf1234$$`
3. Configure seu email na seção "📧 Configuração de Backup por Email"
4. Clique em "📧 Testar Email"
5. Verifique sua caixa de entrada!

### 7️⃣ **USAR O BACKUP AUTOMÁTICO**

Agora, sempre que você cadastrar um novo óbito:
1. ✅ O registro será salvo no sistema
2. 📧 Um email será enviado automaticamente
3. 📄 O PDF completo será anexado
4. 📥 Chegará na sua caixa de entrada!

## 🔧 **SOLUÇÃO DE PROBLEMAS**

### ❌ "Erro ao enviar email"
- Verifique sua conexão com a internet
- Confirme se as configurações do EmailJS estão corretas
- Verifique se o template está configurado corretamente

### ❌ "EmailJS não inicializado"
- Recarregue a página
- Verifique se a Public Key está correta
- Confirme se o serviço EmailJS está ativo

### ❌ "Email não chegou"
- Verifique a pasta de spam/lixo eletrônico
- Confirme se o email de destino está correto
- Teste primeiro com o botão "📧 Testar Email"

## 🎉 **PRONTO!**

Seu sistema agora envia emails reais para sua caixa de entrada!

**NUNCA MAIS PERCA UM REGISTRO DE ÓBITO!** 🚀
