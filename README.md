# Firebase Studio
HSN-Financial-Vision

Aperçu du Projet

HSN-Financial-Vision est une application web de projection financière développée avec Next.js, React et TypeScript, utilisant Firebase pour le backend. Elle permet aux utilisateurs de modéliser différents scénarios financiers en ajustant des paramètres clés tels que les taux d'adoption des services, l'augmentation des tarifs et les taux d'indexation. L'application fournit des indicateurs de performance clés (KPI), des graphiques interactifs et des projections de rentabilité pour aider à la prise de décision stratégique.

Fonctionnalités Principales

•Tableau de bord interactif : Visualisation des KPI, des revenus, des coûts et de la rentabilité.

•Constructeur de scénarios : Ajustement des paramètres pour créer et analyser différents avenirs financiers.

•Projection de rentabilité : Analyse détaillée de la rentabilité future basée sur les scénarios définis.

•Optimisation IA : Outil d'optimisation pour affiner les scénarios.

Technologies Utilisées

•Frontend : Next.js, React, TypeScript, Tailwind CSS

•Backend : Firebase (Firestore, Functions)

•Gestion d'état : Zustand (via des hooks personnalisés)

•Graphiques : Recharts

Installation et Démarrage Local

Pour installer et exécuter HSN-Financial-Vision sur votre machine locale, suivez les étapes ci-dessous :

Prérequis

Assurez-vous d'avoir les éléments suivants installés :

•Node.js (version 18 ou supérieure)

•npm ou Yarn (npm est recommandé)

•Firebase CLI (pour l'émulation locale de Firebase)

Étapes d'Installation

1.Cloner le dépôt :

2.Installer les dépendances :

3.
Configurer Firebase :
HSN-Financial-Vision utilise Firebase pour la persistance des données. Vous devrez configurer un projet Firebase et initialiser les émulateurs locaux.

•
Authentification Firebase CLI :

•Initialiser les émulateurs :



4.Lancer l'application Next.js :
Dans un nouveau terminal, lancez l'application de développement Next.js :

Structure du Projet

Le projet est organisé de la manière suivante :

•src/app/ : Contient les pages de l'application Next.js, y compris la page du tableau de bord (page.tsx).

•src/components/ : Composants React réutilisables, y compris les composants spécifiques au tableau de bord (dashboard/).

•src/hooks/ : Hooks React personnalisés pour la gestion de l'état (par exemple, use-scenario-store.ts, use-entity-store.ts).

•src/lib/ : Fonctions utilitaires et logiques métier (par exemple, projections.ts).

•src/data/ : Fichiers de données statiques ou de simulation.

•functions/ : Fonctions Firebase (Cloud Functions) pour la logique backend.

Contribution

Les contributions sont les bienvenues ! Si vous souhaitez contribuer à ce projet, veuillez suivre ces étapes :

1.Forker le dépôt.

2.Créer une nouvelle branche pour votre fonctionnalité ou correction de bug (git checkout -b feature/ma-nouvelle-fonctionnalite).

3.Effectuer vos modifications et les commiter (git commit -m 'feat: ajouter ma nouvelle fonctionnalité').

4.Pousser votre branche (git push origin feature/ma-nouvelle-fonctionnalite).

5.Ouvrir une Pull Request sur le dépôt original.

Veuillez vous assurer que votre code respecte les conventions de style existantes et que tous les tests passent avant de soumettre une Pull Request.

Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.


This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
