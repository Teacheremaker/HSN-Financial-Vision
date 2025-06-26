
import type { OperationalCost } from '@/types';

export const initialCosts: OperationalCost[] = [
    // --- GEOTER ---
    { id: "C-G01", service: "GEOTER", costItem: "Coût de développement SIG (HT)", category: "À amortir", annualCost: 69500, notes: "Investissement initial", amortizationStartYear: 2025, amortizationDuration: 8 },
    { id: "C-G02", service: "GEOTER", costItem: "Coût maintenance annuelle SIG (TTC)", category: "Fixe", annualCost: 13471, notes: "" },
    { id: "C-G03", service: "GEOTER", costItem: "Coût maintenance outils HSN (TTC)", category: "Fixe", annualCost: 2562.5, notes: "LIZMAP, FME, GTF" },
    { id: "C-G04", service: "GEOTER", costItem: "Charges de personnel (SN)", category: "Fixe", annualCost: 64000, notes: "" },
    { id: "C-G05", service: "GEOTER", costItem: "Amortissement Annuel", category: "Amortissement", annualCost: 8687.50, notes: "Sur coût de dév.", amortizationStartYear: 2025, amortizationDuration: 8 },

    // --- SPANC ---
    { id: "C-S01", service: "SPANC", costItem: "Coût développement Applicatif", category: "À amortir", annualCost: 15700, notes: "Investissement initial", amortizationStartYear: 2025, amortizationDuration: 8 },
    { id: "C-S02", service: "SPANC", costItem: "Coût maintenance annuelle applicatif", category: "Fixe", annualCost: 5280, notes: "" },
    { id: "C-S03", service: "SPANC", costItem: "Coût maintenance outils HSN (LIZMAP, FME, GTF)", category: "Fixe", annualCost: 512.50, notes: "" },
    { id: "C-S04", service: "SPANC", costItem: "Charges de personnel (SN)", category: "Fixe", annualCost: 6400, notes: "" },
    { id: "C-S05", service: "SPANC", costItem: "Amortissement Annuel", category: "Amortissement", annualCost: 1962.50, notes: "Sur coût de dév.", amortizationStartYear: 2025, amortizationDuration: 8 },

    // --- ROUTE ---
    { id: "C-R01", service: "ROUTE", costItem: "Coût de développement (HT)", category: "À amortir", annualCost: 60598, notes: "Investissement initial", amortizationStartYear: 2025, amortizationDuration: 8 },
    { id: "C-R02", service: "ROUTE", costItem: "Coût maintenance annuelle (TTC)", category: "Fixe", annualCost: 5280, notes: "" },
    { id: "C-R03", service: "ROUTE", costItem: "Coût maintenance outils HSN (TTC)", category: "Fixe", annualCost: 512.50, notes: "LIZMAP, FME, GTF" },
    { id: "C-R04", service: "ROUTE", costItem: "Charges de personnel (SN)", category: "Fixe", annualCost: 6400, notes: "" },
    { id: "C-R05", service: "ROUTE", costItem: "Amortissement Annuel", category: "Amortissement", annualCost: 7574.75, notes: "Sur coût de dév.", amortizationStartYear: 2025, amortizationDuration: 8 },

    // --- ADS ---
    { id: "C-A01", service: "ADS", costItem: "Coût de développement (HT)", category: "À amortir", annualCost: 6168, notes: "Investissement initial", amortizationStartYear: 2025, amortizationDuration: 8 },
    { id: "C-A02", service: "ADS", costItem: "Coût maintenance annuelle (TTC)", category: "Fixe", annualCost: 1000, notes: "" },
    { id: "C-A03", service: "ADS", costItem: "Coût maintenance outils HSN (TTC)", category: "Fixe", annualCost: 512.50, notes: "LIZMAP, FME, GTF" },
    { id: "C-A04", service: "ADS", costItem: "Charges de personnel (SN)", category: "Fixe", annualCost: 6400, notes: "" },
    { id: "C-A05", service: "ADS", costItem: "Amortissement Annuel", category: "Amortissement", annualCost: 771, notes: "Sur coût de dév.", amortizationStartYear: 2025, amortizationDuration: 8 },

    // --- Global ---
    { id: "C-Gl01", service: "Global", costItem: "Salaires Direction & Admin", category: "Fixe", annualCost: 80000 * 12, notes: "Personnel non affecté à un service" },
    { id: "C-Gl02", service: "Global", costItem: "Loyer des bureaux", category: "Fixe", annualCost: 25000 * 12, notes: "Siège social" },
    { id: "C-Gl03", service: "Global", costItem: "Licences logicielles partagées", category: "Fixe", annualCost: 3000 * 12, notes: "CRM, ERP, etc." },
    { id: "C-Gl04", service: "Global", costItem: "Services Publics (siège)", category: "Variable", annualCost: 2200 * 12, notes: "Électricité et eau du siège" },
];
