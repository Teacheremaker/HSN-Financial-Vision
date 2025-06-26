import type { Entity } from '@/types';

export const initialData: Entity[] = [
    { id: 'ENT-001', nom: 'Ville de Metropolia', population: 50000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'SPANC', year: 2023}]},
    { id: 'ENT-002', nom: 'Ville de Silverlake', population: 25000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2023}] },
    { id: 'ENT-003', nom: 'Village d\'Oakhaven', population: 5000, type: 'Utilisatrice', statut: 'Inactif', services: [] },
    { id: 'ENT-004', nom: 'Arrondissement d\'Ironwood', population: 120000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'SPANC', year: 2022}, {name: 'ROUTE', year: 2024}] },
    { id: 'ENT-005', nom: 'Municipalité de Sunfield', population: 12000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'SPANC', year: 2024}, {name: 'ADS', year: 2025}] },
];
