import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Dimensions, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator, Appbar, Chip, Avatar, IconButton, Searchbar } from 'react-native-paper';
import { getUserTasks } from '../services/taskService';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const TasksScreen = ({ navigation }) => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userData');
                if (userData) {
                    const user = JSON.parse(userData);
                    setUserId(user.id);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des données utilisateur:', error);
            }
        };

        getUserData();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchTasks();
        }
    }, [userId]);

    const fetchTasks = async () => {
        try {
            setError('');
            const data = await getUserTasks(userId);
            const tasksData = Array.isArray(data) ? data : (data.results || []);
            setTasks(tasksData);
            setFilteredTasks(tasksData);
        } catch (error) {
            setError('Impossible de récupérer les tâches');
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        filterTasks(activeFilter, searchQuery);
    }, [activeFilter, searchQuery, tasks]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleTaskPress = (task) => {
        navigation.navigate('TaskDetails', { task });
    };

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

    const onChangeSearch = (query) => {
        setSearchQuery(query);
    };

    const filterTasks = (filter, query = '') => {
        let filtered = [...tasks];

        // Filtrer par statut
        if (filter !== 'tous') {
            filtered = filtered.filter(task =>
                task.status?.toLowerCase() === filter.toLowerCase()
            );
        }

        // Filtrer par recherche
        if (query) {
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(query.toLowerCase()) ||
                task.description?.toLowerCase().includes(query.toLowerCase())
            );
        }

        setFilteredTasks(filtered);
    };

    const setFilter = (filter) => {
        setActiveFilter(filter);
    };

    const getFilterChipStyle = (filter) => ({
        ...styles.filterChip,
        backgroundColor: activeFilter === filter ? '#1565C0' : '#EEEEEE',
    });

    const getFilterChipTextStyle = (filter) => ({
        color: activeFilter === filter ? '#FFFFFF' : '#757575',
    });

    const renderTaskCard = ({ item, index }) => (
        <Animatable.View
            animation="fadeInUp"
            duration={500}
            delay={index * 100}
        >
            <TouchableOpacity
                onPress={() => handleTaskPress(item)}
                activeOpacity={0.85}
            >
                <Card style={styles.card}>
                    <LinearGradient
                        colors={getStatusColor(item.status)}
                        style={styles.cardHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <Text style={styles.cardHeaderText}>{item.status}</Text>
                        <Chip
                            style={styles.priorityChip}
                            textStyle={{ color: 'white', fontSize: 10 }}
                            mode="flat"
                        >
                            {item.priority}
                        </Chip>
                    </LinearGradient>

                    <Card.Content style={styles.cardContent}>
                        <Title style={styles.cardTitle}>{item.title}</Title>
                        <Paragraph style={styles.cardDescription} numberOfLines={2}>
                            {item.description}
                        </Paragraph>

                        <View style={styles.taskInfo}>
                            <View style={styles.infoRow}>
                                <IconButton icon="account" size={16} color="#1565C0" style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    {item.assigned_to_name || 'Non assignée'}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <IconButton icon="calendar" size={16} color="#1565C0" style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    {item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Pas de date limite'}
                                </Text>
                            </View>

                            <View style={styles.infoRow}>
                                <IconButton icon="clipboard-list-outline" size={16} color="#1565C0" style={styles.infoIcon} />
                                <Text style={styles.infoText}>
                                    {item.project_name || 'Sans projet'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <IconButton
                                icon="arrow-right"
                                size={20}
                                color="#1565C0"
                                style={styles.arrowIcon}
                            />
                        </View>
                    </Card.Content>
                </Card>
            </TouchableOpacity>
        </Animatable.View>
    );

    const renderEmptyList = () => (
        <Animatable.View
            style={styles.emptyContainer}
            animation="fadeIn"
            duration={1000}
        >
            <Avatar.Icon size={80} icon="checkbox-marked-circle-outline" color="#9E9E9E" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Aucune tâche disponible</Text>
            {searchQuery || activeFilter !== 'tous' ? (
                <TouchableOpacity
                    onPress={() => {
                        setSearchQuery('');
                        setActiveFilter('tous');
                    }}
                    style={styles.resetButton}
                >
                    <Text style={styles.resetText}>Réinitialiser les filtres</Text>
                </TouchableOpacity>
            ) : null}
        </Animatable.View>
    );

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#1565C0" barStyle="light-content" />

            <Appbar.Header style={styles.appbar}>
                <Appbar.Content title="Mes Tâches" titleStyle={styles.appbarTitle} />
                <Appbar.Action color="white" icon="account-circle" size={28} onPress={() => navigation.navigate('Profile')} />
            </Appbar.Header>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1565C0" />
                    <Text style={styles.loadingText}>Chargement des tâches...</Text>
                </View>
            ) : error ? (
                <Animatable.View
                    style={styles.errorContainer}
                    animation="fadeIn"
                    duration={500}
                >
                    <Avatar.Icon size={80} icon="alert-circle-outline" color="#D32F2F" style={styles.errorIcon} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchTasks} style={styles.retryButton}>
                        <Text style={styles.retryText}>Réessayer</Text>
                    </TouchableOpacity>
                </Animatable.View>
            ) : (
                <View style={styles.contentContainer}>
                    <Searchbar
                        placeholder="Rechercher une tâche..."
                        onChangeText={onChangeSearch}
                        value={searchQuery}
                        style={styles.searchbar}
                        inputStyle={styles.searchInput}
                        iconColor="#1565C0"
                    />

                    <View style={styles.filterContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.filtersScroll}
                        >
                            <Chip
                                mode="flat"
                                selected={activeFilter === 'tous'}
                                onPress={() => setFilter('tous')}
                                style={getFilterChipStyle('tous')}
                                textStyle={getFilterChipTextStyle('tous')}
                            >
                                Toutes
                            </Chip>
                            <Chip
                                mode="flat"
                                selected={activeFilter === 'à faire'}
                                onPress={() => setFilter('à faire')}
                                style={getFilterChipStyle('à faire')}
                                textStyle={getFilterChipTextStyle('à faire')}
                            >
                                À faire
                            </Chip>
                            <Chip
                                mode="flat"
                                selected={activeFilter === 'en cours'}
                                onPress={() => setFilter('en cours')}
                                style={getFilterChipStyle('en cours')}
                                textStyle={getFilterChipTextStyle('en cours')}
                            >
                                En cours
                            </Chip>
                            <Chip
                                mode="flat"
                                selected={activeFilter === 'terminé'}
                                onPress={() => setFilter('terminé')}
                                style={getFilterChipStyle('terminé')}
                                textStyle={getFilterChipTextStyle('terminé')}
                            >
                                Terminées
                            </Chip>
                        </ScrollView>
                    </View>

                    <FlatList
                        data={filteredTasks}
                        renderItem={renderTaskCard}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmptyList}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#1565C0']}
                                tintColor="#1565C0"
                            />
                        }
                    />
                </View>
            )}
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
        color: 'white',
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    searchbar: {
        marginBottom: 16,
        elevation: 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
    },
    searchInput: {
        fontSize: 14,
    },
    filterContainer: {
        marginBottom: 16,
    },
    filtersScroll: {
        paddingRight: 8,
    },
    filterChip: {
        marginRight: 8,
        paddingHorizontal: 4,
    },
    listContainer: {
        paddingBottom: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
    },
    cardHeader: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardHeaderText: {
        color: '#FFFFFF',
        fontWeight: 'bold',

    },
    priorityChip: {
        height: 30,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',

    },
    cardContent: {
        paddingTop: 12,
    },
    cardTitle: {
        fontSize: 18,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 14,
        color: '#757575',
        marginBottom: 12,
    },
    taskInfo: {
        marginTop: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 2,
    },
    infoIcon: {
        margin: 0,
        marginRight: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#424242',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    arrowIcon: {
        margin: 0,
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
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    emptyIcon: {
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        marginBottom: 16,
    },
    emptyText: {
        color: '#757575',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
    },
    resetButton: {
        backgroundColor: '#1565C0',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
    },
    resetText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

export default TasksScreen;