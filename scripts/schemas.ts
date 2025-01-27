import { z } from 'zod';
import {
    SoftwareVariant,
    MetaResponse,
    ServerStats,
    ServerInfo,
    QueueStats,
    FederatedInstance,
    FirefishQueueStats,
    TableStats,
    DatabaseStats
} from '../src/types';

export const softwareVariantSchema = z.nativeEnum(SoftwareVariant);

export const policiesSchema = z.object({
    gtlAvailable: z.boolean().optional(),
    ltlAvailable: z.boolean().optional(),
    canPublicNote: z.boolean().optional(),
    canInvite: z.boolean().optional(),
    canManageCustomEmojis: z.boolean().optional(),
    canSearchNotes: z.boolean().optional(),
    driveCapacityMb: z.number().optional(),
});

export const metaResponseSchema = z.object({
    maintainerName: z.string().nullable(),
    maintainerEmail: z.string().nullable(),
    version: z.string(),
    name: z.string(),
    uri: z.string().url(),
    description: z.string(),
    langs: z.array(z.string()),
    tosUrl: z.string().url().nullable(),
    repositoryUrl: z.string().url().nullable(),
    feedbackUrl: z.string().url().nullable(),
    impressumUrl: z.string().url().nullable(),
    privacyPolicyUrl: z.string().url().nullable(),
    disableRegistration: z.boolean(),
    emailRequiredForSignup: z.boolean(),
    enableHcaptcha: z.boolean(),
    enableRecaptcha: z.boolean(),
    enableTurnstile: z.boolean(),
    enableMcaptcha: z.boolean(),
    themeColor: z.string(),
    mascotImageUrl: z.string().nullable(),
    bannerUrl: z.string().url().nullable(),
    serverErrorImageUrl: z.string().url().nullable(),
    infoImageUrl: z.string().url().nullable(),
    notFoundImageUrl: z.string().url().nullable(),
    iconUrl: z.string().url(),
    backgroundImageUrl: z.string().url().nullable(),
    logoImageUrl: z.string().url().nullable(),
    maxNoteTextLength: z.number(),
    defaultLightTheme: z.string().nullable(),
    defaultDarkTheme: z.string().nullable(),
    policies: policiesSchema.optional(),
});

export const processStatsSchema = z.object({
    heapUsed: z.number().nonnegative(),
    heapTotal: z.number().nonnegative(),
    rss: z.number().nonnegative(),
    external: z.number().nonnegative()
});

export const diskStatsSchema = z.object({
    used: z.number().nonnegative(),
    total: z.number().nonnegative()
});

export const serverStatsSchema = z.object({
    notesCount: z.number().nonnegative(),
    originalNotesCount: z.number().nonnegative(),
    usersCount: z.number().nonnegative(),
    originalUsersCount: z.number().nonnegative(),
    reactionsCount: z.number().nonnegative(),
    instances: z.number().nonnegative(),
    driveUsageLocal: z.number().nonnegative(),
    driveUsageRemote: z.number().nonnegative()
});

export const serverInfoSchema = z.object({
    machine: z.string(),
    os: z.string(),
    node: z.string(),
    psql: z.string(),
    redis: z.string(),
    cpu: z.object({
        model: z.string(),
        cores: z.number()
    }),
    mem: z.object({
        total: z.number()
    }),
    fs: z.object({
        total: z.number(),
        used: z.number()
    })
});

export const instanceStatsSchema = z.object({
    notesCount: z.number().nonnegative(),
    usersCount: z.number().nonnegative(),
    originalNotesCount: z.number().nonnegative(),
    originalUsersCount: z.number().nonnegative(),
    driveUsageLocal: z.number().nonnegative(),
    driveUsageRemote: z.number().nonnegative(),
    localFiles: z.number().nonnegative(),
    remoteFiles: z.number().nonnegative(),
    instances: z.number().nonnegative(),
    uptime: z.number().nonnegative()
});

export const queueStatsSchema = z.object({
    waiting: z.number().optional(),
    active: z.number().optional(),
    delayed: z.number().optional(),
    completed: z.number().optional(),
    failed: z.number().optional(),
    paused: z.number().optional()
});

export const firefishQueueStatsSchema = z.object({
    deliver: queueStatsSchema,
    inbox: queueStatsSchema,
    db: queueStatsSchema,
    objectStorage: queueStatsSchema,
    backgroundQueue: queueStatsSchema.optional()
});

export const federatedInstanceSchema = z.object({
    id: z.string(),
    firstRetrievedAt: z.string().datetime(),
    host: z.string(),
    usersCount: z.number().optional(),
    notesCount: z.number().optional(),
    followingCount: z.number().optional(),
    followersCount: z.number().optional(),
    isNotResponding: z.boolean(),
    isSuspended: z.boolean(),
    suspensionState: z.string(),
    isBlocked: z.boolean(),
    softwareName: z.string().nullable(),
    softwareVersion: z.string().nullable(),
    openRegistrations: z.boolean().nullable(),
    name: z.string().nullable(),
    description: z.string().nullable(),
    maintainerName: z.string().nullable(),
    maintainerEmail: z.string().nullable(),
    isSilenced: z.boolean(),
    isMediaSilenced: z.boolean(),
    iconUrl: z.string().nullable(),
    faviconUrl: z.string().nullable(),
    themeColor: z.string().nullable(),
    infoUpdatedAt: z.string().nullable(),
    latestRequestReceivedAt: z.string().nullable(),
    isNSFW: z.boolean(),
    rejectReports: z.boolean(),
    moderationNote: z.string().nullable()
});

export const federatedInstancesSchema = z.array(federatedInstanceSchema);

export const apiResponseSchema = <T extends z.ZodType>(schema: T) => z.object({
    success: z.boolean(),
    data: schema
});

export const tableStatsSchema = z.record(z.object({
    count: z.number(),
    size: z.number(),
    rows: z.number().optional(),
    sizeWithIndices: z.number().optional()
}));

export const indexStatsSchema = z.array(z.object({
    tablename: z.string(),
    indexname: z.string()
}));

export const databaseStatsSchema = z.object({
    databaseSize: z.number(),
    tables: tableStatsSchema,
    indexes: indexStatsSchema,
    activeConnections: z.number().optional(),
    transactionsPerSecond: z.number().optional(),
    cacheHitRatio: z.number().optional(),
    deadlocks: z.number().optional(),
    conflictingQueries: z.number().optional()
});
