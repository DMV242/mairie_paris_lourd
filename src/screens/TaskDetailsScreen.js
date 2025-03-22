import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, Platform } from 'react-native';
import { Surface, Text, Title, Paragraph, Divider, ActivityIndicator, Appbar, Chip, Avatar, IconButton, Button } from 'react-native-paper';
import { getTask } from '../services/taskService';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const TaskDetailsScreen = ({ route, navigation }) => {
    const { task: initialTask } = route.params;
    const [task, setTask] = useState(initialTask);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchTaskDetails = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await getTask(initialTask.id);
            setTask(data);
        } catch (error) {
            setError('Impossible de récupérer les détails de la tâche');
            console.error('Erreur lors de la récupération des détails de la tâche:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaskDetails();
    }, []);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'en cours':
                return ['#1976D2', '#42A5F5']; // Bleu
            case 'terminé':
                return ['#2E7D32', '#66BB6A']; // Vert
            case 'à faire':
                return ['#E64A19', '#FF7043']; // Orange
            case 'annulé':
                return ['#C62828', '#EF5350']; // Rouge
            default:
                return ['#757575', '#9E9E9E']; // Gris
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'haute':
                return '#D32F2F';
            case 'moyenne':
                return '#FF9800';
            case 'basse':
                return '#4CAF50';
            default:
                return '#9E9E9E';
        }
    };

    const formatDateFromString = (dateStr) => {
        if (!dateStr) return 'Non définie';
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1565C0" />
                <Text style={styles.loadingText}>Chargement des détails...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1565C0" barStyle="light-content" />

            <Appbar.Header style={styles.appbar}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Détails de la tâche" titleStyle={styles.appbarTitle} />
                <Appbar.Action icon="refresh" onPress={fetchTaskDetails} />
            </Appbar.Header>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {error ? (
                    <Animatable.View
                        style={styles.errorContainer}
                        animation="fadeIn"
                        duration={500}
                    >
                        <Avatar.Icon size={80} icon="alert-circle-outline" color="#D32F2F" style={styles.errorIcon} />
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={fetchTaskDetails} style={styles.retryButton}>
                            <Text style={styles.retryText}>Réessayer</Text>
                        </TouchableOpacity>
                    </Animatable.View>
                ) : (
                    <>
                        <Animatable.View
                            animation="fadeInDown"
                            duration={800}
                            style={styles.headerContainer}
                        >
                            <LinearGradient
                                colors={getStatusColor(task.status)}
                                style={styles.headerGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <View style={styles.taskHeaderContent}>
                                    <View style={styles.taskTitleRow}>
                                        <Title style={styles.taskTitle}>{task.title}</Title>
                                        <Chip
                                            style={[styles.statusChip, { backgroundColor: 'rgba(0, 0, 0, 0.2)' }]}
                                            textStyle={{ color: 'white' }}
                                        >
                                            {task.status}
                                        </Chip>
                                    </View>

                                    <View style={styles.priorityRow}>
                                        <Text style={styles.priorityLabel}>Priorité:</Text>
                                        <Chip
                                            style={[styles.priorityChip, { backgroundColor: getPriorityColor(task.priority) }]}
                                            textStyle={{ color: 'white' }}
                                        >
                                            {task.priority}
                                        </Chip>
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animatable.View>

                        <Animatable.View
                            animation="fadeInUp"
                            duration={800}
                            delay={200}
                        >
                            <Surface style={styles.detailsCard}>
                                <View style={styles.sectionHeader}>
                                    <IconButton icon="text-box-outline" size={24} color="#1565C0" style={styles.sectionIcon} />
                                    <Text style={styles.sectionTitle}>Description</Text>
                                </View>
                                <Divider style={styles.divider} />
                                <Paragraph style={styles.descriptionText}>
                                    {task.description || "Aucune description fournie."}
                                </Paragraph>
                            </Surface>

                            <Surface style={styles.detailsCard}>
                                <View style={styles.sectionHeader}>
                                    <IconButton icon="information-outline" size={24} color="#1565C0" style={styles.sectionIcon} />
                                    <Text style={styles.sectionTitle}>Informations</Text>
                                </View>
                                <Divider style={styles.divider} />

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Projet:</Text>
                                    <TouchableOpacity
                                        onPress={() => task.project_id && navigation.navigate('ProjectDetails', { project: { id: task.project_id, name: task.project_name } })}
                                        disabled={!task.project_id}
                                    >
                                        <Chip
                                            icon="clipboard-list-outline"
                                            style={styles.infoChip}
                                            disabled={!task.project_id}
                                        >
                                            {task.project.name || "Non assigné"}
                                        </Chip>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Assignée à:</Text>
                                    <Chip icon="account" style={styles.infoChip}>
                                        {task.assigned_to.username || "Non assignée"}
                                    </Chip>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Date de création:</Text>
                                    <Chip icon="calendar-plus" style={styles.infoChip}>
                                        {formatDateFromString(task.created_at)}
                                    </Chip>
                                </View>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Date limite:</Text>
                                    <Chip
                                        icon="calendar-clock"
                                        style={[
                                            styles.infoChip,
                                            task.due_date && new Date(task.due_date) < new Date() && task.status !== 'terminé'
                                                ? styles.overdueChip
                                                : {}
                                        ]}
                                    >
                                        {formatDateFromString(task.due_date)}
                                    </Chip>
                                </View>

                                {task.completed_at && (
                                    <View style={styles.infoRow}>
                                        <Text style={styles.infoLabel}>Terminée le:</Text>
                                        <Chip icon="calendar-check" style={styles.infoChip}>
                                            {formatDateFromString(task.completed_at)}
                                        </Chip>
                                    </View>
                                )}
                            </Surface>

                            {task.notes && (
                                <Surface style={styles.detailsCard}>
                                    <View style={styles.sectionHeader}>
                                        <IconButton icon="note-text-outline" size={24} color="#1565C0" style={styles.sectionIcon} />
                                        <Text style={styles.sectionTitle}>Notes</Text>
                                    </View>
                                    <Divider style={styles.divider} />
                                    <Paragraph style={styles.notesText}>
                                        {task.notes}
                                    </Paragraph>
                                </Surface>
                            )}


                        </Animatable.View>
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    appbar: {
        backgroundColor: '#1565C0',
        elevation: 4,
    },
    appbarTitle: {
        fontWeight: 'bold',
        fontSize: 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
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
        minHeight: height * 0.5,
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
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    headerContainer: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 4,
    },
    headerGradient: {
        padding: 16,
    },
    taskHeaderContent: {
        padding: 8,
    },
    taskTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    taskTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    statusChip: {
        marginLeft: 8,
    },
    priorityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityLabel: {
        color: 'white',
        fontSize: 16,
        marginRight: 8,
    },
    priorityChip: {
        height: 28,
    },
    detailsCard: {
        borderRadius: 8,
        marginBottom: 16,
        padding: 16,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionIcon: {
        margin: 0,
        marginRight: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#424242',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 12,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#424242',
    },
    notesText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#616161',
        fontStyle: 'italic',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoLabel: {
        fontSize: 16,
        color: '#616161',
        fontWeight: '500',
        flex: 1,
    },
    infoChip: {
        backgroundColor: '#E0E0E0',
    },
    overdueChip: {
        backgroundColor: '#FFCDD2',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        marginBottom: 8,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 4,
        elevation: 2,
    },
});

export default TaskDetailsScreen;