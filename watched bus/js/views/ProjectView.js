// ========================================
// PROJECT VIEW (Main project page with tabs)
// ========================================
const ProjectView = {
    currentProject: null,
    activeTab: 'team',

    render(projectId) {
        const data = Storage.getProject(projectId);
        if (!data) {
            return `<div class="empty-state"><h4>Projeto não encontrado</h4></div>`;
        }

        this.currentProject = new Project(data);
        const p = this.currentProject;

        // Update breadcrumb
        App.setBreadcrumb([
            { label: 'Projetos', action: "App.navigateTo('home')" },
            { label: p.name, current: true }
        ]);

        return `
            <div class="project-header">
                <div class="project-title-section">
                    <h2>${HomeView.escapeHtml(p.name)}</h2>
                    <p>${HomeView.escapeHtml(p.description || 'Sem descrição')}</p>
                </div>
            </div>

            <div class="project-tabs" id="projectTabs">
                <button class="tab-btn ${this.activeTab === 'team' ? 'active' : ''}" onclick="ProjectView.switchTab('team')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Equipe
                </button>
                <button class="tab-btn ${this.activeTab === 'backlog' ? 'active' : ''}" onclick="ProjectView.switchTab('backlog')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                    Product Backlog
                    <span class="tab-badge">${p.backlog.length}</span>
                </button>
                <button class="tab-btn ${this.activeTab === 'sprints' ? 'active' : ''}" onclick="ProjectView.switchTab('sprints')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="13 17 18 12 13 7"></polyline>
                        <polyline points="6 17 11 12 6 7"></polyline>
                    </svg>
                    Sprints
                    <span class="tab-badge">${p.sprints.length}</span>
                </button>
                <button class="tab-btn ${this.activeTab === 'kanban' ? 'active' : ''}" onclick="ProjectView.switchTab('kanban')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="18" rx="1"></rect>
                        <rect x="14" y="3" width="7" height="12" rx="1"></rect>
                    </svg>
                    Kanban
                </button>
                <button class="tab-btn ${this.activeTab === 'ceremonies' ? 'active' : ''}" onclick="ProjectView.switchTab('ceremonies')">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Cerimônias
                </button>
            </div>

            <div id="tabContent">
                ${this.renderActiveTab()}
            </div>
        `;
    },

    switchTab(tab) {
        this.activeTab = tab;
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.currentTarget.classList.add('active');
        // Render tab content
        document.getElementById('tabContent').innerHTML = this.renderActiveTab();
    },

    renderActiveTab() {
        switch (this.activeTab) {
            case 'team': return this.renderTeamTab();
            case 'backlog': return BacklogView.render(this.currentProject);
            case 'sprints': return SprintView.render(this.currentProject);
            case 'kanban': return KanbanView.render(this.currentProject);
            case 'ceremonies': return CeremonyView.render(this.currentProject);
            default: return '';
        }
    },

    renderTeamTab() {
        const p = this.currentProject;
        let pairsHtml = '';
        p.devPairs.forEach((pair, idx) => {
            pairsHtml += `
                <div class="dev-pair">
                    <span class="dev-pair-label">Par ${idx + 1}</span>
                    <input type="text" placeholder="Desenvolvedor 1" value="${HomeView.escapeHtml(pair.dev1)}"
                           onchange="ProjectView.updatePair('${pair.id}', 'dev1', this.value)">
                    <input type="text" placeholder="Desenvolvedor 2" value="${HomeView.escapeHtml(pair.dev2)}"
                           onchange="ProjectView.updatePair('${pair.id}', 'dev2', this.value)">
                    ${p.devPairs.length > 1 ? `
                    <button class="btn-icon" onclick="ProjectView.removePair('${pair.id}')" title="Remover par">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>` : ''}
                </div>
            `;
        });

        return `
            <div class="roles-grid">
                <!-- Product Owner -->
                <div class="role-card">
                    <div class="role-card-header">
                        <div class="role-icon po">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                        </div>
                        <div>
                            <h3>Product Owner</h3>
                            <p>Focado no valor para o cliente</p>
                        </div>
                    </div>
                    <div class="role-input-group">
                        <input type="text" class="role-input" placeholder="Nome do Product Owner"
                               value="${HomeView.escapeHtml(p.productOwner)}"
                               onchange="ProjectView.updateRole('productOwner', this.value)">
                    </div>
                </div>

                <!-- Scrum Master -->
                <div class="role-card">
                    <div class="role-card-header">
                        <div class="role-icon sm">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                        </div>
                        <div>
                            <h3>Scrum Master</h3>
                            <p>Focado no processo e remoção de barreiras</p>
                        </div>
                    </div>
                    <div class="role-input-group">
                        <input type="text" class="role-input" placeholder="Nome do Scrum Master"
                               value="${HomeView.escapeHtml(p.scrumMaster)}"
                               onchange="ProjectView.updateRole('scrumMaster', this.value)">
                    </div>
                </div>

                <!-- Dev Team -->
                <div class="role-card">
                    <div class="role-card-header">
                        <div class="role-icon dev">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="16 18 22 12 16 6"></polyline>
                                <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                        </div>
                        <div>
                            <h3>Equipe de Desenvolvimento</h3>
                            <p>Duplas de programação (Pair Programming)</p>
                        </div>
                    </div>
                    <div class="dev-team-list">
                        ${pairsHtml}
                    </div>
                    <button class="add-pair-btn" onclick="ProjectView.addPair()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Adicionar Dupla
                    </button>
                </div>
            </div>
        `;
    },

    // Role update methods
    updateRole(role, value) {
        this.currentProject[role] = value.trim();
        this.currentProject.save();
        App.toast('Papel atualizado', 'success');
    },

    addPair() {
        this.currentProject.devPairs.push({
            id: Storage.generateId(),
            dev1: '',
            dev2: ''
        });
        this.currentProject.save();
        this.refreshTab();
    },

    removePair(pairId) {
        this.currentProject.devPairs = this.currentProject.devPairs.filter(p => p.id !== pairId);
        this.currentProject.save();
        this.refreshTab();
    },

    updatePair(pairId, field, value) {
        const pair = this.currentProject.devPairs.find(p => p.id === pairId);
        if (pair) {
            pair[field] = value.trim();
            this.currentProject.save();
        }
    },

    refreshTab() {
        document.getElementById('tabContent').innerHTML = this.renderActiveTab();
    },

    refreshProject() {
        const data = Storage.getProject(this.currentProject.id);
        if (data) {
            this.currentProject = new Project(data);
        }
    }
};