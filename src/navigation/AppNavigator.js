import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Écrans
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProjectDetailsScreen from '../screens/ProjectDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskDetailsScreen from '../screens/TaskDetailsScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    // Création d'un écouteur d'événements pour les modifications de storage
    const checkToken = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            setUserToken(token);
        } catch (e) {
            console.log('Erreur lors de la récupération du token:', e);
        }
    };

    // Vérifier si l'utilisateur est déjà connecté au lancement de l'application
    useEffect(() => {
        const bootstrapAsync = async () => {
            try {
                await checkToken();
            } catch (e) {
                console.log('Erreur lors de la restauration du token:', e);
            } finally {
                setIsLoading(false);
            }
        };

        bootstrapAsync();

        // Créer un intervalle pour vérifier périodiquement le token
        // Ceci est une solution simple pour détecter les changements de token
        const intervalId = setInterval(checkToken, 1000);

        // Nettoyer l'intervalle à la destruction du composant
        return () => clearInterval(intervalId);
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1565C0" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {userToken == null ? (
                    // Écrans d'authentification
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    // Écrans de l'application
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
                        <Stack.Screen name="Profile" component={ProfileScreen} />
                        <Stack.Screen name="Tasks" component={TasksScreen} />
                        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AppNavigator;