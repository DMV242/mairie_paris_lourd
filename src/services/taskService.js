import apiClient from './authService';

// Récupérer toutes les tâches d'un projet
export const getProjectTasks = async (projectId) => {
    try {
        const response = await apiClient.get(`/tasks/?project=${projectId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des tâches du projet ${projectId}:`, error);
        throw error;
    }
};

// Récupérer une tâche spécifique par ID
export const getTask = async (taskId) => {
    try {
        const response = await apiClient.get(`/tasks/${taskId}/`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la tâche ${taskId}:`, error);
        throw error;
    }
};

// Récupérer les tâches d'un utilisateur
export const getUserTasks = async (userId) => {
    try {
        const response = await apiClient.get(`/tasks/?user=${userId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des tâches de l'utilisateur ${userId}:`, error);
        throw error;
    }
};

// Filtrer les tâches par statut
export const getTasksByStatus = async (status) => {
    try {
        const response = await apiClient.get(`/tasks/?status=${status}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des tâches avec le statut ${status}:`, error);
        throw error;
    }
};

// Filtrer les tâches par priorité
export const getTasksByPriority = async (priority) => {
    try {
        const response = await apiClient.get(`/tasks/?priority=${priority}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des tâches avec la priorité ${priority}:`, error);
        throw error;
    }
};

// Récupérer les tâches à venir (dans les 7 prochains jours)
export const getUpcomingTasks = async () => {
    try {
        const response = await apiClient.get('/tasks/?upcoming=true');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches à venir:', error);
        throw error;
    }
};

// Récupérer les tâches en retard (date échue et non terminées)
export const getOverdueTasks = async () => {
    try {
        const response = await apiClient.get('/tasks/?overdue=true');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches en retard:', error);
        throw error;
    }
};