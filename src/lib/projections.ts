
import type { Entity, Tariff } from '@/types';

function matchEntityType(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes("commune")) return "commune";
    if (cat.includes("syndicat")) return "syndicat";
    if (cat.includes("communauté de communes")) return "communauté de communes";
    if (cat.includes("communauté d'agglo")) return "communauté d'agglo";
    if (cat.includes("département")) return "département";
    return "autre";
}

export function getTariffPriceForEntity(entity: Entity, serviceName: string, allTariffs: Tariff[]): number {
    const serviceTariffs = allTariffs.filter(t => t.service === serviceName);
    
    const matchedTariff = serviceTariffs.find(t => {
        const categoryType = matchEntityType(t.category);
        const entityType = entity.entityType?.toLowerCase() ?? 'commune';
        
        if (categoryType !== 'autre' && categoryType !== entityType) {
            return false;
        }

        if (t.populationMin !== undefined && t.populationMax !== undefined) {
             return entity.population >= t.populationMin && entity.population <= t.populationMax;
        }
        
        // For categories without population ranges, like "Département" or "Autre"
        return true;
    });

    if (!matchedTariff) return 0;
    
    let price: number | undefined;

    if (entity.type === 'Fondatrice') {
        // If discountFounder is specified, it should be applied to priceUser.
        // This is the primary logic for founders as per the business rule.
        if (matchedTariff.discountFounder !== undefined && matchedTariff.priceUser !== undefined) {
            price = matchedTariff.priceUser * (1 - matchedTariff.discountFounder / 100);
        } else {
            // Fallback to using priceFounder directly if no discount is specified.
            price = matchedTariff.priceFounder;
        }
    } else { // Utilisatrice
        price = matchedTariff.priceUser;
    }

    return price ?? 0;
}
