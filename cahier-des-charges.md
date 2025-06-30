
# Cahier des Charges - Application "Vision Financière HSN"

Ce document détaille l'ensemble des fonctionnalités et des spécifications techniques de l'application de simulation financière "Vision Financière HSN".

## 1. Concept Général

L'application est un outil interactif de projection financière et de planification de scénarios. Elle permet aux utilisateurs de modéliser et de visualiser l'impact de divers paramètres (adhésions, tarification, coûts) sur la santé financière globale et par service d'une structure de type syndicat mixte (HSN).

L'objectif est de fournir une vision claire des revenus, des coûts et de la rentabilité sur une période de temps définie, en fonction de différents scénarios d'évolution.

## 2. Structure et Navigation

L'application est une Single Page Application (SPA) construite avec Next.js et React.

-   **Layout Principal** :
    -   Une barre de navigation latérale (Sidebar) persistante et responsive.
    -   Un en-tête (Header) propre à chaque page, affichant le titre et des boutons d'action contextuels.
-   **Pages Principales** :
    1.  **Tableau de bord** : Vue d'ensemble et centre de contrôle des simulations.
    2.  **Entités** : Gestion de la base de données des collectivités et adhérents.
    3.  **Recettes** : Vue détaillée des projections de revenus.
    4.  **Tarifs** : Gestion de la grille tarifaire des services.
    5.  **Coûts opérationnels** : Gestion des charges fixes, variables et des investissements.

## 3. Détail des fonctionnalités par page

### 3.1. Tableau de bord (`/`)

C'est la page centrale de l'application. Elle se compose de plusieurs blocs interactifs.

-   **Cartes d'Indicateurs Clés (KPI)** :
    -   **Revenu total** : Affiche le revenu projeté pour une année sélectionnable, avec une comparaison par rapport à un scénario de base.
    -   **Taux d'adoption global** : Affiche le pourcentage projeté de collectivités adhérentes à la fin de la période. Cet indicateur est **dynamique** et réagit aux ajustements des curseurs de scénario.
    -   **Coût opérationnel** : Affiche les coûts projetés pour une année sélectionnable.

-   **Constructeur de scénarios** :
    -   **Période de projection** : Permet de définir les années de début et de fin de la simulation.
    -   **Taux d'adoption par service** : Des curseurs permettent de simuler un taux d'adhésion de nouvelles entités (actuellement inactives) pour chaque service (GEOTER, SPANC, ROUTE, ADS).
    -   **Paramètres généraux** : Curseurs pour ajuster l'augmentation annuelle des tarifs et le taux d'indexation des coûts.
    -   **Analyse de sensibilité (ROI)** : Une carte affiche le Retour sur Investissement (ROI) projeté, en comparant le scénario actuel au scénario de base.

-   **Graphique "Projections globales"** :
    -   Graphique combiné (barres et lignes) visualisant les revenus et les coûts sur toute la période de projection.
    -   Un filtre permet de basculer entre une vue "Tous les services" et une vue par service individuel.
    -   Une info-bulle interactive détaille les chiffres au survol.

-   **Graphique "Analyse de Rentabilité par Service"** :
    -   **Vue "Synthèse Annuelle"** : Graphique en barres comparant Recettes, Coûts et Résultat pour chaque service sur une année sélectionnable. Les couleurs des barres sont alignées avec celles des services pour une lecture intuitive.
    -   **Vue "Évolution Temporelle"** : Graphique en lignes montrant l'évolution du résultat net de chaque service au fil du temps.
    -   **Export Excel (.xlsx)** : Un bouton permet d'exporter les données de rentabilité détaillées (recettes de base, adoption, coûts spécifiques et mutualisés) pour une analyse approfondie dans Excel.

-   **Optimisation par l'IA** :
    -   Un formulaire permet à l'utilisateur de définir un objectif (KPI), les leviers d'action et les contraintes.
    -   L'application utilise l'IA générative (Genkit) pour proposer des valeurs de paramètres optimisées et une justification, aidant à la prise de décision.

### 3.2. Page Entités (`/entities`)

Page de gestion des collectivités adhérentes ou potentielles.

-   **Tableau de données complet** :
    -   Affiche toutes les entités avec leurs informations : nom, population, type (Fondatrice/Utilisatrice), statut, et services souscrits avec l'année de départ.
    -   Fonctionnalités de tri, de pagination et de filtrage (par nom, service, et année).
-   **Édition en ligne** : Toutes les cellules du tableau sont modifiables directement, permettant une mise à jour rapide des données.
-   **Gestion des services** : Un sélecteur multiple permet d'affecter ou de retirer des services à une entité et de définir l'année de souscription.
-   **Import / Export CSV** :
    -   **Importer** : Permet d'importer une liste d'entités depuis un fichier CSV.
    -   **Exporter** : Permet de télécharger la base de données actuelle au format CSV.
    -   **Exporter la trame** : Fournit un modèle CSV vierge pour faciliter l'import.

### 3.3. Page Recettes (`/revenues`)

Visualisation détaillée des projections de revenus.

-   **Tableau de projection** :
    -   Des onglets permettent de filtrer la vue par service ou de voir le cumul.
    -   Le tableau détaille, année par année, les recettes de base (adhérents existants), les recettes additionnelles (via les curseurs d'adoption) et le total.
-   **Détail par entité** : Un clic sur une ligne du tableau ouvre une fenêtre modale affichant la liste des entités contribuant au revenu de base pour cette année.
-   **Export Excel (.xlsx)** : Un bouton permet d'exporter un tableau détaillé listant chaque entité, chaque service souscrit, l'année de souscription, le tarif de base appliqué et la recette projetée pour chaque année de la simulation.

### 3.4. Page Tarifs (`/tariffs`)

Gestion de la grille tarifaire qui alimente les calculs de revenus.

-   **Tableau éditable** :
    -   Onglets de navigation par service.
    -   Affiche les différentes strates tarifaires avec les critères (population min/max) et les prix associés (prix fondateur, prix utilisateur, remise).
-   **Gestion complète** : Permet d'ajouter, modifier ou supprimer des lignes tarifaires. Les changements sont sauvegardés automatiquement.

### 3.5. Page Coûts opérationnels (`/costs`)

Gestion des charges de fonctionnement.

-   **Tableau éditable** :
    -   Onglets de navigation par service, avec une section "Global" pour les coûts mutualisés.
    -   Permet de définir les coûts fixes, variables, et les investissements à amortir.
-   **Logique d'amortissement** : Les coûts de catégorie "Amortissement" sont calculés automatiquement à partir des investissements ("À amortir") et de leur durée.
-   **Export Excel (.xlsx)** : Permet d'exporter une projection complète des coûts sur toute la période, en tenant compte de l'indexation.

## 4. Spécifications Techniques

-   **Framework Frontend** : Next.js 15 (App Router)
-   **Langage** : TypeScript
-   **Styling** : Tailwind CSS avec des composants de UI de ShadCN
-   **Gestion d'état (State Management)** : Zustand
-   **Graphiques** : Recharts
-   **Intelligence Artificielle** : Genkit (Google AI)
-   **Hébergement** : Firebase App Hosting
