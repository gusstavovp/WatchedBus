// ========================================
// KANBAN VIEW
// ========================================
const KanbanView = {
    draggedTaskId: null,
    draggedSprintId: null,

    render(project) {
        const p = project;
        const activeSprint = p.getActiveSprint();

        if (!activeSprint) {
            return `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="7" height="18" rx="1"></rect>
                        <rect x="14" y="3" width="7" height="12" rx="1"></rect>
                    </svg>
                    <h4>Nenhuma Sprint ativa</h4>
                    <p>Inicie uma sprint na aba "Sprints" para visualizar o quadro Kanban.</p>
                </div>
            `;
        }

        const tasks = activeSprint.tasks || [];
        const columns = {
            todo: tasks.filter(t => t.status === 'todo'),
            inProgress: tasks.filter(t => t.status === 'inProgress'),
            review: tasks.filter(t => t.status === 'review'),
            done: tasks.filter(t => t.status === 'done')
        };

        const wipLimits = p.wipLimits || { todo: 10, inProgress: 3, review: 3, done: 0 };

        const columnConfig = [
            { key: 'todo', label: 'A Fazer', dot: 'todo', limit: wipLimits.todo },
            { key: 'inProgress', label: 'Em Andamento', dot: 'progress', limit: wipLimits.inProgress },
            { key: 'review', label: 'Em Revisão', dot: 'review', limit: wipLimits.review },
            { key: 'done', label: 'Concluído', dot: 'done', limit: wipLimits.done }
        ];

        let columnsHtml = '';
        columnConfig.forEach(col => {
            const items = columns[col.key];
            const isExceeded = col.limit > 0 && items.length > col.limit;

            let cardsHtml = '';
            items.forEach(task => {
                const initials = task.assignedPairLabel ?
                    task.assignedPairLabel.split(' & ').map(n => n.charAt(0).toUpperCase()).join('') : '?';

                cardsHtml += `
                    <div class="kanban-card" draggable="true"
                         data-task-id="${task.id}"
                         data-sprint-id="${activeSprint.id}"
                         ondragstart="KanbanView.onDragStart(event)"
                         ondragend="KanbanView.onDragEnd(event)"
                         onclick="KanbanView.showTaskDetail('${activeSprint.id}', '${task.id}')">
                        <div class="kanban-card-parent">${HomeView.escapeHtml(task.backlogItemTitle || '')}</div>
                        <div class="kanban-card-title">${HomeView.escapeHtml(task.title)}</div>
                        <div class="kanban-card-footer">
                            <div class="kanban-card-assignee">
                                <span class="assignee-avatar">${initials}</span>
                                ${HomeView.escapeHtml(task.assignedPairLabel || 'Sem atribuição')}
                            </div>
                            ${task.comments && task.comments.length > 0 ? `
                            <div class="kanban-card-comments">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                ${task.comments.length}
                            </div>` : ''}
                        </div>
                    </div>
                `;
            });

            columnsHtml += `
                <div class="kanban-column ${isExceeded ? 'wip-exceeded' : ''}"
                     data-column="${col.key}"
                     ondragover="KanbanView.onDragOver(event)"
                     ondrop="KanbanView.onDrop(event)"
                     ondragenter="KanbanView.onDragEnter(event)"
                     ondragleave="KanbanView.onDragLeave(event)">
                    <div class="kanban-column-header">
                        <div class="kanban-column-title">
                            <span class="column-dot ${col.dot}"></span>
                            ${col.label}
                        </div>
                        <span class="column-count ${isExceeded ? 'exceeded' : ''}">
                            ${items.length}${col.limit > 0 ? '/' + col.limit : ''}
                        </span>
                    </div>
                    <div class="kanban-cards">
                        ${cardsHtml || '<p class="text-xs text-muted text-center" style="padding:var(--space-lg);">Arraste tarefas aqui</p>'}
                    </div>
                </div>
            `;
        });

        return `
            <div class="kanban-header">
                <div>
                    <h3>Quadro Kanban — ${HomeView.escapeHtml(activeSprint.name)}</h3>
                    <p class="text-sm text-muted mt-sm">Sprint ${activeSprint.status === 'active' ? 'ativa' : activeSprint.status} · ${new Sprint(activeSprint).getRemainingDays()} dias restantes</p>
                </div>
                <div class="wip-settings">
                    <span>Limites WIP:</span>
                    <label class="text-xs">Andamento:
                        <input type="number" class="wip-input" value="${wipLimits.inProgress}" min="0"
                               onchange="KanbanView.updateWipLimit('inProgress', this.value)">
                    </label>
                    <label class="text-xs">Revisão:
                        <input type="number" class="wip-input" value="${wipLimits.review}" min="0"
                               onchange="KanbanView.updateWipLimit('review', this.value)">
                    </label>
                </div>
            </div>
            <div class="kanban-board">
                ${columnsHtml}
            </div>
        `;
    },

    // Drag & Drop handlers
    onDragStart(event) {
        const card = event.target.closest('.kanban-card');
        this.draggedTaskId = card.dataset.taskId;
        this.draggedSprintId = card.dataset.sprintId;
        card.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
    },

    onDragEnd(event) {
        const card = event.target.closest('.kanban-card');
        if (card) card.classList.remove('dragging');
        document.querySelectorAll('.kanban-column').forEach(col => col.classList.remove('drag-over'));
    },

    onDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    },

    onDragEnter(event) {
        const column = event.target.closest('.kanban-column');
        if (column) column.classList.add('drag-over');
    },

    onDragLeave(event) {
        const column = event.target.closest('.kanban-column');
        if (column && !column.contains(event.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    },

    onDrop(event) {
        event.preventDefault();
        const column = event.target.closest('.kanban-column');
        if (!column || !this.draggedTaskId) return;

        column.classList.remove('drag-over');
        const newStatus = column.dataset.column;
        this.moveTask(this.draggedSprintId, this.draggedTaskId, newStatus);
    },

    moveTask(sprintId, taskId, newStatus) {
        const p = ProjectView.currentProject;
        const sprint = p.sprints.find(s => s.id === sprintId);
        if (!sprint) return;

        // Check WIP limit
        const wipLimits = p.wipLimits || {};
        const limit = wipLimits[newStatus] || 0;
        if (limit > 0) {
            const currentCount = sprint.tasks.filter(t => t.status === newStatus && t.id !== taskId).length;
            if (currentCount >= limit) {
                App.toast(`Limite WIP atingido para esta coluna (${limit}). Conclua tarefas antes de mover novas.`, 'warning');
                return;
            }
        }

        const task = sprint.tasks.find(t => t.id === taskId);
        if (task) {
            const oldStatus = task.status;
            task.status = newStatus;
            // Add history
            if (!task.history) task.history = [];
            task.history.push({
                from: oldStatus,
                to: newStatus,
                timestamp: new Date().toISOString()
            });
            p.updateSprint(sprintId, { tasks: sprint.tasks });

            const statusLabels = { todo: 'A Fazer', inProgress: 'Em Andamento', review: 'Revisão', done: 'Concluído' };
            App.toast(`Tarefa movida para "${statusLabels[newStatus]}"`, 'success');
        }

        ProjectView.refreshProject();
        ProjectView.refreshTab();
    },

    updateWipLimit(column, value) {
        const p = ProjectView.currentProject;
        p.wipLimits[column] = parseInt(value) || 0;
        p.save();
        ProjectView.refreshProject();
        ProjectView.refreshTab();
    },

    showTaskDetail(sprintId, taskId) {
        const p = ProjectView.currentProject;
        const sprint = p.sprints.find(s => s.id === sprintId);
        if (!sprint) return;
        const task = sprint.tasks.find(t => t.id === taskId);
        if (!task) return;

        const statusLabels = { todo: 'A Fazer', inProgress: 'Em Andamento', review: 'Revisão', done: 'Concluído' };

        let historyHtml = '';
        if (task.history && task.history.length > 0) {
            historyHtml = task.history.map(h => `
                <div class="text-xs text-muted" style="padding:4px 0;border-bottom:1px solid var(--gray-100);">
                    ${statusLabels[h.from] || h.from} → ${statusLabels[h.to] || h.to}
                    <span style="float:right">${new Date(h.timestamp).toLocaleString('pt-BR')}</span>
                </div>
            `).join('');
        }

        let commentsHtml = '';
        if (task.comments && task.comments.length > 0) {
            commentsHtml = task.comments.map(c => `
                <div class="comment-item">
                    <div class="comment-time">${new Date(c.timestamp).toLocaleString('pt-BR')}</div>
                    <div class="comment-text">${HomeView.escapeHtml(c.text)}</div>
                </div>
            `).join('');
        }

        // Pair options for reassignment
        let pairOptions = '<option value="">Sem atribuição</option>';
        p.devPairs.forEach(pair => {
            const label = p.getPairLabel(pair);
            pairOptions += `<option value="${pair.id}" ${task.assignedPairId === pair.id ? 'selected' : ''}>${HomeView.escapeHtml(label)}</option>`;
        });

        App.showModal('Detalhes da Tarefa', `
            <div class="modal-body">
                <h4 style="margin-bottom:var(--space-sm)">${HomeView.escapeHtml(task.title)}</h4>
                <p class="text-sm text-muted mb-md">Origem: ${HomeView.escapeHtml(task.backlogItemTitle || '—')}</p>

                <div class="form-row">
                    <div class="form-group">
                        <label>Status</label>
                        <select class="form-select" id="taskDetailStatus">
                            <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>A Fazer</option>
                            <option value="inProgress" ${task.status === 'inProgress' ? 'selected' : ''}>Em Andamento</option>
                            <option value="review" ${task.status === 'review' ? 'selected' : ''}>Em Revisão</option>
                            <option value="done" ${task.status === 'done' ? 'selected' : ''}>Concluído</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Dupla Responsável</label>
                        <select class="form-select" id="taskDetailPair">${pairOptions}</select>
                    </div>
                </div>

                <!-- Comments -->
                <div class="form-group">
                    <label>Comentários</label>
                    <div class="comment-input-row">
                        <input type="text" id="taskCommentInput" placeholder="Adicionar comentário...">
                        <button class="btn btn-sm btn-primary" onclick="KanbanView.addComment('${sprintId}', '${taskId}')">Enviar</button>
                    </div>
                    <div class="comments-list">
                        ${commentsHtml || '<p class="text-xs text-muted">Nenhum comentário ainda.</p>'}
                    </div>
                </div>

                <!-- History -->
                ${task.history && task.history.length > 0 ? `
                <div class="form-group">
                    <label>Histórico de Alterações</label>
                    <div style="max-height:150px;overflow-y:auto;">
                        ${historyHtml}
                    </div>
                </div>` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="App.closeModal()">Fechar</button>
                <button class="btn btn-primary" onclick="KanbanView.saveTaskDetail('${sprintId}', '${taskId}')">Salvar</button>
            </div>
        `);
    },

    addComment(sprintId, taskId) {
        const input = document.getElementById('taskCommentInput');
        const text = input.value.trim();
        if (!text) return;

        const p = ProjectView.currentProject;
        const sprint = p.sprints.find(s => s.id === sprintId);
        if (!sprint) return;
        const task = sprint.tasks.find(t => t.id === taskId);
        if (!task) return;

        if (!task.comments) task.comments = [];
        task.comments.push({
            id: Storage.generateId(),
            text,
            timestamp: new Date().toISOString()
        });

        p.updateSprint(sprintId, { tasks: sprint.tasks });
        ProjectView.refreshProject();

        // Refresh modal
        App.closeModal();
        this.showTaskDetail(sprintId, taskId);
    },

    saveTaskDetail(sprintId, taskId) {
        const newStatus = document.getElementById('taskDetailStatus').value;
        const newPairId = document.getElementById('taskDetailPair').value;

        const p = ProjectView.currentProject;
        const sprint = p.sprints.find(s => s.id === sprintId);
        if (!sprint) return;
        const task = sprint.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Check WIP before moving
        if (newStatus !== task.status) {
            const wipLimits = p.wipLimits || {};
            const limit = wipLimits[newStatus] || 0;
            if (limit > 0) {
                const currentCount = sprint.tasks.filter(t => t.status === newStatus && t.id !== taskId).length;
                if (currentCount >= limit) {
                    App.toast(`Limite WIP atingido para "${newStatus}". Conclua tarefas primeiro.`, 'warning');
                    return;
                }
            }

            if (!task.history) task.history = [];
            task.history.push({
                from: task.status,
                to: newStatus,
                timestamp: new Date().toISOString()
            });
            task.status = newStatus;
        }

        // Update pair
        if (newPairId !== task.assignedPairId) {
            task.assignedPairId = newPairId || null;
            const pair = p.devPairs.find(pp => pp.id === newPairId);
            task.assignedPairLabel = pair ? p.getPairLabel(pair) : '';
        }

        p.updateSprint(sprintId, { tasks: sprint.tasks });
        App.closeModal();
        App.toast('Tarefa atualizada!', 'success');
        ProjectView.refreshProject();
        ProjectView.refreshTab();
    }
};