
import type { Entity, MultiSelectOption } from '@/types';

export const initialEntities: Entity[] = [
    { id: 'ENT-001', nom: 'Ville de Metropolia', entityType: 'Commune', population: 50000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'SPANC', year: 2023}]},
    { id: 'ENT-002', nom: 'Ville de Silverlake', entityType: 'Commune', population: 25000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2023}] },
    { id: 'ENT-003', nom: 'Village d\'Oakhaven', entityType: 'Commune', population: 5000, type: 'Utilisatrice', statut: 'Inactif', services: [] },
    { id: 'ENT-004', nom: 'Arrondissement d\'Ironwood', entityType: 'Communauté de communes', population: 120000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'SPANC', year: 2022}, {name: 'ROUTE', year: 2024}] },
    { id: 'ENT-005', nom: 'Municipalité de Sunfield', entityType: 'Commune', population: 12000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'SPANC', year: 2024}, {name: 'ADS', year: 2025}] },
    { id: 'ENT-006', nom: 'Ville de Redwood', entityType: 'Commune', population: 35000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2024}]},
    { id: 'ENT-007', nom: 'Bourg de Greenfield', entityType: 'Commune', population: 8000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'ROUTE', year: 2025}]},
    { id: 'ENT-008', nom: 'Ville de Starfall', entityType: 'Commune', population: 62000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'ADS', year: 2023}]},
    { id: 'ENT-009', nom: 'Hameau de Whisperwind', entityType: 'Commune', population: 1200, type: 'Utilisatrice', statut: 'Inactif', services: []},
    { id: 'ENT-010', nom: 'Cité de Crystalcreek', entityType: 'Communauté d\'agglo', population: 95000, type: 'Fondatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2022}, {name: 'SPANC', year: 2023}, {name: 'ROUTE', year: 2024}, {name: 'ADS', year: 2025}]},
    { id: 'ENT-011', nom: 'Comté de Stonefield', entityType: 'Communauté de communes', population: 15000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'SPANC', year: 2024}]},
    { id: 'ENT-012', nom: 'Ville de Moonshadow', entityType: 'Commune', population: 22000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2023}, {name: 'ADS', year: 2024}]},
    { id: 'ENT-013', nom: 'Village de Riverbend', entityType: 'Commune', population: 3000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'ROUTE', year: 2024}]},
    { id: 'ENT-014', nom: 'Ville de Emberfall', entityType: 'Commune', population: 48000, type: 'Utilisatrice', statut: 'Actif', services: [{name: 'GEOTER', year: 2024}]},
    { id: 'ENT-015', nom: 'Paroisse de Summerisle', entityType: 'Commune', population: 18000, type: 'Utilisatrice', statut: 'Inactif', services: []},
];

export const SERVICE_OPTIONS: MultiSelectOption[] = [
  { value: "GEOTER", label: "GEOTER" },
  { value: "SPANC", label: "SPANC" },
  { value: "ROUTE", label: "ROUTE" },
  { value: "ADS", label: "ADS" },
];
