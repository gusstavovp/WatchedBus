// ========================================
// LOCAL STORAGE UTILITY
// ========================================
const Storage = {
    KEY: 'scrumban_data',

    getData() {
        try {
            const data = localStorage.getItem(this.KEY);
            return data ? JSON.parse(data) : { projects: [] };
        } catch (e) {
            console.error('Error reading storage:', e);
            return { projects: [] };
        }
    },

    saveData(data) {
        try {
            localStorage.setItem(this.KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    },

    getProjects() {
        return this.getData().projects || [];
    },

    saveProject(project) {
        const data = this.getData();
        const index = data.projects.findIndex(p => p.id === project.id);
        if (index >= 0) {
            data.projects[index] = project;
        } else {
            data.projects.push(project);
        }
        this.saveData(data);
    },

    deleteProject(projectId) {
        const data = this.getData();
        data.projects = data.projects.filter(p => p.id !== projectId);
        this.saveData(data);
    },

    getProject(projectId) {
        return this.getProjects().find(p => p.id === projectId) || null;
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
};