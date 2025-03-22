# Application Mobile de Gestion de Projets - Mairie de Paris

Application mobile développée en React Native pour la gestion des projets de la Mairie de Paris.

## Fonctionnalités

- Authentification sécurisée
- Consultation des projets
- Visualisation des détails d'un projet
- Affichage des tâches associées à un projet
- Profil utilisateur

## Technologies utilisées

- React Native (JavaScript)
- Expo
- React Navigation
- React Native Paper (UI)
- Axios (Requêtes API)
- AsyncStorage

## Installation

1. Assurez-vous d'avoir Node.js et npm installés sur votre machine
2. Clonez ce dépôt
3. Installez les dépendances :

```bash
npm install
```

4. Modifiez l'URL de l'API dans `src/services/authService.js` pour qu'elle pointe vers votre serveur backend

## Démarrage

```bash
npm start
```

Cela lancera le serveur de développement Expo. Vous pourrez ensuite:
- Exécuter l'application sur un émulateur Android
- Exécuter l'application sur un appareil physique via l'application Expo Go

## Commandes disponibles

- `npm start` : Démarrer le serveur de développement
- `npm run android` : Lancer l'application sur un émulateur Android
- `npm run ios` : Lancer l'application sur un simulateur iOS (nécessite macOS)
- `npm run web` : Lancer l'application en mode web

## Structure du projet

```
client_lourd/
├── src/
│   ├── assets/        # Images et ressources
│   ├── components/    # Composants réutilisables
│   ├── navigation/    # Configuration de la navigation
│   ├── screens/       # Écrans de l'application
│   └── services/      # Services API et utilitaires
├── App.js             # Point d'entrée de l'application
└── app.json           # Configuration Expo
```

## Connexion à l'API

L'application se connecte à une API Django REST Framework. Assurez-vous que le serveur backend est en cours d'exécution et accessible.

## Notes importantes

- Cette application est conçue pour fonctionner avec le backend Django du projet `client_leger`
- L'application est optimisée pour Android conformément au cahier des charges