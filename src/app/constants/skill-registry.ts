import registryData from './skill-registry-data.json';

export interface SkillEntry {
  en: string;
  ptbr: string;
}

export const SKILL_REGISTRY: Record<string, SkillEntry> = registryData;

export type SKILL_AEGIS = keyof typeof SKILL_REGISTRY;

export const aegisByEN = new Map<string, string>();
export const aegisByPTBR = new Map<string, string>();

for (const [aegis, entry] of Object.entries(SKILL_REGISTRY)) {
  aegisByEN.set(entry.en, aegis);
  if (!aegisByPTBR.has(entry.ptbr)) {
    aegisByPTBR.set(entry.ptbr, aegis);
  }
}
