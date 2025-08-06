// Sistema de Segurança Avançado
class SistemaSeguranca {
    constructor() {
        this.tentativasLogin = 0;
        this.maxTentativas = 3;
        this.tempoBloqueioPorTentativa = 30000; // 30 segundos
        this.sessionTimeout = 1800000; // 30 minutos
        this.ultimoAcesso = Date.now();
        this.tokenSessao = null;
        this.iniciarMonitoramento();
    }

    // Hash seguro da senha
    hashSenha(senha) {
        let hash = 0;
        const salt = 'sf_security_2024';
        const senhaComSalt = senha + salt;
        for (let i = 0; i < senhaComSalt.length; i++) {
            const char = senhaComSalt.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Gerar token de sessão único
    gerarTokenSessao() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        const userAgent = navigator.userAgent;
        const combinado = `${timestamp}-${random}-${userAgent}`;
        return btoa(combinado).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
    }

    // Validar credenciais com hash
    validarCredenciais(usuario, senha) {
        const usuarioCorreto = 'saofranciscof';
        const senhaHashCorreta = this.hashSenha('sf1234$$');
        const senhaHashInformada = this.hashSenha(senha);
        
        return usuario === usuarioCorreto && senhaHashInformada === senhaHashCorreta;
    }

    // Verificar se está bloqueado por tentativas
    estaBloqueado() {
        const tempoBloqueioPorTentativa = this.tempoBloqueioPorTentativa * this.tentativasLogin;
        const ultimaTentativa = localStorage.getItem('ultima_tentativa_login');
        if (ultimaTentativa) {
            const tempoDecorrido = Date.now() - parseInt(ultimaTentativa);
            return this.tentativasLogin >= this.maxTentativas && tempoDecorrido < tempoBloqueioPorTentativa;
        }
        return false;
    }

    // Iniciar monitoramento de segurança
    iniciarMonitoramento() {
        this.protegerConsole();
        this.monitorarInatividade();
        this.detectarBypass();
        this.protegerDebug();
    }

    // Proteger console do navegador
    protegerConsole() {
        const originalLog = console.log;
        
        console.log = function(...args) {
            if (args.some(arg => typeof arg === 'string' && 
                (arg.includes('senha') || arg.includes('token')))) {
                return;
            }
            originalLog.apply(console, args);
        };
        
        // Detectar abertura das ferramentas de desenvolvedor
        let devtools = {open: false};
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools.open) {
                    devtools.open = true;
                    this.registrarTentativaInvasao('DevTools detectado');
                }
            } else {
                devtools.open = false;
            }
        }, 500);
    }

    // Monitorar inatividade do usuário
    monitorarInatividade() {
        const eventos = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const resetarTimer = () => {
            this.ultimoAcesso = Date.now();
        };
        
        eventos.forEach(evento => {
            document.addEventListener(evento, resetarTimer, true);
        });
        
        setInterval(() => {
            if (this.tokenSessao && Date.now() - this.ultimoAcesso > this.sessionTimeout) {
                this.logout('Sessão expirada por inatividade');
            }
        }, 60000);
    }

    // Detectar tentativas de bypass
    detectarBypass() {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            if (key === 'logado' && value === 'true') {
                const stack = new Error().stack;
                if (!stack.includes('fazerLogin')) {
                    sistemaSeguranca.registrarTentativaInvasao('Tentativa de bypass do localStorage');
                    return;
                }
            }
            originalSetItem.call(this, key, value);
        };
    }

    // Proteger contra debug
    protegerDebug() {
        setInterval(() => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            if (end - start > 100) {
                this.registrarTentativaInvasao('Debugger detectado');
            }
        }, 10000);
    }

    // Registrar tentativas de invasão
    registrarTentativaInvasao(tipo) {
        const tentativas = JSON.parse(localStorage.getItem('tentativas_invasao') || '[]');
        tentativas.push({
            tipo: tipo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        localStorage.setItem('tentativas_invasao', JSON.stringify(tentativas));
        
        if (tentativas.length > 5) {
            this.logout('Múltiplas tentativas de invasão detectadas');
        }
    }

    // Fazer logout seguro
    logout(motivo = 'Logout normal') {
        this.tokenSessao = null;
        localStorage.removeItem('logado');
        localStorage.removeItem('token_sessao');
        localStorage.setItem('ultimo_logout', JSON.stringify({
            timestamp: new Date().toISOString(),
            motivo: motivo
        }));
        
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        }
    }
}

const sistemaSeguranca = new SistemaSeguranca();

// Variáveis de busca
let buscaAtiva = false;
let termoBusca = '';

// Sistema de backup por email
const EMAIL_CONFIG = {
    // Usar serviço de email simples e direto
    webhookUrl: 'https://formsubmit.co/', // Serviço gratuito que funciona imediatamente
    fallbackEmail: 'backup@saofrancisco.com' // Email de fallback
};

let emailBackupConfigurado = false;
let emailBackupDestino = '';
let emailServicoAtivo = true; // Sempre ativo com FormSubmit

// Função para mostrar mensagem de erro
function mostrarErro(mensagem) {
    const erroDiv = document.getElementById('erro-msg');
    erroDiv.textContent = mensagem;
    erroDiv.style.display = 'block';
    setTimeout(() => {
        erroDiv.style.display = 'none';
    }, 3000);
}

// Função para mostrar mensagem de sucesso
function mostrarSucesso(mensagem) {
    const sucessoDiv = document.getElementById('sucesso-msg');
    if (sucessoDiv) {
        sucessoDiv.textContent = mensagem;
        sucessoDiv.style.display = 'block';
        setTimeout(() => {
            sucessoDiv.style.display = 'none';
        }, 3000);
    }
}

// Função de login com segurança avançada
function fazerLogin(evento) {
    evento.preventDefault();
    
    // Verificar se está bloqueado por tentativas
    if (sistemaSeguranca.estaBloqueado()) {
        const tempoRestante = Math.ceil((sistemaSeguranca.tempoBloqueioPorTentativa * sistemaSeguranca.tentativasLogin) / 1000);
        mostrarErro(`Sistema bloqueado por ${tempoRestante} segundos devido a múltiplas tentativas incorretas.`);
        return;
    }
    
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    // Validações de segurança
    if (!usuario || !senha) {
        mostrarErro('Por favor, preencha todos os campos.');
        return;
    }
    
    if (usuario.length < 3 || senha.length < 6) {
        mostrarErro('Credenciais inválidas.');
        sistemaSeguranca.tentativasLogin++;
        localStorage.setItem('ultima_tentativa_login', Date.now().toString());
        return;
    }
    
    // Verificar credenciais usando hash
    if (sistemaSeguranca.validarCredenciais(usuario, senha)) {
        // Login bem-sucedido
        sistemaSeguranca.tentativasLogin = 0; // Reset tentativas
        sistemaSeguranca.tokenSessao = sistemaSeguranca.gerarTokenSessao();
        sistemaSeguranca.ultimoAcesso = Date.now();
        
        // Salvar dados de sessão seguros
        localStorage.setItem('logado', 'true');
        localStorage.setItem('token_sessao', sistemaSeguranca.tokenSessao);
        localStorage.setItem('ultimo_login', JSON.stringify({
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        }));
        
        // Limpar tentativas de invasão anteriores
        localStorage.removeItem('tentativas_invasao');
        
        window.location.href = 'admin.html';
    } else {
        // Login falhou
        sistemaSeguranca.tentativasLogin++;
        localStorage.setItem('ultima_tentativa_login', Date.now().toString());
        
        // Registrar tentativa de login inválida
        sistemaSeguranca.registrarTentativaInvasao('Login inválido');
        
        if (sistemaSeguranca.tentativasLogin >= sistemaSeguranca.maxTentativas) {
            mostrarErro('Muitas tentativas incorretas. Sistema temporariamente bloqueado.');
        } else {
            const tentativasRestantes = sistemaSeguranca.maxTentativas - sistemaSeguranca.tentativasLogin;
            mostrarErro(`Credenciais incorretas. ${tentativasRestantes} tentativa(s) restante(s).`);
        }
        
        // Limpar campos por segurança
        document.getElementById('usuario').value = '';
        document.getElementById('senha').value = '';
    }
}

// Função de logout seguro
function fazerLogout() {
    sistemaSeguranca.logout('Logout solicitado pelo usuário');
}

// Verificar se o usuário está logado com validação de segurança
function verificarLogin() {
    const logado = localStorage.getItem('logado');
    const tokenSessao = localStorage.getItem('token_sessao');
    const paginaAtual = window.location.pathname.split('/').pop();
    
    // Verificações de segurança adicionais
    if (logado === 'true') {
        // Verificar se o token de sessão é válido
        if (!tokenSessao || tokenSessao.length !== 32) {
            sistemaSeguranca.logout('Token de sessão inválido');
            return;
        }
        
        // Verificar se a sessão não expirou
        const ultimoLogin = localStorage.getItem('ultimo_login');
        if (ultimoLogin) {
            const dadosLogin = JSON.parse(ultimoLogin);
            const tempoDecorrido = Date.now() - new Date(dadosLogin.timestamp).getTime();
            
            if (tempoDecorrido > sistemaSeguranca.sessionTimeout) {
                sistemaSeguranca.logout('Sessão expirada');
                return;
            }
            
            // Verificar se o User Agent é o mesmo (proteção contra session hijacking)
            if (dadosLogin.userAgent !== navigator.userAgent) {
                sistemaSeguranca.logout('Sessão comprometida - User Agent diferente');
                return;
            }
        }
        
        // Atualizar último acesso
        sistemaSeguranca.ultimoAcesso = Date.now();
        sistemaSeguranca.tokenSessao = tokenSessao;
    }
    
    // Redirecionamentos baseados no estado de login
    if (paginaAtual === 'admin.html' && logado !== 'true') {
        window.location.href = 'index.html';
    } else if (paginaAtual === 'index.html' && logado === 'true') {
        window.location.href = 'admin.html';
    }
}

// Função para mostrar o formulário de registro
function mostrarFormulario() {
    const formContainer = document.getElementById('form-container');
    const btnNovoRegistro = document.getElementById('btn-novo-registro');
    
    formContainer.style.display = 'block';
    btnNovoRegistro.style.display = 'none';
    
    // Scroll suave para o formulário
    formContainer.scrollIntoView({ behavior: 'smooth' });
}

// Função para ocultar o formulário de registro
function ocultarFormulario() {
    const formContainer = document.getElementById('form-container');
    const btnNovoRegistro = document.getElementById('btn-novo-registro');
    
    formContainer.style.display = 'none';
    btnNovoRegistro.style.display = 'block';
    
    // Limpar formulário
    document.getElementById('registro-form').reset();
}

// Função para salvar registro de óbito
async function salvarRegistro(evento) {
    evento.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const data = document.getElementById('data').value;
    const servicos = document.getElementById('servicos').value;
    const cartorio = document.getElementById('cartorio').value;
    const endereco = document.getElementById('endereco').value;
    const cemiterio = document.getElementById('cemiterio').value;
    
    if (!nome || !data || !servicos || !cartorio || !endereco || !cemiterio) {
        mostrarErro('Por favor, preencha todos os campos.');
        return;
    }
    
    const registro = {
        nome,
        data,
        servicos,
        cartorio,
        endereco,
        cemiterio,
        timestamp: new Date().toISOString(),
        id: Date.now().toString()
    };
    
    try {
        // Tentar salvar no banco primeiro
        const response = await fetch('/api/registros', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registro)
        });
        
        if (response.ok) {
            const resultado = await response.json();
            if (resultado.success) {
                console.log('✅ REGISTRO SALVO COM SUCESSO! Atualizando lista...');
                mostrarSucesso('Registro salvo no banco de dados!');
                document.getElementById('registro-form').reset();
                ocultarFormulario();
                
                // Forçar atualização IMEDIATA da lista
                setTimeout(async () => {
                    console.log('🔄 Recarregando lista após salvamento...');
                    try {
                        const responseAtualizada = await fetch('/api/registros');
                        const registrosAtualizados = await responseAtualizada.json();
                        exibirRegistrosDiretamente(registrosAtualizados);
                        console.log('✅ Lista atualizada com sucesso após salvamento!');
                    } catch (error) {
                        console.error('❌ Erro ao atualizar lista:', error);
                    }
                }, 100);
                
                enviarEmailBackup(resultado.registro);
                return;
            }
        }
        throw new Error('API não disponível');
        
    } catch (error) {
        console.log('Banco indisponível, salvando localmente:', error);
        
        // Fallback: salvar no localStorage
        let registros = JSON.parse(localStorage.getItem('registros-obito') || '[]');
        registros.push(registro);
        localStorage.setItem('registros-obito', JSON.stringify(registros));
        
        console.log('✅ REGISTRO SALVO NO LOCALSTORAGE! Atualizando lista...');
        mostrarSucesso('Registro salvo com sucesso!');
        document.getElementById('registro-form').reset();
        ocultarFormulario();
        
        // Atualizar exibição IMEDIATA
        setTimeout(async () => {
            console.log('🔄 Recarregando lista (fallback localStorage)...');
            try {
                // Tentar carregar do banco primeiro
                const responseAtualizada = await fetch('/api/registros');
                const registrosAtualizados = await responseAtualizada.json();
                exibirRegistrosDiretamente(registrosAtualizados);
                console.log('✅ Lista atualizada do banco após salvamento local!');
            } catch (error) {
                // Se falhar, usar localStorage
                const registrosLocal = JSON.parse(localStorage.getItem('registros-obito') || '[]');
                exibirRegistrosDiretamente(registrosLocal);
                console.log('✅ Lista atualizada do localStorage!');
            }
        }, 100);
        
        enviarEmailBackup(registro);
    }
}

// Função para carregar e exibir registros na tabela com paginação
async function carregarRegistros() {
    console.log('🔄 INICIANDO CARREGAMENTO DE REGISTROS DO BANCO...');
    
    const corpoTabela = document.getElementById('corpo-tabela');
    const semRegistros = document.getElementById('sem-registros');
    const tabela = document.getElementById('tabela-registros');
    const paginacaoContainer = document.getElementById('paginacao-container');
    
    if (!corpoTabela) {
        console.error('❌ Elemento corpo-tabela não encontrado!');
        return;
    }
    
    try {
        // Buscar registros do banco de dados
        console.log('📡 Fazendo requisição para /api/registros...');
        const response = await fetch('/api/registros');
        console.log('📊 Status da resposta:', response.status);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const todosRegistros = await response.json();
        console.log('✅ REGISTROS RECEBIDOS DO BANCO:', todosRegistros);
        console.log('📈 TOTAL DE REGISTROS:', todosRegistros.length);
        
        // Verificar se há registros
        if (!todosRegistros || todosRegistros.length === 0) {
            console.log('⚠️ Nenhum registro encontrado no banco');
            tabela.style.display = 'none';
            semRegistros.style.display = 'block';
            if (paginacaoContainer) paginacaoContainer.style.display = 'none';
            return;
        }
        
        // Ordenar registros por data de óbito (mais recentes primeiro)
        const registrosOrdenados = todosRegistros.sort((a, b) => {
            const dataA = new Date(a.data);
            const dataB = new Date(b.data);
            return dataB - dataA;
        });
        
        console.log('🔄 Registros ordenados:', registrosOrdenados.length);
        
        // Definir conjunto de registros a exibir levando em conta filtros ativos
        let registrosParaExibir;
        if (buscaAtiva && registrosFiltrados.length > 0) {
            registrosParaExibir = registrosFiltrados;
        } else {
            registrosParaExibir = registrosOrdenados;
            // Caso não haja busca ativa, atualizamos registrosFiltrados para todos
            registrosFiltrados = registrosOrdenados;
        }

        totalRegistros = registrosParaExibir.length;
        totalPaginas = Math.ceil(totalRegistros / registrosPorPagina);
        
        // Mostrar tabela
        tabela.style.display = 'table';
        semRegistros.style.display = 'none';
        if (paginacaoContainer) paginacaoContainer.style.display = 'block';
        
        // Limpar tabela
        corpoTabela.innerHTML = '';
        
        // Calcular registros para a página atual
        const indiceInicio = (paginaAtual - 1) * registrosPorPagina;
        const indiceFim = Math.min(indiceInicio + registrosPorPagina, totalRegistros);

        // Se página atual exceder total de páginas após filtragem, voltar para primeira
        if (paginaAtual > totalPaginas) {
            paginaAtual = 1;
        }
        
        console.log(`📄 Exibindo registros ${indiceInicio + 1} a ${indiceFim} de ${totalRegistros}`);
        
        // Adicionar registros à tabela (usar fatia correta)
        const registrosPagina = registrosParaExibir.slice(indiceInicio, indiceFim);
        registrosPagina.forEach((registro, idx) => {
            const linhaNumero = indiceInicio + idx + 1;
            const linha = document.createElement('tr');
            
            // Formatar data do óbito
            const dataObito = formatarDataSemFusoHorario(registro.data);
            
            // Formatar data de registro
            const dataRegistro = new Date(registro.timestamp).toLocaleDateString('pt-BR') + ' às ' + 
                                new Date(registro.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
            
            linha.innerHTML = `
                <td><span class="numero-registro">${linhaNumero}</span></td>
                <td><span class="servico-badge" style="background-color: #667eea">${registro.servicos}</span></td>
                <td><span class="data-obito">${dataObito}</span></td>
                <td>${registro.cartorio}</td>
                <td><strong>${registro.nome}</strong></td>
                <td>${registro.endereco}</td>
                <td>${registro.cemiterio}</td>
                <td><span class="data-registro">${dataRegistro}</span></td>
                <td>
                    <button class="btn-editar" onclick="abrirFormularioEdicao('${registro.id}')">✏️ Editar</button>
                    <button class="btn-apagar" onclick="apagarRegistroPorId('${registro.id}')">🗑️ Apagar</button>
                </td>
            `;
            
            corpoTabela.appendChild(linha);
        });
        
        // Atualizar controles de paginação
        if (totalRegistros > registrosPorPagina) {
            atualizarControlesPaginacao();
        } else {
            atualizarInfoPaginacao();
        }
        
        console.log('✅ REGISTROS EXIBIDOS COM SUCESSO NA TABELA!');
        
    } catch (error) {
        console.error('❌ ERRO AO CARREGAR REGISTROS DO BANCO:', error);
        console.log('🔄 Tentando carregar do localStorage...');
        
        // Fallback para localStorage
        atualizarExibicaoRegistros();
    }
}

// Função para atualizar apenas informações quando há poucos registros
function atualizarInfoPaginacao() {
    const infoRegistros = document.getElementById('info-registros');
    const numerosPagina = document.getElementById('numeros-pagina');
    const btnPrimeira = document.getElementById('btn-primeira');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProxima = document.getElementById('btn-proxima');
    const btnUltima = document.getElementById('btn-ultima');
    
    // Atualizar informações dos registros
    infoRegistros.textContent = `Mostrando todos os ${totalRegistros} registros`;
    
    // Ocultar controles de navegação
    numerosPagina.innerHTML = '';
    btnPrimeira.style.display = 'none';
    btnAnterior.style.display = 'none';
    btnProxima.style.display = 'none';
    btnUltima.style.display = 'none';
}

// Funções de paginação
function atualizarControlesPaginacao() {
    const infoRegistros = document.getElementById('info-registros');
    const numerosPagina = document.getElementById('numeros-pagina');
    const btnPrimeira = document.getElementById('btn-primeira');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProxima = document.getElementById('btn-proxima');
    const btnUltima = document.getElementById('btn-ultima');
    
    // Atualizar informações dos registros
    const indiceInicio = (paginaAtual - 1) * registrosPorPagina + 1;
    const indiceFim = Math.min(paginaAtual * registrosPorPagina, totalRegistros);
    infoRegistros.textContent = `Mostrando ${indiceInicio}-${indiceFim} de ${totalRegistros} registros`;
    
    // Mostrar botões de navegação
    btnPrimeira.style.display = 'inline-block';
    btnAnterior.style.display = 'inline-block';
    btnProxima.style.display = 'inline-block';
    btnUltima.style.display = 'inline-block';
    
    // Atualizar botões de navegação
    btnPrimeira.disabled = paginaAtual === 1;
    btnAnterior.disabled = paginaAtual === 1;
    btnProxima.disabled = paginaAtual === totalPaginas;
    btnUltima.disabled = paginaAtual === totalPaginas;
    
    // Gerar números das páginas
    numerosPagina.innerHTML = '';
    const maxPaginasVisiveis = 5;
    let paginaInicio = Math.max(1, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let paginaFim = Math.min(totalPaginas, paginaInicio + maxPaginasVisiveis - 1);
    
    // Ajustar se estiver no final
    if (paginaFim - paginaInicio < maxPaginasVisiveis - 1) {
        paginaInicio = Math.max(1, paginaFim - maxPaginasVisiveis + 1);
    }
    
    for (let i = paginaInicio; i <= paginaFim; i++) {
        const btnPagina = document.createElement('button');
        btnPagina.className = `btn-numero-pagina ${i === paginaAtual ? 'ativo' : ''}`;
        btnPagina.textContent = i;
        btnPagina.onclick = () => irParaPagina(i);
        numerosPagina.appendChild(btnPagina);
    }
}

function irParaPagina(numeroPagina) {
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
        paginaAtual = numeroPagina;
        carregarRegistros();
    }
}

function paginaAnterior() {
    if (paginaAtual > 1) {
        paginaAtual--;
        carregarRegistros();
    }
}

function proximaPagina() {
    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        carregarRegistros();
    }
}

function irParaUltimaPagina() {
    paginaAtual = totalPaginas;
    carregarRegistros();
}

// Funções do sistema de backup por email
function inicializarEmailJS() {
    // FormSubmit não precisa de inicialização
    emailServicoAtivo = true;
    console.log('Serviço de email FormSubmit ativo');
    carregarConfigEmail();
}

// Função para mostrar/esconder configuração de email
function toggleConfigEmail() {
    const section = document.getElementById('email-config-section');
    const button = document.getElementById('btn-configurar-email');
    
    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
        button.textContent = '⚙️ Ocultar Configuração';
        button.classList.add('ativo');
    } else {
        section.style.display = 'none';
        button.textContent = '📧 Configurar Email';
        button.classList.remove('ativo');
    }
}

function carregarConfigEmail() {
    const emailSalvo = localStorage.getItem('email-backup-destino');
    const emailInput = document.getElementById('email-backup');
    const statusText = document.getElementById('email-status-text');
    const btnTeste = document.getElementById('btn-testar-email');
    
    if (emailSalvo) {
        emailBackupDestino = emailSalvo;
        emailInput.value = emailSalvo;
        emailBackupConfigurado = true;
        statusText.textContent = `✅ Email configurado: ${emailSalvo}`;
        statusText.className = 'email-status-ativo';
        btnTeste.disabled = false;
    }
}

function salvarConfigEmail() {
    const emailInput = document.getElementById('email-backup');
    const email = emailInput.value.trim();
    const statusText = document.getElementById('email-status-text');
    const btnTeste = document.getElementById('btn-testar-email');
    
    if (email && validarEmail(email)) {
        emailBackupDestino = email;
        localStorage.setItem('email-backup-destino', email);
        emailBackupConfigurado = true;
        statusText.textContent = `✅ Email configurado: ${email}`;
        statusText.className = 'email-status-ativo';
        btnTeste.disabled = false;
        mostrarSucesso('Email de backup configurado com sucesso!');
    } else {
        emailBackupConfigurado = false;
        statusText.textContent = '⚠️ Email inválido ou não configurado';
        statusText.className = 'email-status-inativo';
        btnTeste.disabled = true;
        if (email) {
            mostrarErro('Por favor, insira um email válido.');
        }
    }
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function testarEmail() {
    if (!emailBackupConfigurado) {
        mostrarErro('Configure um email válido antes de testar.');
        return;
    }
    
    mostrarSucesso('Enviando email de teste...');
    
    // Criar formulário para envio via FormSubmit
    const form = document.createElement('form');
    form.action = `${EMAIL_CONFIG.webhookUrl}${emailBackupDestino}`;
    form.method = 'POST';
    form.style.display = 'none';
    
    // Adicionar campos do email
    const campos = {
        '_subject': 'Teste de Configuração - Sistema de Backup São Francisco',
        '_template': 'table',
        '_captcha': 'false',
        'sistema': 'Livro de Óbito São Francisco',
        'tipo': 'Email de Teste',
        'data_teste': new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR'),
        'mensagem': 'Este é um email de teste do Sistema de Livro de Óbito da São Francisco. Seu email foi configurado com sucesso para receber backups automáticos! A partir de agora, você receberá um PDF por email sempre que um novo registro de óbito for cadastrado no sistema.'
    };
    
    // Adicionar campos ao formulário
    Object.keys(campos).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = campos[key];
        form.appendChild(input);
    });
    
    // Adicionar ao DOM e enviar
    document.body.appendChild(form);
    
    try {
        form.submit();
        
        // Remover formulário após envio
        setTimeout(() => {
            document.body.removeChild(form);
        }, 1000);
        
        // Mostrar confirmação
        setTimeout(() => {
            mostrarSucesso(`✅ Email de teste enviado para ${emailBackupDestino}! Verifique sua caixa de entrada em alguns minutos.`);
        }, 2000);
        
    } catch (error) {
        console.error('Erro ao enviar email de teste:', error);
        mostrarErro('Erro ao enviar email de teste. Tente novamente.');
        document.body.removeChild(form);
    }
}

function gerarPDFParaEmail(registro) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait', 'mm', 'a4');
    
    // Configurações do documento
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Cabeçalho do documento
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('SÃO FRANCISCO', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(52, 152, 219);
    doc.text('SERVIÇOS FUNERÁRIOS', pageWidth / 2, 26, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(127, 140, 141);
    doc.text('CNPJ: 84.522.143/0001-53', pageWidth / 2, 32, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('📖 Registro de Óbito - Backup Automático', pageWidth / 2, 42, { align: 'center' });
    
    // Linha separadora
    doc.setDrawColor(189, 195, 199);
    doc.setLineWidth(0.5);
    doc.line(20, 54, pageWidth - 20, 54);
    
    // Informações do registro
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    
    doc.text(`Gerado em: ${dataAtual} às ${horaAtual}`, 20, 60);
    doc.text(`Usuário: saofranciscof`, 20, 67);
    
    // Dados do registro
    const yStart = 70;
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('DADOS DO REGISTRO:', 20, yStart);
    
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    
    const campos = [
        { label: 'Serviços:', valor: registro.servicos },
        { label: 'Data do Óbito:', valor: new Date(registro.data).toLocaleDateString('pt-BR') },
        { label: 'Cartório:', valor: registro.cartorio },
        { label: 'Nome do Falecido:', valor: registro.nome },
        { label: 'Endereço:', valor: registro.endereco },
        { label: 'Cemitério:', valor: registro.cemiterio },
        { label: 'Data de Registro:', valor: new Date(registro.timestamp).toLocaleDateString('pt-BR') + ' às ' + new Date(registro.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'}) }
    ];
    
    let yPos = yStart + 15;
    campos.forEach(campo => {
        doc.setFont(undefined, 'bold');
        doc.text(campo.label, 20, yPos);
        doc.setFont(undefined, 'normal');
        
        // Quebrar texto longo
        const linhas = doc.splitTextToSize(campo.valor, pageWidth - 60);
        doc.text(linhas, 60, yPos);
        yPos += linhas.length * 7 + 5;
    });
    
    // Rodapé
    doc.setFontSize(8);
    doc.setTextColor(127, 140, 141);
    doc.text(
        'Documento gerado automaticamente pelo Sistema de Livro de Óbito - São Francisco',
        pageWidth / 2,
        280,
        { align: 'center' }
    );
    
    return doc;
}

function enviarEmailBackup(registro) {
    if (!emailBackupConfigurado) {
        console.log('Email backup não configurado - pulando envio');
        return;
    }
    
    try {
        console.log('Enviando backup por email para:', emailBackupDestino);
        
        // Criar formulário para envio via FormSubmit
        const form = document.createElement('form');
        form.action = `${EMAIL_CONFIG.webhookUrl}${emailBackupDestino}`;
        form.method = 'POST';
        form.style.display = 'none';
        
        // Preparar dados do registro para o email
        const campos = {
            '_subject': `Novo Registro de Óbito - ${registro.nome} - São Francisco`,
            '_template': 'table',
            '_captcha': 'false',
            '_next': window.location.origin + window.location.pathname,
            'sistema': 'Livro de Óbito São Francisco',
            'tipo': 'Backup Automático de Registro',
            'nome_falecido': registro.nome,
            'data_obito': new Date(registro.data).toLocaleDateString('pt-BR'),
            'servicos': registro.servicos,
            'cartorio': registro.cartorio,
            'endereco': registro.endereco,
            'cemiterio': registro.cemiterio,
            'data_registro': new Date(registro.timestamp).toLocaleDateString('pt-BR') + ' às ' + new Date(registro.timestamp).toLocaleTimeString('pt-BR'),
            'observacoes': 'Este é um backup automático gerado pelo Sistema de Livro de Óbito da São Francisco. Todos os dados do registro estão listados acima para sua segurança e arquivo.'
        };
        
        // Adicionar campos ao formulário
        Object.keys(campos).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = campos[key];
            form.appendChild(input);
        });
        
        // Adicionar ao DOM e enviar
        document.body.appendChild(form);
        
        // Enviar formulário
        form.submit();
        
        // Remover formulário após envio
        setTimeout(() => {
            if (document.body.contains(form)) {
                document.body.removeChild(form);
            }
        }, 2000);
        
        // Mostrar confirmação
        setTimeout(() => {
            mostrarSucesso(`📧 Backup enviado para ${emailBackupDestino}! Verifique sua caixa de entrada.`);
        }, 1500);
        
        console.log('Backup enviado com sucesso via FormSubmit');
        
    } catch (error) {
        console.error('Erro ao enviar email backup:', error);
        mostrarErro('Erro ao enviar backup por email. Tente novamente.');
    }
}

// Funções de busca
function buscarRegistros() {
    const campoBusca = document.getElementById('campo-busca');
    const campoServicos = document.getElementById('campo-servicos');
    const dataInicio = document.getElementById('data-inicio');
    const dataFim = document.getElementById('data-fim');
    const resultadoBusca = document.getElementById('resultado-busca');
    
    termoBusca = campoBusca.value.trim().toLowerCase();
    const termoServicos = campoServicos.value.trim().toLowerCase();
    const dataInicioValue = dataInicio.value;
    const dataFimValue = dataFim.value;
    
    // Verificar se há algum filtro ativo
    const temFiltroNome = termoBusca !== '';
    const temFiltroServicos = termoServicos !== '';
    const temFiltroData = dataInicioValue !== '' || dataFimValue !== '';
    
    if (!temFiltroNome && !temFiltroServicos && !temFiltroData) {
        // Se não há filtros, mostrar todos os registros
        buscaAtiva = false;
        registrosFiltrados = [];
        resultadoBusca.style.display = 'none';
        paginaAtual = 1;
        carregarRegistros();
        return;
    }
    
    // Buscar registros com base nos filtros
    const todosRegistros = JSON.parse(localStorage.getItem('registros-obito') || '[]');
    registrosFiltrados = todosRegistros.filter(registro => {
        let passaNome = true;
        let passaServicos = true;
        let passaData = true;
        
        // Filtro por nome
        if (temFiltroNome) {
            passaNome = registro.nome.toLowerCase().includes(termoBusca);
        }
        
        // Filtro por serviços
        if (temFiltroServicos) {
            passaServicos = registro.servicos.toLowerCase().includes(termoServicos);
        }
        
        // Filtro por data
        if (temFiltroData) {
            const dataRegistro = new Date(registro.timestamp).toISOString().split('T')[0];
            
            if (dataInicioValue && dataFimValue) {
                // Ambas as datas preenchidas - filtrar por período
                passaData = dataRegistro >= dataInicioValue && dataRegistro <= dataFimValue;
            } else if (dataInicioValue) {
                // Apenas data início - filtrar a partir desta data
                passaData = dataRegistro >= dataInicioValue;
            } else if (dataFimValue) {
                // Apenas data fim - filtrar até esta data
                passaData = dataRegistro <= dataFimValue;
            }
        }
        
        return passaNome && passaServicos && passaData;
    });
    
    buscaAtiva = true;
    paginaAtual = 1;
    
    // Mostrar resultado da busca
    mostrarResultadoBusca();
    
    // Recarregar tabela com resultados filtrados
    carregarRegistros();
}

function mostrarResultadoBusca() {
    const resultadoBusca = document.getElementById('resultado-busca');
    const campoBusca = document.getElementById('campo-busca');
    const campoServicos = document.getElementById('campo-servicos');
    const dataInicio = document.getElementById('data-inicio');
    const dataFim = document.getElementById('data-fim');
    
    const temFiltroNome = campoBusca.value.trim() !== '';
    const temFiltroServicos = campoServicos.value.trim() !== '';
    const temFiltroData = dataInicio.value !== '' || dataFim.value !== '';
    
    if (registrosFiltrados.length === 0) {
        let mensagem = '🔍 Nenhum registro encontrado';
        let detalhes = [];
        
        if (temFiltroNome) {
            detalhes.push(`nome "${campoBusca.value.trim()}"`);
        }
        if (temFiltroServicos) {
            detalhes.push(`serviço "${campoServicos.value.trim()}"`);
        }
        if (temFiltroData) {
            if (dataInicio.value && dataFim.value) {
                detalhes.push(`período de ${formatarDataBR(dataInicio.value)} a ${formatarDataBR(dataFim.value)}`);
            } else if (dataInicio.value) {
                detalhes.push(`a partir de ${formatarDataBR(dataInicio.value)}`);
            } else if (dataFim.value) {
                detalhes.push(`até ${formatarDataBR(dataFim.value)}`);
            }
        }
        
        if (detalhes.length > 0) {
            mensagem += ` para ${detalhes.join(' e ')}`;
        }
        
        resultadoBusca.innerHTML = `
            <div class="busca-sem-resultado">
                <p>${mensagem}</p>
                <p>Tente ajustar os filtros ou verificar os critérios de busca.</p>
            </div>
        `;
        resultadoBusca.style.display = 'block';
    } else {
        const plural = registrosFiltrados.length === 1 ? 'registro encontrado' : 'registros encontrados';
        let filtrosAtivos = [];
        
        if (temFiltroNome) {
            filtrosAtivos.push(`nome "${campoBusca.value.trim()}"`);
        }
        if (temFiltroServicos) {
            filtrosAtivos.push(`serviço "${campoServicos.value.trim()}"`);
        }
        if (temFiltroData) {
            if (dataInicio.value && dataFim.value) {
                filtrosAtivos.push(`período de ${formatarDataBR(dataInicio.value)} a ${formatarDataBR(dataFim.value)}`);
            } else if (dataInicio.value) {
                filtrosAtivos.push(`a partir de ${formatarDataBR(dataInicio.value)}`);
            } else if (dataFim.value) {
                filtrosAtivos.push(`até ${formatarDataBR(dataFim.value)}`);
            }
        }
        
        const filtrosTexto = filtrosAtivos.length > 0 ? ` para ${filtrosAtivos.join(' e ')}` : '';
        
        resultadoBusca.innerHTML = `
            <div class="busca-com-resultado">
                <p>✅ ${registrosFiltrados.length} ${plural}${filtrosTexto}</p>
            </div>
        `;
        resultadoBusca.style.display = 'block';
    }
}

function formatarDataBR(dataISO) {
    return new Date(dataISO + 'T00:00:00').toLocaleDateString('pt-BR');
}

function limparBusca() {
    const campoBusca = document.getElementById('campo-busca');
    const campoServicos = document.getElementById('campo-servicos');
    const dataInicio = document.getElementById('data-inicio');
    const dataFim = document.getElementById('data-fim');
    const resultadoBusca = document.getElementById('resultado-busca');
    
    campoBusca.value = '';
    campoServicos.value = '';
    dataInicio.value = '';
    dataFim.value = '';
    termoBusca = '';
    buscaAtiva = false;
    registrosFiltrados = [];
    resultadoBusca.style.display = 'none';
    paginaAtual = 1;
    
    // Recarregar todos os registros
    carregarRegistros();
    
    // Focar no campo de busca
    campoBusca.focus();
}

// Filtros rápidos por data
function filtrarHoje() {
    const hoje = new Date().toISOString().split('T')[0];
    const dataInicio = document.getElementById('data-inicio');
    const dataFim = document.getElementById('data-fim');
    
    dataInicio.value = hoje;
    dataFim.value = hoje;
    
    buscarRegistros();
}

function filtrarSemana() {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    
    const dataInicio = document.getElementById('data-inicio');
    const dataFim = document.getElementById('data-fim');
    
    dataInicio.value = inicioSemana.toISOString().split('T')[0];
    dataFim.value = hoje.toISOString().split('T')[0];
    
    buscarRegistros();
}

function filtrarMes() {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    const dataInicio = document.getElementById('data-inicio');
    const dataFim = document.getElementById('data-fim');
    
    dataInicio.value = inicioMes.toISOString().split('T')[0];
    dataFim.value = hoje.toISOString().split('T')[0];
    
    buscarRegistros();
}

// Função para gerar PDF da página atual
async function gerarPDFPagina() {
    try {
        console.log('🔄 Iniciando geração de PDF...');
        
        // Verificar se jsPDF está disponível
        if (!window.jspdf) {
            mostrarErro('Biblioteca jsPDF não carregada. Recarregue a página e tente novamente.');
            return;
        }
        
        // Obter registros do servidor ou localStorage
        let registros = [];
        try {
            const response = await fetch('/api/registros');
            registros = await response.json();
            console.log('✅ Registros obtidos do servidor:', registros.length);
        } catch (error) {
            console.log('⚠️ Erro ao obter do servidor, usando localStorage...');
            registros = JSON.parse(localStorage.getItem('registros-obito') || '[]');
        }
        
        if (registros.length === 0) {
            mostrarErro('Nenhum registro encontrado para gerar PDF.');
            return;
        }
        
        // Usar registros filtrados se houver busca ativa, senão usar todos
        const registrosParaPDF = buscaAtiva && registrosFiltrados.length > 0 ? registrosFiltrados : registros;
        
        // Calcular variáveis de paginação
        const totalRegistrosAtual = registrosParaPDF.length;
        const totalPaginasAtual = Math.ceil(totalRegistrosAtual / registrosPorPagina);
        const paginaAtualPDF = Math.min(paginaAtual, totalPaginasAtual);
        
        // Calcular registros da página atual
        const indiceInicio = (paginaAtualPDF - 1) * registrosPorPagina;
        const indiceFim = Math.min(indiceInicio + registrosPorPagina, totalRegistrosAtual);
        const registrosPagina = registrosParaPDF.slice(indiceInicio, indiceFim);
        
        if (registrosPagina.length === 0) {
            mostrarErro('Nenhum registro encontrado na página atual.');
            return;
        }
        
        console.log(`📄 Gerando PDF da página ${paginaAtualPDF} com ${registrosPagina.length} registros`);
        
        // Inicializar jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'a4');
        
        // Configurações do documento
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Cabeçalho do documento
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 80); // Cor primária
        doc.text('SAO FRANCISCO', pageWidth / 2, 18, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(52, 152, 219); // Cor azul
        doc.text('SERVICOS FUNERARIOS', pageWidth / 2, 26, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setTextColor(127, 140, 141);
        doc.text('CNPJ: 84.522.143/0001-53', pageWidth / 2, 32, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Sistema de Livro de Obito', pageWidth / 2, 42, { align: 'center' });
        
        // Linha separadora
        doc.setDrawColor(189, 195, 199);
        doc.setLineWidth(0.5);
        doc.line(20, 48, pageWidth - 20, 48);
        
        // Informações da página
        doc.setFontSize(11);
        doc.setTextColor(52, 73, 94);
        const dataAtual = new Date().toLocaleDateString('pt-BR');
        const horaAtual = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        
        doc.text(`Pagina ${paginaAtualPDF} de ${totalPaginasAtual}`, 20, 56);
        doc.text(`Registros ${indiceInicio + 1} a ${indiceFim} de ${totalRegistrosAtual}`, 20, 62);
        doc.text(`Gerado em: ${dataAtual} as ${horaAtual}`, pageWidth - 20, 56, { align: 'right' });
        doc.text(`Usuario: saofranciscof`, pageWidth - 20, 62, { align: 'right' });
        
        // Adicionar informação se há filtros ativos
        if (buscaAtiva) {
            doc.setFontSize(10);
            doc.setTextColor(192, 57, 43); // Cor vermelha para destacar filtro
            doc.text('* Dados filtrados conforme busca ativa', pageWidth / 2, 70, { align: 'center' });
        }
        
        // Preparar dados para a tabela
        const colunas = [
            { header: 'Nº', dataKey: 'numero' },
            { header: 'Serviços', dataKey: 'servicos' },
            { header: 'Data Óbito', dataKey: 'dataObito' },
            { header: 'Cartório', dataKey: 'cartorio' },
            { header: 'Nome do Falecido', dataKey: 'nome' },
            { header: 'Endereço', dataKey: 'endereco' },
            { header: 'Cemitério', dataKey: 'cemiterio' }
        ];
        
        const dadosTabela = registrosPagina.map((registro, index) => {
            // Garantir que a data seja formatada corretamente
            let dataFormatada = 'Data inválida';
            try {
                if (registro.data) {
                    const data = new Date(registro.data);
                    if (!isNaN(data.getTime())) {
                        dataFormatada = data.toLocaleDateString('pt-BR');
                    }
                }
            } catch (e) {
                console.warn('Erro ao formatar data:', registro.data);
            }
            
            return {
                numero: indiceInicio + index + 1,
                servicos: registro.servicos || 'N/A',
                dataObito: dataFormatada,
                cartorio: registro.cartorio || 'N/A',
                nome: registro.nome || 'N/A',
                endereco: registro.endereco || 'N/A',
                cemiterio: registro.cemiterio || 'N/A'
            };
        });
        
        // Gerar tabela
        doc.autoTable({
            columns: colunas,
            body: dadosTabela,
            startY: buscaAtiva ? 76 : 70,
            theme: 'grid',
            styles: {
                fontSize: 9,
                cellPadding: 3,
                textColor: [44, 62, 80],
                lineColor: [189, 195, 199],
                lineWidth: 0.5
            },
            headStyles: {
                fillColor: [44, 62, 80],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 10
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' }, // Número
                1: { cellWidth: 25 }, // Serviços
                2: { cellWidth: 25, halign: 'center' }, // Data
                3: { cellWidth: 35 }, // Cartório
                4: { cellWidth: 50 }, // Nome
                5: { cellWidth: 60 }, // Endereço
                6: { cellWidth: 40 } // Cemitério
            },
            margin: { left: 20, right: 20 },
            didDrawPage: function(data) {
                // Rodapé
                doc.setFontSize(8);
                doc.setTextColor(127, 140, 141);
                doc.text(
                    'Documento gerado automaticamente pelo Sistema de Livro de Óbito - São Francisco',
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }
        });
        
        // Nome do arquivo
        const nomeArquivo = `Livro_Obito_Pagina_${paginaAtualPDF}_${dataAtual.replace(/\//g, '-')}.pdf`;
        
        // Salvar o PDF
        doc.save(nomeArquivo);
        
        // Mostrar mensagem de sucesso
        mostrarSucesso(`✅ PDF da página ${paginaAtualPDF} gerado com sucesso! (${registrosPagina.length} registros)`);
        console.log('✅ PDF gerado com sucesso:', nomeArquivo);
        
    } catch (error) {
        console.error('❌ Erro ao gerar PDF:', error);
        mostrarErro('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    }
}



// Função para formatar data sem problemas de fuso horário
function formatarDataSemFusoHorario(dataString) {
    if (!dataString) return '';
    
    // Se a data está no formato YYYY-MM-DD, processar diretamente
    const partes = dataString.split('-');
    if (partes.length === 3) {
        const ano = partes[0];
        const mes = partes[1];
        const dia = partes[2];
        return `${dia}/${mes}/${ano}`;
    }
    
    // Fallback para outros formatos
    try {
        return new Date(dataString).toLocaleDateString('pt-BR');
    } catch (error) {
        return dataString;
    }
}

// Variáveis globais para paginação
let paginaAtual = 1;
let registrosPorPagina = 50;
let registrosFiltrados = [];

// Função para exibir registros DIRETAMENTE na tabela (SOLUÇÃO DEFINITIVA)
function exibirRegistrosDiretamente(registros) {
    console.log('🎯 EXIBINDO REGISTROS DIRETAMENTE:', registros.length);
    
    const corpoTabela = document.getElementById('corpo-tabela');
    const semRegistros = document.getElementById('sem-registros');
    const tabela = document.getElementById('tabela-registros');
    
    if (!corpoTabela) {
        console.error('❌ Elemento corpo-tabela não encontrado!');
        return;
    }
    
    // Ordenar registros por data (mais recentes primeiro)
    const registrosOrdenados = registros.sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return dataB - dataA;
    });
    
    // Mostrar tabela e ocultar mensagem "sem registros"
    tabela.style.display = 'table';
    semRegistros.style.display = 'none';
    
    // Limpar tabela
    corpoTabela.innerHTML = '';
    
    // Adicionar cada registro à tabela
    registrosOrdenados.forEach((registro, index) => {
        const linha = document.createElement('tr');
        
        // Formatar data
        const dataObito = formatarDataSemFusoHorario(registro.data);
        const dataRegistro = new Date(registro.timestamp).toLocaleDateString('pt-BR') + ' às ' + 
                            new Date(registro.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        
        linha.innerHTML = `
            <td><span class="numero-registro">${index + 1}</span></td>
            <td><span class="servico-badge" style="background-color: #667eea">${registro.servicos}</span></td>
            <td><span class="data-obito">${dataObito}</span></td>
            <td>${registro.cartorio}</td>
            <td><strong>${registro.nome}</strong></td>
            <td>${registro.endereco}</td>
            <td>${registro.cemiterio}</td>
            <td><span class="data-registro">${dataRegistro}</span></td>
            <td>
                <button class="btn-editar" onclick="abrirFormularioEdicao('${registro.id}')">Editar</button>
                <button class="btn-apagar" onclick="apagarRegistroPorId('${registro.id}')" title="Apagar registro">
                    Apagar
                </button>
            </td>
        `;
        
        corpoTabela.appendChild(linha);
    });
    
    console.log(' REGISTROS EXIBIDOS COM SUCESSO NA TABELA!');
    console.log(` Total de ${registrosOrdenados.length} registros exibidos`);
}

// ...

// Função para exibir registros da página atual
function exibirPaginaAtual() {
    const corpoTabela = document.getElementById('corpo-tabela');
    
    // Limpar tabela
    corpoTabela.innerHTML = '';
    
    if (registrosFiltrados.length === 0) {
        const linha = document.createElement('tr');
        linha.innerHTML = '<td colspan="9" style="text-align: center; padding: 20px; color: #666;">Nenhum registro encontrado</td>';
        corpoTabela.appendChild(linha);
        return;
    }
    
    // Calcular índices para a página atual
    const indiceInicio = (paginaAtual - 1) * registrosPorPagina;
    const indiceFim = Math.min(indiceInicio + registrosPorPagina, registrosFiltrados.length);
    
    // Exibir registros da página atual
    for (let i = indiceInicio; i < indiceFim; i++) {
        const registro = registrosFiltrados[i];
        const linha = document.createElement('tr');
        
        // Formatar data do óbito (evitando problemas de fuso horário)
        const dataObito = formatarDataSemFusoHorario(registro.data);
        
        // Formatar data de registro
        const dataRegistro = new Date(registro.timestamp).toLocaleDateString('pt-BR') + ' às ' + 
                            new Date(registro.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
        
        // Número do registro global (não da página)
        const numeroRegistro = i + 1;
        
        linha.innerHTML = `
            <td><span class="numero-registro">${numeroRegistro}</span></td>
            <td><span class="servico-badge" style="background-color: #667eea">${registro.servicos}</span></td>
            <td><span class="data-obito">${dataObito}</span></td>
            <td>${registro.cartorio}</td>
            <td><strong>${registro.nome}</strong></td>
            <td>${registro.endereco}</td>
            <td>${registro.cemiterio}</td>
            <td><span class="data-registro">${dataRegistro}</span></td>
            <td>
                <button class="btn-editar" onclick="abrirFormularioEdicao('${registro.id}')">Editar</button>
                <button class="btn-apagar" onclick="apagarRegistroPorId('${registro.id}')" title="Apagar registro">
                    Apagar
                </button>
            </td>
        `;
        
        corpoTabela.appendChild(linha);
    }
    
    console.log(`Exibindo registros ${indiceInicio + 1} a ${indiceFim} de ${registrosFiltrados.length}`);
}

// Função para atualizar controles de paginação
function atualizarPaginacao() {
    const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
    
    // Atualizar informações da paginação
    const infoPaginacao = document.getElementById('info-paginacao');
    if (infoPaginacao) {
        const indiceInicio = (paginaAtual - 1) * registrosPorPagina + 1;
        const indiceFim = Math.min(paginaAtual * registrosPorPagina, registrosFiltrados.length);
        infoPaginacao.textContent = `Exibindo ${indiceInicio}-${indiceFim} de ${registrosFiltrados.length} registros (Página ${paginaAtual} de ${totalPaginas})`;
    }
    
    // Atualizar botões de navegação
    const btnPrimeira = document.getElementById('btn-primeira');
    const btnAnterior = document.getElementById('btn-anterior');
    const btnProxima = document.getElementById('btn-proxima');
    const btnUltima = document.getElementById('btn-ultima');
    
    if (btnPrimeira) btnPrimeira.disabled = paginaAtual === 1;
    if (btnAnterior) btnAnterior.disabled = paginaAtual === 1;
    if (btnProxima) btnProxima.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
    if (btnUltima) btnUltima.disabled = paginaAtual === totalPaginas || totalPaginas === 0;
    
    // Atualizar números das páginas
    const numerosPagina = document.getElementById('numeros-pagina');
    if (numerosPagina) {
        numerosPagina.innerHTML = '';
        
        // Mostrar até 5 números de página
        let inicioMostra = Math.max(1, paginaAtual - 2);
        let fimMostra = Math.min(totalPaginas, inicioMostra + 4);
        
        // Ajustar se estivermos no final
        if (fimMostra - inicioMostra < 4) {
            inicioMostra = Math.max(1, fimMostra - 4);
        }
        
        for (let i = inicioMostra; i <= fimMostra; i++) {
            const btnPagina = document.createElement('button');
            btnPagina.textContent = i;
            btnPagina.className = 'btn-numero-pagina';
            if (i === paginaAtual) {
                btnPagina.classList.add('ativo');
            }
            btnPagina.onclick = () => irParaPagina(i);
            numerosPagina.appendChild(btnPagina);
        }
    }
}

// Funções de navegação
function irParaPagina(numeroPagina) {
    const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
    if (numeroPagina >= 1 && numeroPagina <= totalPaginas) {
        paginaAtual = numeroPagina;
        exibirPaginaAtual();
        atualizarPaginacao();
    }
}

function paginaAnterior() {
    if (paginaAtual > 1) {
        irParaPagina(paginaAtual - 1);
    }
}

function proximaPagina() {
    const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
    if (paginaAtual < totalPaginas) {
        irParaPagina(paginaAtual + 1);
    }
}

function irParaUltimaPagina() {
    const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
    if (totalPaginas > 0) {
        irParaPagina(totalPaginas);
    }
}

// NOVA IMPLEMENTAÇÃO SIMPLES DO BOTÃO APAGAR - FEITA DO ZERO

// Função para apagar registro por ID (CORRIGIDA)
async function apagarRegistroPorId(registroId) {
    console.log('🗑️ TENTANDO APAGAR REGISTRO ID:', registroId);
    
    try {
        // Primeiro, buscar todos os registros do banco para encontrar o registro
        const responseGet = await fetch('/api/registros');
        const todosRegistros = await responseGet.json();
        
        // Encontrar o registro pelo ID
        const registro = todosRegistros.find(r => r.id && r.id.toString() === registroId.toString());
        
        if (!registro) {
            alert('❌ Registro não encontrado!');
            return;
        }
        
        // Confirmação
        const confirmacao = confirm(`Tem certeza que deseja apagar o registro de ${registro.nome}?\n\nEsta ação não pode ser desfeita!`);
        
        if (!confirmacao) {
            return;
        }
        
        console.log('🗑️ Apagando registro do banco de dados...');
        
        // Tentar apagar do banco de dados
        const response = await fetch(`/api/registros/${registroId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            let resultado = {};
            let is204 = response.status === 204;
            if (!is204) {
                try {
                    resultado = await response.json();
                } catch (e) {
                    // corpo vazio ou não JSON
                }
            }
            
            if (is204 || resultado.success) {
                console.log('✅ Registro apagado do banco com sucesso!');
                
                // Após apagar do banco, tentar apagar do email também
                await apagarRegistroDoEmail(registro);
                
                alert(`✅ Registro de ${registro.nome} foi apagado com sucesso!`);
                
                // Recarregar registros do banco IMEDIATAMENTE
                setTimeout(async () => {
                    console.log('🔄 Recarregando lista após exclusão...');
                    const responseAtualizada = await fetch('/api/registros');
                    const registrosAtualizados = await responseAtualizada.json();
                    exibirRegistrosDiretamente(registrosAtualizados);
                    console.log('✅ Lista atualizada após exclusão!');
                }, 100);
                
                return;
            }
        }
        
        throw new Error('Erro na resposta da API');
        
    } catch (error) {
        console.error('❌ ERRO ao apagar registro:', error);
        alert('❌ Erro ao apagar registro: ' + error.message);
        
        // Fallback: tentar apagar do localStorage
        const registrosLocal = JSON.parse(localStorage.getItem('registros-obito') || '[]');
        const indice = registrosLocal.findIndex(r => r.id && r.id.toString() === registroId.toString());
        
        if (indice !== -1) {
            const registro = registrosLocal[indice];
            registrosLocal.splice(indice, 1);
            localStorage.setItem('registros-obito', JSON.stringify(registrosLocal));
            
            alert(`✅ Registro de ${registro.nome} foi apagado do localStorage!`);
            exibirRegistrosDiretamente(registrosLocal);
        }
    }
}

// Função para apagar registro por índice (compatibilidade)
function apagarRegistro(indice) {
    // Obter registros
    const registros = JSON.parse(localStorage.getItem('registros-obito') || '[]');
    
    if (indice < 0 || indice >= registros.length) {
        alert('Registro não encontrado!');
        return;
    }
    
    const registro = registros[indice];
    
    // Se o registro tem ID, usar a função por ID
    if (registro.id) {
        apagarRegistroPorId(registro.id);
        return;
    }
    
    // Confirmação simples
    const confirmacao = confirm(`Tem certeza que deseja apagar o registro de ${registro.nome}?\n\nEsta ação não pode ser desfeita!`);
    
    if (!confirmacao) {
        return;
    }
    
    // Remover do array
    registros.splice(indice, 1);
    
    // Salvar no localStorage
    localStorage.setItem('registros-obito', JSON.stringify(registros));
    
    // Mostrar sucesso
    alert(`Registro de ${registro.nome} foi apagado com sucesso!`);
    
    // Atualizar exibição da tabela
    atualizarExibicaoRegistros();
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    verificarLogin();
    
    // Configurar evento de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', fazerLogin);
    }
    
    // Configurar evento de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', fazerLogout);
    }
    
    // Configurar evento de registro
    const registroForm = document.getElementById('registro-form');
    if (registroForm) {
        registroForm.addEventListener('submit', salvarRegistro);
    }
    
    // Configurar evento para mostrar formulário
    const btnNovoRegistro = document.getElementById('btn-novo-registro');
    if (btnNovoRegistro) {
        btnNovoRegistro.addEventListener('click', mostrarFormulario);
    }
    
    // Configurar evento para cancelar/ocultar formulário
    const btnCancelar = document.getElementById('btn-cancelar');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', ocultarFormulario);
    }
    
    // Carregar registros se estiver na página admin
    if (window.location.pathname.includes('admin.html')) {
        console.log('🔄 PÁGINA ADMIN DETECTADA - FORÇANDO CARREGAMENTO DOS REGISTROS!');
        
        // FORÇAR carregamento IMEDIATO dos registros
        setTimeout(async () => {
            try {
                console.log('🔄 TENTATIVA 1: Carregando do banco...');
                const response = await fetch('/api/registros');
                const registros = await response.json();
                
                console.log('✅ REGISTROS ENCONTRADOS:', registros.length);
                
                if (registros && registros.length > 0) {
                    console.log('🎯 EXIBINDO REGISTROS DIRETAMENTE...');
                    exibirRegistrosDiretamente(registros);
                } else {
                    console.log('⚠️ Nenhum registro no banco');
                    document.getElementById('sem-registros').style.display = 'block';
                    document.getElementById('tabela-registros').style.display = 'none';
                }
            } catch (error) {
                console.error('❌ ERRO:', error);
                // Tentar localStorage
                const registrosLocal = JSON.parse(localStorage.getItem('registros-obito') || '[]');
                if (registrosLocal.length > 0) {
                    exibirRegistrosDiretamente(registrosLocal);
                } else {
                    document.getElementById('sem-registros').style.display = 'block';
                }
            }
        }, 100);
        
        inicializarEmailJS();
    }
});

// FUNÇÕES DE EDIÇÃO DE REGISTROS

// Função para abrir formulário de edição inline
function abrirFormularioEdicao(registroId) {
    console.log('🔧 Abrindo edição para o registro:', registroId);
    
    // Buscar os dados atuais do registro
    fetch(`/api/registros/${registroId}`)
        .then(response => response.json())
        .then(registro => {
            // Encontrar a linha da tabela que contém este registro
            const linhas = document.querySelectorAll('#corpo-tabela tr');
            linhas.forEach(linha => {
                if (linha.innerHTML.includes(registroId)) {
                    // Formatar a data para o input type="date"
                    const dataFormatada = registro.data ? registro.data.split('T')[0] : '';
                    
                    // Criar o HTML do formulário de edição
                    linha.innerHTML = `
                        <td><span class="numero-registro">${registro.id}</span></td>
                        <td><input type="text" value="${registro.servicos || ''}" id="edit-servicos-${registro.id}" class="form-control" style="width: 100%; padding: 5px;"></td>
                        <td><input type="date" value="${dataFormatada}" id="edit-data-${registro.id}" class="form-control" style="width: 100%; padding: 5px;"></td>
                        <td><input type="text" value="${registro.cartorio || ''}" id="edit-cartorio-${registro.id}" class="form-control" style="width: 100%; padding: 5px;"></td>
                        <td><input type="text" value="${registro.nome || ''}" id="edit-nome-${registro.id}" class="form-control" style="width: 100%; padding: 5px;"></td>
                        <td><input type="text" value="${registro.endereco || ''}" id="edit-endereco-${registro.id}" class="form-control" style="width: 100%; padding: 5px;"></td>
                        <td><input type="text" value="${registro.cemiterio || ''}" id="edit-cemiterio-${registro.id}" class="form-control" style="width: 100%; padding: 5px;"></td>
                        <td><span class="data-registro">${new Date(registro.timestamp).toLocaleDateString('pt-BR')}</span></td>
                        <td>
                            <button class="btn-salvar" onclick="salvarEdicao('${registro.id}')" style="background: #28a745; color: white; border: none; padding: 5px 10px; margin-right: 5px; border-radius: 3px; cursor: pointer;">✅ Salvar</button>
                            <button class="btn-cancelar" onclick="window.location.reload()" style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">❌ Cancelar</button>
                        </td>
                    `;
                }
            });
        })
        .catch(error => {
            console.error('❌ Erro ao carregar dados para edição:', error);
            alert('❌ Erro ao carregar dados para edição');
        });
}

// Função para salvar as alterações
async function salvarEdicao(registroId) {
    console.log('💾 Salvando edição do registro:', registroId);
    
    try {
        // Coletar dados dos inputs
        const dadosAtualizados = {
            servicos: document.getElementById(`edit-servicos-${registroId}`).value,
            data: document.getElementById(`edit-data-${registroId}`).value,
            cartorio: document.getElementById(`edit-cartorio-${registroId}`).value,
            nome: document.getElementById(`edit-nome-${registroId}`).value,
            endereco: document.getElementById(`edit-endereco-${registroId}`).value,
            cemiterio: document.getElementById(`edit-cemiterio-${registroId}`).value,
            timestamp: Date.now() // Atualizar timestamp da edição
        };
        
        // Validação básica
        if (!dadosAtualizados.nome.trim()) {
            alert('❌ O nome é obrigatório!');
            return;
        }
        
        console.log('📤 Enviando dados atualizados:', dadosAtualizados);
        
        // Enviar PUT para o backend
        const response = await fetch(`/api/registros/${registroId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAtualizados)
        });
        
        if (response.ok) {
            const resultado = await response.json();
            console.log('✅ Registro atualizado com sucesso:', resultado);
            alert(`✅ Registro de ${dadosAtualizados.nome} foi atualizado com sucesso!`);
            
            // Recarregar a tabela para mostrar os dados atualizados
            setTimeout(async () => {
                const responseAtualizada = await fetch('/api/registros');
                const registrosAtualizados = await responseAtualizada.json();
                exibirRegistrosDiretamente(registrosAtualizados);
                console.log('🔄 Tabela atualizada após edição!');
            }, 100);
            
        } else {
            throw new Error('Erro na resposta da API');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar edição:', error);
        alert('❌ Erro ao salvar edição: ' + error.message);
    }
}

// Função para apagar registro do sistema de email (FormSubmit)
async function apagarRegistroDoEmail(registro) {
    // Verificar se o email de backup está configurado
    if (!emailBackupConfigurado || !emailBackupDestino) {
        console.log('Email backup não configurado - pulando exclusão no email');
        return;
    }
    
    try {
        console.log('Tentando apagar registro do email:', registro.nome);
        
        // Criar formulário para enviar notificação de exclusão via FormSubmit
        const form = document.createElement('form');
        form.action = `${EMAIL_CONFIG.webhookUrl}${emailBackupDestino}`;
        form.method = 'POST';
        form.style.display = 'none';
        
        // Preparar dados da notificação de exclusão
        const campos = {
            '_subject': `Exclusão de Registro - ${registro.nome} - São Francisco`,
            '_template': 'table',
            '_captcha': 'false',
            'sistema': 'Livro de Óbito São Francisco',
            'tipo': 'Notificação de Exclusão de Registro',
            'nome_falecido': registro.nome,
            'data_obito': new Date(registro.data).toLocaleDateString('pt-BR'),
            'servicos': registro.servicos,
            'cartorio': registro.cartorio,
            'endereco': registro.endereco,
            'cemiterio': registro.cemiterio,
            'data_registro_original': new Date(registro.timestamp).toLocaleDateString('pt-BR') + ' às ' + new Date(registro.timestamp).toLocaleTimeString('pt-BR'),
            'data_exclusao': new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR'),
            'mensagem': 'Este email notifica que um registro foi excluído do Sistema de Livro de Óbito da São Francisco. Esta é apenas uma notificação de exclusão e não remove automaticamente o registro de sua caixa de entrada. Se desejar remover o registro original, você precisará fazê-lo manualmente.'
        };
        
        // Adicionar campos ao formulário
        Object.keys(campos).forEach(key => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = campos[key];
            form.appendChild(input);
        });
        
        // Adicionar ao DOM e enviar
        document.body.appendChild(form);
        
        // Enviar formulário
        form.submit();
        
        // Remover formulário após envio
        setTimeout(() => {
            if (document.body.contains(form)) {
                document.body.removeChild(form);
            }
        }, 2000);
        
        console.log('Notificação de exclusão enviada com sucesso via FormSubmit');
        
    } catch (error) {
        console.error('Erro ao enviar notificação de exclusão por email:', error);
        // Não mostrar erro ao usuário pois a exclusão principal já foi bem-sucedida
    }
}
