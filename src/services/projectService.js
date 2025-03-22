import apiClient from './authService';

// Récupérer tous les projets
export const getProjects = async () => {
    try {
        const response = await apiClient.get('/projects/');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        throw error;
    }
};

// Récupérer un projet spécifique par ID
export const getProject = async (projectId) => {
    try {
        const response = await apiClient.get(`/projects/${projectId}/`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération du projet ${projectId}:`, error);
        throw error;
    }
};

// Filtrer les projets par statut
export const getProjectsByStatus = async (status) => {
    try {
        const response = await apiClient.get(`/projects/?status=${status}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des projets avec le statut ${status}:`, error);
        throw error;
    }
};

// Filtrer les projets par équipe
export const getProjectsByTeam = async (teamId) => {
    try {
        const response = await apiClient.get(`/projects/?team=${teamId}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des projets de l'équipe ${teamId}:`, error);
        throw error;
    }
};

// Rechercher des projets par nom ou description
export const searchProjects = async (searchTerm) => {
    try {
        const response = await apiClient.get(`/projects/?search=${searchTerm}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la recherche de projets avec le terme "${searchTerm}":`, error);
        throw error;
    }
};