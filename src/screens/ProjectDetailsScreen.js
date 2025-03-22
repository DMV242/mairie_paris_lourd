import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Dimensions, Platform } from 'react-native';
import { Text, Title, Paragraph, ActivityIndicator, Appbar, Chip, Avatar, Button } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { getProject } from '../services/projectService';
import { getProjectTasks } from '../services/taskService';

const { width, height } = Dimensions.get('window');

const ProjectDetailsScreen = ({ route, navigation }) => {
    const { project: initialProject } = route.params;
    const [project, setProject] = useState(initialProject);
    const [taskStats, setTaskStats] = useState({
        total: 0,
        aFaire: 0,
        enCours: 0,
        termine: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            setError('');

            // Récupérer les données du projet
            const projectData = await getProject(initialProject.id);
            setProject(projectData);

            // Récupérer les tâches du projet pour les statistiques
            const tasksData = await getProjectTasks(initialProject.id);
            const tasks = Array.isArray(tasksData) ? tasksData : (tasksData.results || []);

            // Calculer les statistiques
            const stats = {
                total: tasks.length,
                aFaire: tasks.filter(t => t.status?.toLowerCase() === 'à faire').length,
                enCours: tasks.filter(t => t.status?.toLowerCase() === 'en cours').length,
                termine: tasks.filter(t => t.status?.toLowerCase() === 'terminé').length
            };
            setTaskStats(stats);
        } catch (error) {
            console.error('Erreur lors de la récupération des détails du projet:', error);
            setError('Impossible de récupérer les détails du projet');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProjectDetails();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProjectDetails();
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'en cours':
                return ['#1976D2', '#42A5F5']; // Bleu
            case 'terminé':
                return ['#2E7D32', '#66BB6A']; // Vert
            case 'annulé':
                return ['#C62828', '#EF5350']; // Rouge
            default:
                return ['#757575', '#9E9E9E']; // Gris
        }
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
                <Appbar.Header style={styles.appbar}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title="Détails du projet" titleStyle={styles.appbarTitle} />
                </Appbar.Header>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1565C0" />
                    <Text style={styles.loadingText}>Chargement des détails...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1565C0" barStyle="light-content" />

            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Détails du projet" titleStyle={styles.appbarTitle} />
                <Appbar.Action icon="refresh" onPress={onRefresh} color="white" />
            </Appbar.Header>

            <View style={styles.contentContainer}>
                {error ? (
                    <Animatable.View
                        animation="fadeIn"
                        duration={500}
                        style={styles.errorContainer}
                    >
                        <Avatar.Icon size={80} icon="alert-circle-outline" color="#D32F2F" style={styles.errorIcon} />
                        <Text style={styles.errorText}>{error}</Text>
                        <Button mode="contained" onPress={fetchProjectDetails} style={styles.retryButton}>
                            Réessayer
                        </Button>
                    </Animatable.View>
                ) : (
                    <>
                        <Animatable.View
                            animation="fadeInDown"
                            duration={800}
                            style={styles.headerContainer}
                        >
                            <LinearGradient
                                colors={getStatusColor(project.status)}
                                style={styles.headerGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.projectHeaderContent}>
                                    <View style={styles.projectTitleRow}>
                                        <Title style={styles.projectTitle}>{project.name}</Title>
                                        <Chip style={styles.projectStatusChip} textStyle={{ color: 'white' }}>
                                            {project.status}
                                        </Chip>
                                    </View>

                                    <Paragraph style={styles.projectDescription}>{project.description}</Paragraph>

                                    <View style={styles.projectDates}>
                                        <View style={styles.dateItem}>
                                            <Text style={styles.dateLabel}>Début:</Text>
                                            <Text style={styles.dateValue}>
                                                {new Date(project.start_date).toLocaleDateString()}
                                            </Text>
                                        </View>

                                        <View style={styles.dateSeparator} />

                                        <View style={styles.dateItem}>
                                            <Text style={styles.dateLabel}>Fin:</Text>
                                            <Text style={styles.dateValue}>
                                                {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Non définie'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.teamContainer}>
                                        <Text style={styles.teamLabel}>Équipe:</Text>
                                        <View style={styles.teamChip}>
                                            <Avatar.Icon size={18} icon="account-group" color="#1565C0" style={styles.teamIcon} />
                                            <Text style={styles.teamText}>{project.team_name || 'Aucune équipe'}</Text>
                                        </View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animatable.View>

                        <Animatable.View
                            animation="fadeIn"
                            duration={800}
                            delay={300}
                            style={styles.statsContainer}
                        >
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{taskStats.total}</Text>
                                <Text style={styles.statLabel}>Total tâches</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={[styles.statValue, { color: '#E64A19' }]}>{taskStats.aFaire}</Text>
                                <Text style={styles.statLabel}>À faire</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={[styles.statValue, { color: '#1976D2' }]}>{taskStats.enCours}</Text>
                                <Text style={styles.statLabel}>En cours</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Text style={[styles.statValue, { color: '#2E7D32' }]}>{taskStats.termine}</Text>
                                <Text style={styles.statLabel}>Terminées</Text>
                            </View>
                        </Animatable.View>

                        <View style={styles.actionsContainer}>
                            <Button
                                mode="contained"
                                icon="clipboard-check-outline"
                                onPress={() => navigation.navigate('Tasks')}
                                style={styles.actionButton}
                            >
                                Voir toutes mes tâches
                            </Button>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    contentContainer: {
        flex: 1,
    },
    appbar: {
        backgroundColor: '#1565C0',
        elevation: 4,
    },
    appbarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        color: '#757575',
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorIcon: {
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        marginBottom: 16,
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#1565C0',
    },
    headerContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 0 : 10,
        paddingBottom: 20,
    },
    projectHeaderContent: {
        padding: 16,
    },
    projectTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    projectTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: 'bold',
        flex: 1,
    },
    projectStatusChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    projectDescription: {
        color: '#FFFFFF',
        fontSize: 14,
        marginBottom: 16,
        opacity: 0.9,
    },
    projectDates: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
    },
    dateItem: {
        flex: 1,
    },
    dateLabel: {
        color: '#FFFFFF',
        fontSize: 12,
        opacity: 0.8,
        marginBottom: 4,
    },
    dateValue: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    dateSeparator: {
        width: 1,
        height: '80%',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: 15,
    },
    teamContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamLabel: {
        color: '#FFFFFF',
        marginRight: 10,
    },
    teamChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    teamIcon: {
        backgroundColor: 'transparent',
        marginRight: 4,
    },
    teamText: {
        color: '#1565C0',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        margin: 16,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statCard: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#424242',
    },
    statLabel: {
        fontSize: 12,
        color: '#757575',
        marginTop: 4,
    },
    actionsContainer: {
        padding: 16,
        marginTop: 8,
    },
    actionButton: {
        backgroundColor: '#1565C0',
        paddingVertical: 8,
    },
});

export default ProjectDetailsScreen;