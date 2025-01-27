export enum SoftwareVariant {
    MISSKEY = 'misskey',
    CALCKEY = 'calckey',
    FIREFISH = 'firefish',
    SHARKEY = 'sharkey',
    FOUNDKEY = 'foundkey',
    UNKNOWN = 'unknown'
}

export interface Policies {
    gtlAvailable?: boolean;
    ltlAvailable?: boolean;
    canPublicNote?: boolean;
    canInvite?: boolean;
    canManageCustomEmojis?: boolean;
    canSearchNotes?: boolean;
    driveCapacityMb?: number;
}

export interface MetaResponse {
    maintainerName?: string | null;
    maintainerEmail?: string | null;
    version: string;
    name?: string;
    uri?: string;
    description?: string;
    langs?: string[];
    tosUrl?: string | null;
    repositoryUrl?: string | null;
    feedbackUrl?: string | null;
    impressumUrl?: string | null;
    privacyPolicyUrl?: string | null;
    disableRegistration?: boolean;
    emailRequiredForSignup?: boolean;
    enableHcaptcha?: boolean;
    enableRecaptcha?: boolean;
    enableTurnstile?: boolean;
    enableMcaptcha?: boolean;
    themeColor?: string;
    mascotImageUrl?: string | null;
    bannerUrl?: string | null;
    serverErrorImageUrl?: string | null;
    infoImageUrl?: string | null;
    notFoundImageUrl?: string | null;
    iconUrl?: string;
    backgroundImageUrl?: string | null;
    logoImageUrl?: string | null;
    maxNoteTextLength?: number;
    defaultLightTheme?: string | null;
    defaultDarkTheme?: string | null;
    policies?: Policies;
    process?: {
        heapUsed: number;
        heapTotal: number;
        rss: number;
        external: number;
        cpuUsage: number;
    };
}

export interface ProcessStats {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
    cpuUsage?: number;
}

export interface DiskStats {
    total: number;
    used: number;
    available: number;
}

export interface ServerStats {
    notesCount: number;
    originalNotesCount: number;
    usersCount: number;
    originalUsersCount: number;
    reactionsCount: number;
    instances: number;
    driveUsageLocal: number;
    driveUsageRemote: number;
}

export interface ServerInfo {
    machine: string;
    os: string;
    node: string;
    psql: string;
    redis: string;
    cpu: {
        model: string;
        cores: number;
    };
    mem: {
        total: number;
        used: number;
        free: number;
    };
    fs: {
        total: number;
        used: number;
        totalFiles?: number;
    };
    net?: {
        rx: number;
        tx: number;
    };
}

export interface InstanceStats {
    notesCount: number;
    usersCount: number;
    originalNotesCount: number;
    originalUsersCount: number;
    reactionsCount: number;
    instances: number;
    driveUsageLocal: number;
    driveUsageRemote: number;
}

export interface QueueStats {
    waiting?: number;
    active?: number;
    delayed?: number;
    completed?: number;
    failed?: number;
    paused?: number;
    prioritized?: number;
    'waiting-children'?: number;
}

export interface FederatedInstance {
    id: string;
    firstRetrievedAt: string;
    host: string;
    usersCount?: number;
    notesCount?: number;
    followingCount?: number;
    followersCount?: number;
    isNotResponding: boolean;
    isSuspended: boolean;
    suspensionState: string;
    isBlocked: boolean;
    softwareName: string | null;
    softwareVersion: string | null;
    openRegistrations: boolean | null;
    name: string | null;
    description: string | null;
    maintainerName: string | null;
    maintainerEmail: string | null;
    isSilenced: boolean;
    isMediaSilenced: boolean;
    iconUrl: string | null;
    faviconUrl: string | null;
    themeColor: string | null;
    infoUpdatedAt: string | null;
    latestRequestReceivedAt: string | null;
    isNSFW: boolean;
    rejectReports: boolean;
    moderationNote: string | null;
}

export interface FirefishQueueStats {
    deliver: QueueStats;
    inbox: QueueStats;
    db: QueueStats;
    objectStorage: QueueStats;
    backgroundQueue?: QueueStats;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export interface TableStat {
    count: number;
    size: number;
    rows?: number;
    sizeWithIndices?: number;
}

export interface TableStats {
    [key: string]: TableStat;
}

export interface DatabaseStats {
    databaseSize: number;
    tables: TableStats;
    activeConnections?: number;
    transactionsPerSecond?: number;
    cacheHitRatio?: number;
    deadlocks?: number;
    conflictingQueries?: number;
}
