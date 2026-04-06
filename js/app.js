// ========================================
// APP CONTROLLER
// ========================================
const App = {
    currentView: 'home',
    currentProjectId: null,
    currentUser: null,

    init() {
        // Verificar se usuário está autenticado
        if (!Auth.requireAuth()) {
            return;
        }

        this.currentUser = Auth.currentUser;
        this.updateUserDisplay();
        this.navigateTo('home');
        this.setupEventListeners();
    },

    updateUserDisplay() {
        const userDisplay = document.getElementById('userDisplay');
        if (userDisplay && this.currentUser) {
            userDisplay.textContent = `👤 ${this.currentUser.username}`;
        }
    },

    setupEventListeners() {
        // Home button
        document.getElementById('btnHome').addEventListener('click', () => {
            this.navigateTo('home');
        });

        // Logout button
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) {
            btnLogout.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja sair?')) {
                    Auth.logout();
                }
            });
        }

        // Modal close on overlay click
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        // ESC to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    navigateTo(view, projectId = null) {
        this.currentView = view;
        this.currentProjectId = projectId;
        const main = document.getElementById('mainContent');

        switch (view) {
            case 'home':
                this.setBreadcrumb([]);
                main.innerHTML = HomeView.render();
                break;
            case 'project':
                if (projectId) {
                    // Abrir o projeto em uma nova página
                    window.location.href = `project.html?id=${projectId}`;
                }
                break;
        }

        window.scrollTo(0, 0);
    },

    setBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (items.length === 0) {
            breadcrumb.innerHTML = '';
            return;
        }

        breadcrumb.innerHTML = items.map((item, idx) => {
            if (item.current) {
                return `<span class="breadcrumb-current">${HomeView.escapeHtml(item.label)}</span>`;
            }
            return `
                <span class="breadcrumb-item" onclick="${item.action}">${HomeView.escapeHtml(item.label)}</span>
                <span class="breadcrumb-separator">›</span>
            `;
        }).join('');
    },

    // Modal
    showModal(title, content) {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modalContent');

        modal.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="btn-icon" onclick="App.closeModal()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            ${content}
        `;

        overlay.classList.add('active');
    },

    closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
    },

    // Toast notifications
    toast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span>${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(100px)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});