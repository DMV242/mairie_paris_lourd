import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar, Dimensions, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Text, ActivityIndicator, Appbar, Chip, Avatar, IconButton, Searchbar, FAB } from 'react-native-paper';
import { getProjects } from '../services/projectService';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('tous');

    const fetchProjects = async () => {
        try {
            setError('');
            const data = await getProjects();

            // Si l'API renvoie un tableau directement ou un objet avec une propriété results
            const projectsData = Array.isArray(data) ? data : (data.results || []);
            setProjects(projectsData);
            setFilteredProjects(projectsData);
        } catch (error) {
            setError('Impossible de récupérer les projets');
            console.error(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        filterProjects(activeFilter, searchQuery);
    }, [activeFilter, searchQuery, projects]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchProjects();
    };

    const handleProjectPress = (project) => {
        navigation.navigate('ProjectDetails', { project });
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

    const onChangeSearch = (query) => {
        setSearchQuery(query);
    };

    const filterProjects = (filter, query = '') => {
        let filtered = [...projects];

        // Filtrer par statut
        if (filter !== 'tous') {
            filtered = filtered.filter(project =>
                project.status?.toLowerCase() === filter.toLowerCase()
            );
        }

        // Filtrer par recherche
        if (query) {
            filtered = filtered.filter(project =>
                project.name?.toLowerCase().includes(query.toLowerCase()) ||
                project.description?.toLowerCase().includes(query.toLowerCase())
            );
        }

        setFilteredProjects(filtered);
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

    const renderProjectCard = ({ item, index }) => (
        <Animatable.View
            animation="fadeInUp"
            duration={500}
            delay={index * 100}
        >
            <TouchableOpacity
                onPress={() => handleProjectPress(item)}
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
                    </LinearGradient>

                    <Card.Content style={styles.cardContent}>
                        <Title style={styles.cardTitle}>{item.name}</Title>
                        <Paragraph style={styles.cardDescription} numberOfLines={2}>
                            {item.description}
                        </Paragraph>

                        <View style={styles.projectInfo}>
                            <View style={styles.dateRow}>
                                <IconButton icon="calendar-start" size={20} color="#1565C0" />
                                <Text>{new Date(item.start_date).toLocaleDateString()}</Text>
                            </View>

                            <View style={styles.dateRow}>
                                <IconButton icon="calendar-end" size={20} color="#1565C0" />
                                <Text>{item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Non définie'}</Text>
                            </View>
                        </View>

                        <View style={styles.cardFooter}>
                            <Chip
                                style={styles.teamChip}
                                icon="account-group"
                            >
                                {item.team_name || 'Aucune équipe'}
                            </Chip>

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
            <Avatar.Icon size={80} icon="folder-open-outline" color="#9E9E9E" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Aucun projet disponible</Text>
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
                <Appbar.Content title="Projets" titleStyle={styles.appbarTitle} />
                <Appbar.Action color="white" icon="checkbox-marked-circle-outline" size={28} onPress={() => navigation.navigate('Tasks')} />
                <Appbar.Action color="white" icon="account-circle" size={28} onPress={() => navigation.navigate('Profile')} />
            </Appbar.Header>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1565C0" />
                    <Text style={styles.loadingText}>Chargement des projets...</Text>
                </View>
            ) : error ? (
                <Animatable.View
                    style={styles.errorContainer}
                    animation="fadeIn"
                    duration={500}
                >
                    <Avatar.Icon size={80} icon="alert-circle-outline" color="#D32F2F" style={styles.errorIcon} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchProjects} style={styles.retryButton}>
                        <Text style={styles.retryText}>Réessayer</Text>
                    </TouchableOpacity>
                </Animatable.View>
            ) : (
                <View style={styles.contentContainer}>
                    <Searchbar
                        placeholder="Rechercher un projet..."
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
                                Tous
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
                                Terminés
                            </Chip>
                            <Chip
                                mode="flat"
                                selected={activeFilter === 'annulé'}
                                onPress={() => setFilter('annulé')}
                                style={getFilterChipStyle('annulé')}
                                textStyle={getFilterChipTextStyle('annulé')}
                            >
                                Annulés
                            </Chip>
                        </ScrollView>
                    </View>

                    <FlatList
                        data={filteredProjects}
                        renderItem={renderProjectCard}
                        keyExtractor={(item) => item.id?.toString()}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#1565C0']}
                            />
                        }
                        ListEmptyComponent={renderEmptyList}
                    />

                    <FAB
                        style={styles.fab}
                        icon="refresh"
                        onPress={onRefresh}
                        label="Actualiser"
                        color="#FFFFFF"
                    />
                </View>
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
        elevation: 4,
    },
    appbarTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    contentContainer: {
        flex: 1,
    },
    searchbar: {
        margin: 16,
        elevation: 2,
        borderRadius: 8,
    },
    searchInput: {
        fontSize: 16,
    },
    filterContainer: {
        marginBottom: 8,
    },
    filtersScroll: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    filterChip: {
        marginRight: 8,
        height: 36,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#1565C0',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 80,
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
    },
    cardHeader: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    cardHeaderText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    cardContent: {
        paddingTop: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    cardDescription: {
        marginBottom: 12,
        color: '#555555',
    },
    projectInfo: {
        marginTop: 12,
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: -4,
    },
    teamChip: {
        backgroundColor: '#E3F2FD',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    arrowIcon: {
        backgroundColor: '#E3F2FD',
        margin: 0,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorIcon: {
        backgroundColor: '#FFEBEE',
        marginBottom: 16,
    },
    errorText: {
        color: '#D32F2F',
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 16,
    },
    retryButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#1565C0',
        borderRadius: 8,
        elevation: 2,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginTop: 40,
    },
    emptyIcon: {
        backgroundColor: '#F5F5F5',
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 16,
    },
    resetButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
    },
    resetText: {
        color: '#1565C0',
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: '#1565C0',
    },
});

export default HomeScreen;