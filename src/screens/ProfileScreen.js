import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, StatusBar, ScrollView, Dimensions, } from 'react-native';
import { Avatar, Text, Button, Divider, Appbar, ActivityIndicator, IconButton, Surface, Chip } from 'react-native-paper';
import { getUserData, logout, fetchUserProfile, getUserTeams, getUserStats } from '../services/authService';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
    const [user, setUser] = useState(null);
    const [teams, setTeams] = useState([]);
    const [stats, setStats] = useState({
        projects_count: 0,
        tasks_count: 0,
        tasks_completed: 0,
        tasks_in_progress: 0,
        tasks_todo: 0,
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setRefreshing(true);

            // Récupérer les données utilisateur de base (stockées localement)
            const userData = await getUserData();
            if (userData) {
                setUser(userData);
                // Initialiser les statistiques avec les données de l'utilisateur
                if (userData.stats) {
                    setStats({
                        projects_count: userData.stats.projects_count || 0,
                        tasks_count: userData.stats.tasks_count || 0,
                        tasks_completed: userData.stats.tasks_completed || 0,
                        tasks_in_progress: userData.stats.tasks_in_progress || 0,
                        tasks_todo: userData.stats.tasks_todo || 0,
                    });
                }

                // Initialiser les équipes avec les données de l'utilisateur
                if (userData.teams && Array.isArray(userData.teams)) {
                    setTeams(userData.teams);
                } else if (userData.team) {
                    // Support pour l'ancien format avec une seule équipe
                    setTeams(userData.team ? [userData.team] : []);
                }
            }

            // Essayer de récupérer des données à jour depuis l'API
            try {
                // Récupérer le profil utilisateur depuis l'API
                const profileData = await fetchUserProfile();
                if (profileData) {
                    setUser(prevUser => ({ ...prevUser, ...profileData }));
                }
            } catch (error) {
                console.warn('Impossible de récupérer le profil depuis l\'API:', error);
            }

            try {
                // Récupérer les équipes de l'utilisateur
                const teamsData = await getUserTeams();
                if (teamsData) {
                    const teamsList = Array.isArray(teamsData) ? teamsData : (teamsData.results || []);
                    if (teamsList.length > 0) {
                        setTeams(teamsList);
                    }
                }
            } catch (error) {
                console.warn('Impossible de récupérer les équipes depuis l\'API:', error);
            }

            try {
                // Récupérer les statistiques de l'utilisateur
                const statsData = await getUserStats();
                if (statsData) {
                    setStats({
                        projects_count: statsData.projects_count || 0,
                        tasks_count: statsData.tasks_count || 0,
                        tasks_completed: statsData.tasks_completed || 0,
                        tasks_in_progress: statsData.tasks_in_progress || 0,
                        tasks_todo: statsData.tasks_todo || 0,
                    });
                }
            } catch (error) {
                console.warn('Impossible de récupérer les statistiques depuis l\'API:', error);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                {
                    text: 'Annuler',
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Erreur lors de la déconnexion:', error);
                            Alert.alert('Erreur', 'Impossible de se déconnecter. Veuillez réessayer.');
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const getInitials = (username) => {
        if (!username) return 'U';
        const nameParts = username.split(' ');
        if (nameParts.length > 1) {
            return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
        }
        return username.substring(0, 2).toUpperCase();
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1565C0" barStyle="light-content" />

            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
                <Appbar.Content title="Mon Profil" titleStyle={styles.appbarTitle} />
                <Appbar.Action icon="refresh" onPress={fetchData} color="#fff" />
            </Appbar.Header>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1565C0" />
                    <Text style={styles.loadingText}>Chargement de votre profil...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    <Animatable.View
                        animation="fadeIn"
                        duration={800}
                        style={styles.headerContainer}
                    >
                        <LinearGradient
                            colors={['#1565C0', '#42A5F5']}
                            style={styles.headerGradient}
                        >
                            <Animatable.View
                                animation="zoomIn"
                                duration={1000}
                                style={styles.avatarContainer}
                            >
                                <Avatar.Text
                                    size={100}
                                    label={getInitials(user?.username)}
                                    style={styles.avatar}
                                    labelStyle={styles.avatarLabel}
                                />
                            </Animatable.View>

                            <Animatable.View
                                animation="fadeInUp"
                                duration={800}
                                delay={300}
                            >
                                <Text style={styles.username}>{user?.username}</Text>
                                <View style={styles.roleContainer}>
                                    <Text style={styles.role}>{user?.role || 'Utilisateur'}</Text>
                                </View>
                            </Animatable.View>
                        </LinearGradient>
                    </Animatable.View>

                    <Animatable.View
                        animation="fadeInUp"
                        duration={800}
                        delay={500}
                    >
                        <Text style={styles.sectionTitle}>Informations personnelles</Text>

                        <Surface style={styles.infoCard}>
                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <IconButton icon="card-account-details" size={24} color="#1565C0" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Matricule</Text>
                                    <Text style={styles.infoValue}>{user?.matricule || 'Non renseigné'}</Text>
                                </View>
                            </View>

                            <Divider style={styles.divider} />

                            <View style={styles.infoItem}>
                                <View style={styles.infoIconContainer}>
                                    <IconButton icon="email" size={24} color="#1565C0" />
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={styles.infoLabel}>Email</Text>
                                    <Text style={styles.infoValue}>{user?.email || 'Non renseigné'}</Text>
                                </View>
                            </View>
                        </Surface>
                    </Animatable.View>

                    <Animatable.View
                        animation="fadeInUp"
                        duration={800}
                        delay={600}
                    >
                        <Text style={styles.sectionTitle}>Mes équipes</Text>
                        <Surface style={styles.teamsCard}>
                            <View style={styles.teamsContainer}>
                                {teams && teams.length > 0 ? (
                                    teams.map((team, index) => (
                                        <Chip
                                            key={team.id || index}
                                            style={styles.teamChip}
                                            textStyle={styles.teamChipText}
                                            icon="account-group"
                                        >
                                            {team.nom || team.name || 'Équipe sans nom'}
                                        </Chip>
                                    ))
                                ) : (
                                    <Text style={styles.noTeamText}>Aucune équipe assignée</Text>
                                )}
                            </View>
                        </Surface>
                    </Animatable.View>

                    <Animatable.View
                        animation="fadeInUp"
                        duration={800}
                        delay={700}
                        style={styles.statsContainer}
                    >
                        <Text style={styles.sectionTitle}>Statistiques</Text>

                        <View style={styles.statsRow}>
                            <Surface style={styles.statCard}>
                                <Text style={styles.statValue}>{stats.projects_count}</Text>
                                <Text style={styles.statLabel}>Projets</Text>
                            </Surface>

                            <Surface style={styles.statCard}>
                                <Text style={styles.statValue}>{stats.tasks_count}</Text>
                                <Text style={styles.statLabel}>Tâches</Text>
                            </Surface>

                            <Surface style={styles.statCard}>
                                <Text style={styles.statValue}>{stats.tasks_completed}</Text>
                                <Text style={styles.statLabel}>Terminées</Text>
                            </Surface>
                        </View>

                        <View style={styles.statsRow}>
                            <Surface style={[styles.statCard, styles.statCardWide]}>
                                <Text style={[styles.statValue, { color: '#E64A19' }]}>{stats.tasks_todo}</Text>
                                <Text style={styles.statLabel}>À faire</Text>
                            </Surface>

                            <Surface style={[styles.statCard, styles.statCardWide]}>
                                <Text style={[styles.statValue, { color: '#1976D2' }]}>{stats.tasks_in_progress}</Text>
                                <Text style={styles.statLabel}>En cours</Text>
                            </Surface>
                        </View>
                    </Animatable.View>

                    <Animatable.View
                        animation="fadeInUp"
                        duration={800}
                        delay={900}
                        style={styles.footerContainer}
                    >
                        <Button
                            mode="contained"
                            onPress={handleLogout}
                            style={styles.logoutButton}
                            icon="logout"
                            labelStyle={styles.logoutButtonText}
                        >
                            Déconnexion
                        </Button>
                    </Animatable.View>

                    <View style={styles.versionContainer}>
                        <Text style={styles.versionText}>Version 1.0.0</Text>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    appbar: {
        backgroundColor: '#1565C0',
        elevation: 0,
    },
    appbarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#1565C0',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        paddingBottom: 30,
    },
    headerContainer: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerGradient: {
        paddingTop: 30,
        paddingBottom: 40,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
        padding: 4,
        borderRadius: 54,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    avatar: {
        backgroundColor: '#1565C0',
    },
    avatarLabel: {
        fontSize: 36,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    roleContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 16,
        marginTop: 8,
        alignSelf: 'center',
    },
    role: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#424242',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    infoCard: {
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 10,
        elevation: 2,
        overflow: 'hidden',
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoIconContainer: {
        marginLeft: 4,
    },
    infoContent: {
        marginLeft: 8,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#757575',
    },
    infoValue: {
        fontSize: 16,
        color: '#212121',
    },
    divider: {
        marginHorizontal: 16,
    },
    teamsCard: {
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 10,
        padding: 16,
        elevation: 2,
    },
    teamsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    teamChip: {
        margin: 4,
        backgroundColor: '#E3F2FD',
    },
    teamChipText: {
        color: '#1565C0',
    },
    noTeamText: {
        color: '#757575',
        fontStyle: 'italic',
        padding: 8,
    },
    statsContainer: {
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        marginHorizontal: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        margin: 4,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
    statCardWide: {
        flex: 1,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#424242',
    },
    statLabel: {
        fontSize: 14,
        color: '#757575',
        marginTop: 4,
    },
    footerContainer: {
        marginHorizontal: 16,
        marginBottom: 24,
    },
    logoutButton: {
        backgroundColor: '#D32F2F',
        paddingVertical: 8,
    },
    logoutButtonText: {
        fontSize: 16,
    },
    versionContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    versionText: {
        color: '#9E9E9E',
        fontSize: 12,
    },
});

export default ProfileScreen;