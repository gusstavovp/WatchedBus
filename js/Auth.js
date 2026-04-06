// ========================================
// AUTH CONTROLLER
// ========================================
const Auth = {
    currentUser: null,

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

        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.register();
            });
        }
    },

    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember').checked;
        const messageEl = document.getElementById('loginMessage');

        if (!username || !password) {
            this.showMessage('Por favor, preencha todos os campos', 'error', messageEl);
            return;
        }

        // Simular autenticação (em produção, fazer requisição ao servidor)
        if (password.length >= 6) {
            const user = {
                id: Storage.generateId(),
                username: username,
                email: `${username}@scrumban.com`,
                loginTime: new Date().toISOString()
            };

            if (remember) {
                localStorage.setItem('scrumban_user', JSON.stringify(user));
            } else {
                sessionStorage.setItem('scrumban_user', JSON.stringify(user));
            }

            this.currentUser = user;
            this.showMessage('Login realizado com sucesso!', 'success', messageEl);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showMessage('Credenciais inválidas. A senha deve ter no mínimo 6 caracteres', 'error', messageEl);
        }
    },

    register() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const passwordConfirm = document.getElementById('regPasswordConfirm').value;

        if (!username || !email || !password || !passwordConfirm) {
            this.showMessage('Por favor, preencha todos os campos', 'error');
            return;
        }

        if (password !== passwordConfirm) {
            this.showMessage('As senhas não correspondem', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('A senha deve ter no mínimo 6 caracteres', 'error');
            return;
        }

        // Simular registro (em produção, fazer requisição ao servidor)
        const user = {
            id: Storage.generateId(),
            username: username,
            email: email,
            loginTime: new Date().toISOString()
        };

        sessionStorage.setItem('scrumban_user', JSON.stringify(user));
        this.currentUser = user;
        this.showMessage('Conta criada com sucesso! Redirecionando...', 'success');
        this.closeRegister();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    },

    showMessage(message, type = 'info', targetEl = null) {
        const messageEl = targetEl || document.getElementById('loginMessage');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `login-message ${type}`;
            messageEl.style.display = 'block';
        }
    },

    showRegister(e) {
        e.preventDefault();
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    closeRegister() {
        const modal = document.getElementById('registerModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    showReset(e) {
        e.preventDefault();
        alert('Funcionalidade de recuperação de senha em desenvolvimento');
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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
