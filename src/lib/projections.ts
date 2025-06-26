
import type { Entity, Tariff } from '@/types';

function matchEntityType(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes("communauté d'agglo")) return "communauté d'agglo";
    if (cat.includes("communauté de communes")) return "communauté de communes";
    if (cat.includes("syndicat")) return "syndicat";
    if (cat.includes("département")) return "département";
    if (cat.includes("commune")) return "commune";
    return "autre";
}

export function getTariffPriceForEntity(entity: Entity, serviceName: string, allTariffs: Tariff[]): number {
    const serviceTariffs = allTariffs.filter(t => t.service === serviceName);
    const entityTypeLower = entity.entityType?.toLowerCase() ?? 'commune';

    const populationMatches = (tariff: Tariff) => {
        // A tariff without population criteria matches any population
        if (tariff.populationMin === undefined && tariff.populationMax === undefined) {
            return true;
        }
        return entity.population >= (tariff.populationMin ?? -Infinity) && entity.population <= (tariff.populationMax ?? Infinity);
    };

    const findLogic = (typeToMatch: string) => {
        return serviceTariffs.find(t => {
            const categoryType = matchEntityType(t.category);
            return categoryType === typeToMatch && populationMatches(t);
        });
    };

    // Pass 1: Try to find a direct match on the entity's specific type.
    let matchedTariff = findLogic(entityTypeLower);

    // Pass 2: If no direct match was found, fall back to the 'Autre' category.
    // This is for entities that don't fit standard categories but might have a price.
    if (!matchedTariff) {
        matchedTariff = findLogic('autre');
    }

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
