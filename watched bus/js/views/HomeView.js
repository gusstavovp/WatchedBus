// ========================================
// HOME VIEW
// ========================================
const HomeView = {
    render() {
        const projects = Storage.getProjects();

        let projectCards = '';
        projects.forEach(p => {
            const project = new Project(p);
            const stats = project.getBacklogStats();
            const activeSprint = project.getActiveSprint();
            const sprintCount = project.sprints.length;

            projectCards += `
                <div class="project-card" onclick="App.navigateTo('project', '${project.id}')">
                    <div class="project-card-header">
                        <h3>${this.escapeHtml(project.name)}</h3>
                        <button class="btn-icon" onclick="event.stopPropagation(); HomeView.deleteProject('${project.id}')" title="Excluir">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <p class="project-card-description">${this.escapeHtml(project.description || 'Sem descrição')}</p>
                    <div class="project-card-meta">
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                            </svg>
                            ${stats.total} itens
                        </span>
                        <span class="meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            ${sprintCount} sprint${sprintCount !== 1 ? 's' : ''}
                        </span>
                        ${activeSprint ? `<span class="meta-item" style="background:var(--success-light);color:var(--success)">
                            ● Sprint Ativa
                        </span>` : ''}
                    </div>
                </div>
            `;
        });

        return `
            <div class="home-hero">
                <h2>Seus Projetos</h2>
                <p>Gerencie seus projetos ágeis com Scrum + Kanban integrados</p>
            </div>
            <div class="projects-grid">
                <div class="project-card new-project-card" onclick="HomeView.showCreateModal()">
                    <div class="new-project-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                    <span>Criar Novo Projeto</span>
                </div>
                ${projectCards}
            </div>
        `;
    },

    showCreateModal() {
        App.showModal('Criar Novo Projeto', `
            <div class="modal-body">
                <div class="form-group">
                    <label>Nome do Projeto *</label>
                    <input type="text" class="form-input" id="projectName" placeholder="Ex: App Mobile E-commerce" autofocus>
                </div>
                <div class="form-group">
                    <label>Descrição</label>
                    <textarea class="form-textarea" id="projectDesc" placeholder="Descreva brevemente o objetivo do projeto..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="HomeView.createProject()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Criar Projeto
                </button>
            </div>
        `);
    },

    createProject() {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDesc').value.trim();

        if (!name) {
            App.toast('Por favor, informe o nome do projeto', 'warning');
            return;
        }

        const project = new Project({ name, description });
        project.save();

        App.closeModal();
        App.toast('Projeto criado com sucesso!', 'success');
        App.navigateTo('project', project.id);
    },

    deleteProject(projectId) {
        App.showModal('Confirmar Exclusão', `
            <div class="modal-body">
                <p>Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="App.closeModal()">Cancelar</button>
                <button class="btn btn-danger" onclick="HomeView.confirmDelete('${projectId}')">
                    Excluir Projeto
                </button>
            </div>
        `);
    },

    confirmDelete(projectId) {
        Storage.deleteProject(projectId);
        App.closeModal();
        App.toast('Projeto excluído', 'info');
        App.navigateTo('home');
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};