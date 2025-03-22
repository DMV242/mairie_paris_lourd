import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ImageBackground, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/authService';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

// URL de l'image d'arrière-plan sécurisée (HTTPS)
const BACKGROUND_IMAGE = 'https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=2070';

const LoginScreen = ({ navigation }) => {
    const [matricule, setMatricule] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!matricule || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await login(matricule, password);




        } catch (error) {
            console.error('Erreur de connexion:', error);
            setError('Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <ImageBackground
                    source={{ uri: BACKGROUND_IMAGE }}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    <View style={styles.overlay} />

                    <Animatable.View
                        style={styles.logoContainer}
                        animation="fadeIn"
                        duration={1500}
                    >
                        <View style={styles.logoWrapper}>
                            <Image
                                source={require('../assets/logo_paris.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>Mairie de Paris</Text>
                        <Text style={styles.subtitle}>Gestion de Projets</Text>
                    </Animatable.View>

                    <Animatable.View
                        style={styles.formContainer}
                        animation="fadeInUpBig"
                        duration={1000}
                    >
                        <Surface style={styles.surface}>
                            <Text style={styles.formTitle}>Connexion</Text>

                            <TextInput
                                label="Matricule"
                                value={matricule}
                                onChangeText={setMatricule}
                                style={styles.input}
                                mode="outlined"
                                outlineColor="#ddd"
                                activeOutlineColor="#1565C0"
                                left={<TextInput.Icon icon="account" color="#757575" />}
                                theme={{ roundness: 8 }}
                            />

                            <TextInput
                                label="Mot de passe"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={styles.input}
                                mode="outlined"
                                outlineColor="#ddd"
                                activeOutlineColor="#1565C0"
                                left={<TextInput.Icon icon="lock" color="#757575" />}
                                theme={{ roundness: 8 }}
                            />

                            {error ? (
                                <Animatable.View animation="shake" duration={1000}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </Animatable.View>
                            ) : null}

                            <Button
                                mode="contained"
                                onPress={handleLogin}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                                theme={{ roundness: 8 }}
                            >
                                Se connecter
                            </Button>
                        </Surface>
                    </Animatable.View>

                    <Animatable.Text
                        style={styles.footer}
                        animation="fadeIn"
                        delay={1500}
                    >
                        © {new Date().getFullYear()} Mairie de Paris
                    </Animatable.Text>
                </ImageBackground>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: height * 0.1,
    },
    logoWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        padding: 5,
    },
    logo: {
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 20,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    subtitle: {
        fontSize: 18,
        color: '#eeeeee',
        marginTop: 8,
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    formContainer: {
        width: width > 500 ? 450 : width * 0.9,
        marginBottom: height * 0.15,
    },
    surface: {
        padding: 24,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    formTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1565C0',
        alignSelf: 'center',
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    button: {
        marginTop: 24,
        backgroundColor: '#1565C0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '500',
    },
    errorText: {
        color: '#D32F2F',
        textAlign: 'center',
        marginTop: 8,
        fontSize: 14,
    },
    footer: {
        color: '#ffffff',
        marginBottom: 20,
        textAlign: 'center',
        width: '100%',
        fontSize: 12,
        opacity: 0.8,
    }
});

export default LoginScreen;