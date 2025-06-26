
// This file is no longer used for projections, which are now calculated dynamically.
// It is kept for archival purposes but can be safely deleted.

import type { Scenarios } from "@/hooks/use-scenario-store";

export type ServiceProjection = {
  year: number;
  service: string;
  optimistic: number;
  conservative: number;
  extension: number;
};

export const serviceProjectionData: ServiceProjection[] = [];
