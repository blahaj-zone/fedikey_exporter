import { fetchEndpoint, updateEndpointAvailability } from './api';
import { getSoftwareInfo } from './software-detection';
import {
    databaseTableRowsGauge,
    databaseTableSizeGauge,
    driveUsageMetrics,
    federatedInstanceMetrics,
    fileCountMetrics,
    instanceStatsMetrics,
    notesMetrics,
    processCpuMetrics,
    processMemoryMetrics,
    queueDelayMetrics,
    queueMetrics,
    softwareMetrics,
    systemCpuMetrics,
    systemDiskMetrics,
    systemMemoryMetrics,
    systemNetworkMetrics,
    userMetrics
} from './metrics';
import {
    DatabaseStats,
    FederatedInstance,
    MetaResponse,
    QueueStats,
    ServerInfo,
    ServerStats,
    SoftwareVariant,
    TableStats
} from './types';

export async function collectFirefishQueueStats(softwareName: SoftwareVariant): Promise<void> {
    try {
        const { success, data } = await fetchEndpoint<Record<string, { waiting: number; active: number; delayed: number }>>(
            'admin/queue/stats',
            { requiresAuth: true }
        );
        updateEndpointAvailability('admin/queue/stats', softwareName, success);

        if (!success || !data) return;

        for (const [queueName, stats] of Object.entries(data)) {
            const waiting = stats.waiting ?? 0;
            const active = stats.active ?? 0;
            const delayed = stats.delayed ?? 0;

            queueMetrics.set(
                { queue: queueName, software: softwareName },
                waiting + active + delayed
            );
            
            if (delayed > 0) {
                queueDelayMetrics.set(
                    { queue: queueName, software: softwareName },
                    delayed
                );
            }
        }
    } catch (error) {
        console.error('Error collecting Firefish queue stats:', error);
    }
}

async function collectStandardQueueStats(softwareName: SoftwareVariant): Promise<void> {
    try {
        const { success, data } = await fetchEndpoint<Record<string, QueueStats>>(
            'admin/queue/stats',
            { requiresAuth: true }
        );
        updateEndpointAvailability('admin/queue/stats', softwareName, success);

        if (!success || !data) {
            console.error('Failed to fetch queue stats or missing required permissions');
            return;
        }

        for (const [queueName, stats] of Object.entries(data)) {
            const waiting = stats.waiting ?? 0;
            const active = stats.active ?? 0;
            const delayed = stats.delayed ?? 0;
            const failed = stats.failed ?? 0;
            const paused = stats.paused ?? 0;
            const prioritized = stats.prioritized ?? 0;
            const waitingChildren = stats['waiting-children'] ?? 0;

            // Total jobs in queue
            const totalJobs = waiting + active + delayed + failed + paused + prioritized + waitingChildren;
            queueMetrics.set(
                { queue: queueName, software: softwareName },
                totalJobs
            );
            
            // Track delayed jobs separately
            if (delayed > 0) {
                queueDelayMetrics.set(
                    { queue: queueName, software: softwareName },
                    delayed
                );
            }

            // Set individual queue state metrics
            instanceStatsMetrics.set({ metric: `queue_${queueName}_waiting` }, waiting);
            instanceStatsMetrics.set({ metric: `queue_${queueName}_active` }, active);
            instanceStatsMetrics.set({ metric: `queue_${queueName}_failed` }, failed);
            instanceStatsMetrics.set({ metric: `queue_${queueName}_delayed` }, delayed);
            instanceStatsMetrics.set({ metric: `queue_${queueName}_paused` }, paused);
        }
    } catch (error) {
        console.error('Error collecting standard queue stats:', error);
    }
}

export async function collectFederationStats(softwareName: SoftwareVariant): Promise<void> {
    try {
        const limit = 100;
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
            const { success, data } = await fetchEndpoint<FederatedInstance[]>(
                'federation/instances',
                { 
                    body: {
                        sort: '+pubSub',
                        limit,
                        offset
                    },
                    requiresAuth: false
                }
            );
            updateEndpointAvailability('federation/instances', softwareName, success);

            if (!success || !data) {
                console.error('Failed to fetch federation stats');
                return;
            }

            // Process the instances in this batch
            for (const instance of data) {
                const host = instance.host;

                if (typeof instance.usersCount === 'number') {
                    federatedInstanceMetrics.set({ host, metric: 'users_count' }, instance.usersCount);
                }
                if (typeof instance.notesCount === 'number') {
                    federatedInstanceMetrics.set({ host, metric: 'notes_count' }, instance.notesCount);
                }
                if (typeof instance.followingCount === 'number') {
                    federatedInstanceMetrics.set({ host, metric: 'following_count' }, instance.followingCount);
                }
                if (typeof instance.followersCount === 'number') {
                    federatedInstanceMetrics.set({ host, metric: 'followers_count' }, instance.followersCount);
                }
            }

            // Check if we have more instances to fetch
            offset += limit;
            hasMore = offset < 1000 && data.length === limit;
        }
    } catch (error) {
        console.error('Error fetching federation stats:', error);
    }
}

/**
 * Collect metrics from server stats
 * @param stats Server stats from the API
 */
function collectServerStats(stats: ServerStats): void {
    // Instance stats
    instanceStatsMetrics.set({ metric: 'notes_count' }, stats.notesCount);
    instanceStatsMetrics.set({ metric: 'original_notes_count' }, stats.originalNotesCount);
    instanceStatsMetrics.set({ metric: 'users_count' }, stats.usersCount);
    instanceStatsMetrics.set({ metric: 'original_users_count' }, stats.originalUsersCount);
    instanceStatsMetrics.set({ metric: 'reactions_count' }, stats.reactionsCount);
    instanceStatsMetrics.set({ metric: 'instances_count' }, stats.instances);
    instanceStatsMetrics.set({ metric: 'drive_usage_local' }, stats.driveUsageLocal);
    instanceStatsMetrics.set({ metric: 'drive_usage_remote' }, stats.driveUsageRemote);
}

/**
 * Collect metrics from server info
 * @param info Server info from the API
 */
function collectServerInfo(info: ServerInfo): void {
    try {
        // CPU metrics
        if (info.cpu) {
            if (typeof info.cpu.cores === 'number') {
                systemCpuMetrics.set(info.cpu.cores);
            }
        }

        // Memory metrics
        if (info.mem) {
            if (typeof info.mem.total === 'number') {
                systemMemoryMetrics.set({ type: 'total' }, info.mem.total);
            }
        }

        // Disk metrics
        if (info.fs) {
            if (typeof info.fs.total === 'number') {
                systemDiskMetrics.set({ type: 'total' }, info.fs.total);
            }
            if (typeof info.fs.used === 'number') {
                systemDiskMetrics.set({ type: 'used' }, info.fs.used);
                const free = info.fs.total - info.fs.used;
                systemDiskMetrics.set({ type: 'free' }, free);
            }
        }

        // Note: Network rx/tx stats are not available in server-info
        // Note: Total files count is not available in server-info
    } catch (error) {
        console.error('Error collecting server info:', error);
    }
}

/**
 * Collect metrics from meta
 * @param meta Meta response from the API
 */
function collectMetaMetrics(meta: MetaResponse): void {
    try {
        if (meta.process) {
            const { heapUsed, heapTotal, rss, external, cpuUsage } = meta.process;
            
            // Process memory metrics
            if (typeof heapUsed === 'number' && heapUsed > 0) {
                processMemoryMetrics.set({ type: 'heap_used' }, heapUsed);
            }
            if (typeof heapTotal === 'number' && heapTotal > 0) {
                processMemoryMetrics.set({ type: 'heap_total' }, heapTotal);
            }
            if (typeof rss === 'number' && rss > 0) {
                processMemoryMetrics.set({ type: 'rss' }, rss);
            }
            if (typeof external === 'number' && external > 0) {
                processMemoryMetrics.set({ type: 'external' }, external);
            }

            // Process CPU metrics
            if (typeof cpuUsage === 'number' && cpuUsage >= 0) {
                processCpuMetrics.set(cpuUsage);
            }
        }
    } catch (error) {
        console.error('Error collecting meta metrics:', error);
    }
}

/**
 * Collect metrics from federated instances
 * @param instances Array of federated instances from the API
 */
function collectFederatedInstanceMetrics(instances: FederatedInstance[]): void {
    for (const instance of instances) {
        const host = instance.host;

        if (instance.usersCount !== undefined) {
            federatedInstanceMetrics.set({ host, metric: 'users_count' }, instance.usersCount as number);
        }
        if (instance.notesCount !== undefined) {
            federatedInstanceMetrics.set({ host, metric: 'notes_count' }, instance.notesCount as number);
        }
        if (instance.followingCount !== undefined) {
            federatedInstanceMetrics.set({ host, metric: 'following_count' }, instance.followingCount as number);
        }
        if (instance.followersCount !== undefined) {
            federatedInstanceMetrics.set({ host, metric: 'followers_count' }, instance.followersCount as number);
        }
    }
}

async function collectSystemStats(softwareName: SoftwareVariant): Promise<void> {
    try {
        const { success, data } = await fetchEndpoint<ServerInfo>('admin/server-info', { requiresAuth: true });
        updateEndpointAvailability('admin/server-info', softwareName, success);

        if (!success || !data) return;

        collectServerInfo(data);
    } catch (error) {
        console.error('Error collecting system stats:', error);
    }
}

async function collectInstanceStats(softwareName: SoftwareVariant): Promise<void> {
    try {
        const { success, data } = await fetchEndpoint<ServerStats>('stats', { requiresAuth: true });
        updateEndpointAvailability('stats', softwareName, success);

        if (!success || !data) return;

        // Extract instance stats from server info
        const stats: ServerStats = {
            notesCount: data.notesCount,
            originalNotesCount: data.originalNotesCount,
            usersCount: data.usersCount,
            originalUsersCount: data.originalUsersCount,
            reactionsCount: data.reactionsCount,
            instances: data.instances,
            driveUsageLocal: data.driveUsageLocal,
            driveUsageRemote: data.driveUsageRemote
        };

        collectServerStats(stats);
    } catch (error) {
        console.error('Error collecting instance stats:', error);
    }
}

async function collectDatabaseStats(softwareName: SoftwareVariant): Promise<void> {
    try {
        const { success, data } = await fetchEndpoint<TableStats>('admin/get-table-stats', { requiresAuth: true });
        updateEndpointAvailability('admin/get-table-stats', softwareName, success);

        if (!success || !data) {
            console.error('Failed to fetch database stats');
            return;
        }

        const tableStats = data;

        let totalSize = 0;
        for (const table of Object.values(tableStats)) {
            if (typeof table.size === 'number' || typeof table.sizeWithIndices === 'number') {
                totalSize += table.sizeWithIndices ?? table.size;
            }
        }

        // Update metrics for table stats
        for (const [tableName, table] of Object.entries(tableStats)) {
            if (tableName.startsWith('pg_stat_')) continue;

            if (typeof table.rows === 'number' || typeof table.count === 'number') {
                databaseTableRowsGauge.labels(
                    tableName,
                    softwareName
                ).set(table.count ?? table.rows);
            }
            
            if (typeof table.size === 'number' || typeof table.sizeWithIndices === 'number') {
                databaseTableSizeGauge.labels(
                    tableName,
                    softwareName
                ).set(table.sizeWithIndices ?? table.size);
            }
        }

        // Update total database size
        if (totalSize > 0) {
            databaseTableSizeGauge.labels('total', softwareName).set(totalSize);
        }

    } catch (error) {
        console.error('Error collecting database stats:', error);
    }
}

async function collectMetrics(meta: MetaResponse, softwareName: SoftwareVariant): Promise<void> {
    try {
        // Collect process metrics from meta
        collectMetaMetrics(meta);

        // Collect instance stats
        await collectInstanceStats(softwareName);

        // Collect system stats
        await collectSystemStats(softwareName);

        // Collect federation stats
        await collectFederationStats(softwareName);

        // Collect database stats for all variants as they all support these endpoints
        await collectDatabaseStats(softwareName);

        // Collect queue stats based on software variant
        if (softwareName === 'firefish') {
            await collectFirefishQueueStats(softwareName);
        } else {
            await collectStandardQueueStats(softwareName);
        }
    } catch (error) {
        console.error('Error collecting metrics:', error);
    }
}

export async function fetchStats(): Promise<void> {
    try {
        // Detect software variant
        const { success: metaSuccess, data: meta } = await fetchEndpoint<MetaResponse>(
            'meta',
            { requiresAuth: false }
        );

        if (!metaSuccess || !meta) {
            console.error('Failed to fetch meta information');
            return;
        }

        const softwareInfo = getSoftwareInfo(meta);
        if (!softwareInfo?.name) {
            console.error('Failed to detect software variant');
            return;
        }

        const softwareName = softwareInfo.name;

        // Update software info metrics
        if (typeof meta.version === 'string') {
            softwareMetrics.set(
                { metric: 'version', software: softwareName, version: meta.version },
                1
            );
        }

        // Collect metrics
        await collectMetrics(meta, softwareName);

        // Fetch instance stats
        const { success: statsSuccess, data: stats } = await fetchEndpoint<ServerStats>(
            'stats',
            { requiresAuth: false }
        );

        if (statsSuccess && stats) {
            // Set instance stats metrics
            if (typeof stats.usersCount === 'number') {
                instanceStatsMetrics.set({ metric: 'users_count' }, stats.usersCount);
                userMetrics.set(stats.usersCount); // Keep for backward compatibility
            }
            if (typeof stats.notesCount === 'number') {
                instanceStatsMetrics.set({ metric: 'notes_count' }, stats.notesCount);
                notesMetrics.set(stats.notesCount); // Keep for backward compatibility
            }
            if (typeof stats.originalUsersCount === 'number') {
                instanceStatsMetrics.set({ metric: 'original_users_count' }, stats.originalUsersCount);
            }
            if (typeof stats.originalNotesCount === 'number') {
                instanceStatsMetrics.set({ metric: 'original_notes_count' }, stats.originalNotesCount);
            }
            if (typeof stats.reactionsCount === 'number') {
                instanceStatsMetrics.set({ metric: 'reactions_count' }, stats.reactionsCount);
            }
            if (typeof stats.instances === 'number') {
                instanceStatsMetrics.set({ metric: 'federated_instances' }, stats.instances);
            }
            
            // Set drive usage metrics (only if non-zero)
            if (typeof stats.driveUsageLocal === 'number' && stats.driveUsageLocal > 0) {
                driveUsageMetrics.set({ type: 'local' }, stats.driveUsageLocal);
            }
            if (typeof stats.driveUsageRemote === 'number' && stats.driveUsageRemote > 0) {
                driveUsageMetrics.set({ type: 'remote' }, stats.driveUsageRemote);
            }
        }
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}
