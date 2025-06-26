
import type { Scenarios } from "@/hooks/use-scenario-store";

export type ServiceProjection = {
  year: number;
  service: string;
  optimistic: number;
  conservative: number;
  extension: number;
};

export const serviceProjectionData: ServiceProjection[] = [
    // 2024
    { year: 2024, service: 'GEOTER', optimistic: 80, conservative: 40, extension: 60 },
    { year: 2024, service: 'SPANC', optimistic: 50, conservative: 20, extension: 30 },
    { year: 2024, service: 'ROUTE', optimistic: 36, conservative: 10, extension: 20 },
    { year: 2024, service: 'ADS', optimistic: 20, conservative: 10, extension: 10 },
    // 2025
    { year: 2025, service: 'GEOTER', optimistic: 120, conservative: 100, extension: 110 },
    { year: 2025, service: 'SPANC', optimistic: 85, conservative: 50, extension: 70 },
    { year: 2025, service: 'ROUTE', optimistic: 60, conservative: 30, extension: 40 },
    { year: 2025, service: 'ADS', optimistic: 40, conservative: 20, extension: 30 },
    // 2026
    { year: 2026, service: 'GEOTER', optimistic: 100, conservative: 60, extension: 80 },
    { year: 2026, service: 'SPANC', optimistic: 70, conservative: 30, extension: 50 },
    { year: 2026, service: 'ROUTE', optimistic: 47, conservative: 20, extension: 30 },
    { year: 2026, service: 'ADS', optimistic: 20, conservative: 10, extension: 20 },
    // 2027
    { year: 2027, service: 'GEOTER', optimistic: 30, conservative: 90, extension: 50 },
    { year: 2027, service: 'SPANC', optimistic: 20, conservative: 50, extension: 30 },
    { year: 2027, service: 'ROUTE', optimistic: 13, conservative: 30, extension: 20 },
    { year: 2027, service: 'ADS', optimistic: 10, conservative: 20, extension: 10 },
    // 2028
    { year: 2028, service: 'GEOTER', optimistic: 90, conservative: 60, extension: 70 },
    { year: 2028, service: 'SPANC', optimistic: 60, conservative: 40, extension: 50 },
    { year: 2028, service: 'ROUTE', optimistic: 39, conservative: 20, extension: 25 },
    { year: 2028, service: 'ADS', optimistic: 20, conservative: 10, extension: 15 },
    // 2029
    { year: 2029, service: 'GEOTER', optimistic: 94, conservative: 70, extension: 80 },
    { year: 2029, service: 'SPANC', optimistic: 60, conservative: 40, extension: 50 },
    { year: 2029, service: 'ROUTE', optimistic: 40, conservative: 20, extension: 30 },
    { year: 2029, service: 'ADS', optimistic: 20, conservative: 10, extension: 20 },
    // 2030
    { year: 2030, service: 'GEOTER', optimistic: 90, conservative: 75, extension: 85 },
    { year: 2030, service: 'SPANC', optimistic: 65, conservative: 45, extension: 55 },
    { year: 2030, service: 'ROUTE', optimistic: 42, conservative: 22, extension: 32 },
    { year: 2030, service: 'ADS', optimistic: 25, conservative: 15, extension: 20 },
    // 2031
    { year: 2031, service: 'GEOTER', optimistic: 92, conservative: 78, extension: 88 },
    { year: 2031, service: 'SPANC', optimistic: 68, conservative: 48, extension: 58 },
    { year: 2031, service: 'ROUTE', optimistic: 45, conservative: 25, extension: 35 },
    { year: 2031, service: 'ADS', optimistic: 28, conservative: 18, extension: 23 },
    // 2032
    { year: 2032, service: 'GEOTER', optimistic: 95, conservative: 80, extension: 90 },
    { year: 2032, service: 'SPANC', optimistic: 70, conservative: 50, extension: 60 },
    { year: 2032, service: 'ROUTE', optimistic: 48, conservative: 28, extension: 38 },
    { year: 2032, service: 'ADS', optimistic: 30, conservative: 20, extension: 25 },
    // 2033
    { year: 2033, service: 'GEOTER', optimistic: 98, conservative: 82, extension: 92 },
    { year: 2033, service: 'SPANC', optimistic: 72, conservative: 52, extension: 62 },
    { year: 2033, service: 'ROUTE', optimistic: 50, conservative: 30, extension: 40 },
    { year: 2033, service: 'ADS', optimistic: 32, conservative: 22, extension: 27 },
];
