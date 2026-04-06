// ========================================
// PROJECT MODEL
// ========================================
class Project {
    constructor(data = {}) {
        this.id = data.id || Storage.generateId();
        this.name = data.name || '';
        this.description = data.description || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();

        // Roles
        this.productOwner = data.productOwner || '';
        this.scrumMaster = data.scrumMaster || '';
        this.devPairs = data.devPairs || [
            { id: Storage.generateId(), dev1: '', dev2: '' }
        ];

        // Backlogs
        this.backlog = data.backlog || [];

        // Sprints
        this.sprints = data.sprints || [];

        // WIP Limits
        this.wipLimits = data.wipLimits || {
            todo: 10,
            inProgress: 3,
            review: 3,
            done: 0 // no limit
        };

        // Ceremonies
        this.dailyScrums = data.dailyScrums || [];
        this.retrospectives = data.retrospectives || [];
    }

    save() {
        this.updatedAt = new Date().toISOString();
        Storage.saveProject(this.toJSON());
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            productOwner: this.productOwner,
            scrumMaster: this.scrumMaster,
            devPairs: this.devPairs,
            backlog: this.backlog,
            sprints: this.sprints,
            wipLimits: this.wipLimits,
            dailyScrums: this.dailyScrums,
            retrospectives: this.retrospectives
        };
    }

    // Backlog methods
    addBacklogItem(item) {
        this.backlog.push(item);
        this.save();
    }

    updateBacklogItem(itemId, updates) {
        const index = this.backlog.findIndex(i => i.id === itemId);
        if (index >= 0) {
            this.backlog[index] = { ...this.backlog[index], ...updates };
            this.save();
        }
    }

    removeBacklogItem(itemId) {
        this.backlog = this.backlog.filter(i => i.id !== itemId);
        this.save();
    }

    // Sprint methods
    addSprint(sprint) {
        this.sprints.push(sprint);
        this.save();
    }

    updateSprint(sprintId, updates) {
        const index = this.sprints.findIndex(s => s.id === sprintId);
        if (index >= 0) {
            this.sprints[index] = { ...this.sprints[index], ...updates };
            this.save();
        }
    }

    getActiveSprint() {
        return this.sprints.find(s => s.status === 'active') || null;
    }

    // Dev pairs helpers
    getAllDevNames() {
        const names = [];
        this.devPairs.forEach(pair => {
            if (pair.dev1) names.push(pair.dev1);
            if (pair.dev2) names.push(pair.dev2);
        });
        return names;
    }

    getPairLabel(pair) {
        const parts = [];
        if (pair.dev1) parts.push(pair.dev1);
        if (pair.dev2) parts.push(pair.dev2);
        return parts.join(' & ') || 'Par sem nome';
    }

    // Ceremony methods
    addDailyScrum(daily) {
        this.dailyScrums.unshift(daily);
        this.save();
    }

    addRetrospective(retro) {
        this.retrospectives.unshift(retro);
        this.save();
    }

    // Stats
    getBacklogStats() {
        const total = this.backlog.length;
        const inSprints = this.backlog.filter(i => i.sprintId).length;
        const totalPoints = this.backlog.reduce((sum, i) => sum + (i.points || 0), 0);
        return { total, inSprints, totalPoints };
    }

    getSprintProgress(sprintId) {
        const sprint = this.sprints.find(s => s.id === sprintId);
        if (!sprint || !sprint.tasks || sprint.tasks.length === 0) return 0;
        const done = sprint.tasks.filter(t => t.status === 'done').length;
        return Math.round((done / sprint.tasks.length) * 100);
    }
}