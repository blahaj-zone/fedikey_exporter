import { SoftwareVariant, MetaResponse } from './types';

interface SoftwareInfo {
    name: SoftwareVariant;
    version: string;
}

/**
 * Detect the software variant based on the meta response
 * @param meta Meta response from the API
 * @returns The detected software variant
 */
export function detectSoftwareFromMeta(meta: MetaResponse): SoftwareVariant {
    const name = meta.name?.toLowerCase() || '';
    const repo = meta.repositoryUrl?.toLowerCase() || '';

    if (repo.includes('sharkey') || name.includes('sharkey')) {
        return SoftwareVariant.SHARKEY;
    }
    if (repo.includes('calckey') || name.includes('calckey')) {
        return SoftwareVariant.CALCKEY;
    }
    if (repo.includes('firefish') || name.includes('firefish')) {
        return SoftwareVariant.FIREFISH;
    }
    return SoftwareVariant.MISSKEY;
}

export function getSoftwareInfo(meta: MetaResponse): SoftwareInfo {
    const softwareVariant = detectSoftwareFromMeta(meta);
    const version = meta.version || 'unknown';
    
    return { name: softwareVariant, version };
}
