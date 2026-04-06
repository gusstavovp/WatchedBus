// ========================================
// AUTH CONTROLLER
// ========================================
const Auth = {
    currentUser: null,

    // Usuário administrador padrão
    ADMIN_USERNAME: 'Administrador',
    ADMIN_PASSWORD: '12106664486',

    init() {
        this.setupEventListeners();
        this.checkSession();
    },

    checkSession() {
        const savedUser = localStorage.getItem('scrumban_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.redirectToApp();
        }
    },

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.login();
            });
        }
    },

    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const messageEl = document.getElementById('loginMessage');

        if (!username || !password) {
            this.showMessage('Por favor, preencha todos os campos', 'error', messageEl);
            return;
        }

        // Validar credenciais
        // Em produção, isso seria feito contra um servidor
        const storedUsers = JSON.parse(localStorage.getItem('scrumban_users') || '[]');
        const user = storedUsers.find(u => u.username === username && u.password === password);

        // Verificar se é o administrador
        if (username === this.ADMIN_USERNAME && password === this.ADMIN_PASSWORD) {
            const adminUser = {
                id: 'admin',
                username: this.ADMIN_USERNAME,
                email: 'admin@scrumban.com',
                isAdmin: true,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('scrumban_user', JSON.stringify(adminUser));
            this.currentUser = adminUser;
            this.showMessage('Login realizado com sucesso!', 'success', messageEl);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
            return;
        }

        // Validar usuário comum
        if (user) {
            const loginUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: false,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('scrumban_user', JSON.stringify(loginUser));
            this.currentUser = loginUser;
            this.showMessage('Login realizado com sucesso!', 'success', messageEl);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showMessage('Nome de usuário ou senha inválidos', 'error', messageEl);
        }
    },

    showMessage(message, type = 'info', targetEl = null) {
        const messageEl = targetEl || document.getElementById('loginMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `login-message ${type}`;
            messageEl.style.display = 'block';
        }
    },

    logout() {
        localStorage.removeItem('scrumban_user');
        sessionStorage.removeItem('scrumban_user');
        this.currentUser = null;
        window.location.href = 'login.html';
    },

    redirectToApp() {
        // Se já está autenticado e na página de login, redireciona para app
        if (window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    },

    requireAuth() {
        const savedUser = localStorage.getItem('scrumban_user') || sessionStorage.getItem('scrumban_user');
        if (!savedUser) {
            window.location.href = 'login.html';
            return false;
        }
        this.currentUser = JSON.parse(savedUser);
        return true;
    },

    // Método para administrador registrar novos usuários
    registerUser(username, email, password) {
        // Verificar se o usuário atual é admin
        if (!this.currentUser || !this.currentUser.isAdmin) {
            return { success: false, message: 'Apenas administradores podem registrar usuários' };
        }

        // Validar dados
        if (!username || !email || !password) {
            return { success: false, message: 'Todos os campos são obrigatórios' };
        }

        if (password.length < 6) {
            return { success: false, message: 'A senha deve ter no mínimo 6 caracteres' };
        }

        // Obter usuários existentes
        const storedUsers = JSON.parse(localStorage.getItem('scrumban_users') || '[]');

        // Verificar se o usuário já existe
        if (storedUsers.find(u => u.username === username)) {
            return { success: false, message: 'Usuário já existe' };
        }

        // Criar novo usuário
        const newUser = {
            id: Storage.generateId(),
            username: username,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };

        storedUsers.push(newUser);
        localStorage.setItem('scrumban_users', JSON.stringify(storedUsers));

        return { success: true, message: 'Usuário registrado com sucesso' };
    },

    // Método para administrador deletar usuários
    deleteUser(username) {
        // Verificar se o usuário atual é admin
        if (!this.currentUser || !this.currentUser.isAdmin) {
            return { success: false, message: 'Apenas administradores podem deletar usuários' };
        }

        if (username === this.ADMIN_USERNAME) {
            return { success: false, message: 'Não é possível deletar o administrador' };
        }

        const storedUsers = JSON.parse(localStorage.getItem('scrumban_users') || '[]');
        const filteredUsers = storedUsers.filter(u => u.username !== username);

        if (filteredUsers.length === storedUsers.length) {
            return { success: false, message: 'Usuário não encontrado' };
        }

        localStorage.setItem('scrumban_users', JSON.stringify(filteredUsers));
        return { success: true, message: 'Usuário deletado com sucesso' };
    },

    // Obter lista de todos os usuários (apenas para admin)
    getAllUsers() {
        if (!this.currentUser || !this.currentUser.isAdmin) {
            return [];
        }

        const storedUsers = JSON.parse(localStorage.getItem('scrumban_users') || '[]');
        return storedUsers.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            createdAt: u.createdAt
        }));
    }
};

// Initialize quando DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
