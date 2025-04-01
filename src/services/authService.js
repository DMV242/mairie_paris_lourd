import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Définir l'URL de base de l'API
// Remplacez YOUR_SERVER_IP par l'adresse IP de votre serveur Django
// Exemple: 192.168.1.10 pour un serveur local
const API_URL = 'http://10.3.226.88:8000/api';

// Créer une instance Axios avec des configurations par défaut
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Intercepteur pour ajouter le token aux requêtes
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les réponses et rafraîchir le token si nécessaire
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Récupérer la configuration de la requête originale
        const originalRequest = error.config;

        // Si l'erreur est 401 (Non autorisé) et que la requête n'est pas déjà en cours de nouvelle tentative
        if (error.response &&
            error.response.status === 401 &&
            !originalRequest._retry) {

            originalRequest._retry = true;

            try {
                // Tenter de rafraîchir le token
                const newToken = await refreshToken();

                // Mettre à jour le header d'autorisation avec le nouveau token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Répéter la requête avec le nouveau token
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Si le rafraîchissement échoue, rediriger vers la page de connexion
                console.error('Échec du rafraîchissement du token:', refreshError);
                await logout();
                return Promise.reject(refreshError);
            }
        }

        // Renvoyer l'erreur pour les autres cas
        return Promise.reject(error);
    }
);

// Fonction pour rafraîchir le token JWT
export const refreshToken = async () => {
    try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('Refresh token non disponible');
        }

        const response = await axios.post(`${API_URL}/token/refresh/`, {
            refresh: refreshToken
        });

        // Mettre à jour le token d'accès
        if (response.data && response.data.access) {
            await AsyncStorage.setItem('userToken', response.data.access);
            return response.data.access;
        } else {
            throw new Error('Token d\'accès non reçu');
        }
    } catch (error) {
        console.error('Erreur lors du rafraîchissement du token:', error);
        // Si le refresh token a expiré, déconnecter l'utilisateur
        await logout();
        throw error;
    }
};

// Fonction de connexion
export const login = async (matricule, password) => {
    try {
        const response = await apiClient.post('/login/', {
            matricule,
            password,
        });
        // Stocker les tokens
        await AsyncStorage.setItem('userToken', response.data.access);
        await AsyncStorage.setItem('refreshToken', response.data.refresh);
        // Stocker les informations utilisateur
        await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));

        return response.data;
    } catch (error) {
        console.error('Erreur de connexion:', error);
        throw error;
    }
};

// Fonction de déconnexion
export const logout = async (navigation) => {
    try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('refreshToken');
        await AsyncStorage.removeItem('userData');

        // Si la navigation est fournie, rediriger vers l'écran de connexion


        return true;
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
        throw error;
    }
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        return !!token;
    } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        return false;
    }
};

// Récupérer les données de l'utilisateur
export const getUserData = async () => {
    try {
        const userData = await AsyncStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('Erreur de récupération des données utilisateur:', error);
        return null;
    }
};

// Récupérer les données de l'utilisateur depuis l'API
export const fetchUserProfile = async () => {
    try {
        const response = await apiClient.get('/profile/');
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération du profil utilisateur:', error);
        throw error;
    }
};

// Récupérer les équipes de l'utilisateur
export const getUserTeams = async () => {
    try {
        // Récupérer l'ID de l'utilisateur depuis le stockage local
        const userData = await getUserData();
        const userId = userData?.id;

        if (!userId) {
            throw new Error('ID utilisateur non disponible');
        }

        // Utiliser l'endpoint teams avec un filtre d'utilisateur
        const response = await apiClient.get(`/teams/?user=${userId}`);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des équipes de l\'utilisateur:', error);
        throw error;
    }
};

// Récupérer les statistiques utilisateur
export const getUserStats = async () => {
    try {
        // Récupérer l'ID de l'utilisateur depuis le stockage local
        const userData = await getUserData();
        const userId = userData?.id;

        if (!userId) {
            throw new Error('ID utilisateur non disponible');
        }

        // Utiliser l'endpoint users avec l'ID de l'utilisateur
        const response = await apiClient.get(`/users/${userId}/`);

        // Extraire les informations pertinentes pour les statistiques
        const userDetails = response.data;

        // Récupérer les équipes de l'utilisateur pour obtenir les projets associés
        const teamsResponse = await apiClient.get(`/teams/?user=${userId}`);
        const teams = Array.isArray(teamsResponse.data) ?
            teamsResponse.data : (teamsResponse.data.results || []);

        // Récupérer les projets liés aux équipes de l'utilisateur
        let projectsCount = 0;

        if (teams.length > 0) {
            // Récupérer tous les projets pour toutes les équipes de l'utilisateur
            const projectsPromises = teams.map(team =>
                apiClient.get(`/projects/?team=${team.id}`)
            );

            const projectsResponses = await Promise.all(projectsPromises);

            // Compter les projets uniques (par ID)
            const uniqueProjectIds = new Set();

            projectsResponses.forEach(response => {
                const projects = Array.isArray(response.data) ?
                    response.data : (response.data.results || []);

                projects.forEach(project => {
                    uniqueProjectIds.add(project.id);
                });
            });

            projectsCount = uniqueProjectIds.size;
        }

        // Récupérer les tâches de l'utilisateur pour calculer les statistiques
        const tasksResponse = await apiClient.get(`/tasks/?user=${userId}`);
        const tasks = Array.isArray(tasksResponse.data) ?
            tasksResponse.data : (tasksResponse.data.results || []);

        // Calculer les statistiques
        const stats = {
            projects_count: projectsCount || userDetails.projects_count || 0,
            tasks_count: tasks.length,
            tasks_completed: tasks.filter(t => t.status?.toLowerCase() === 'terminé').length,
            tasks_in_progress: tasks.filter(t => t.status?.toLowerCase() === 'en cours').length,
            tasks_todo: tasks.filter(t => t.status?.toLowerCase() === 'à faire').length,
        };

        return stats;
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques utilisateur:', error);
        throw error;
    }
};

export default apiClient;