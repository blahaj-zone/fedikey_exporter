import * as client from 'prom-client';

// Create and configure the registry
export const register = new client.Registry();

// Instance metrics
export const instanceStatsMetrics = new client.Gauge({
    name: 'instance_stats',
    help: 'Instance statistics',
    labelNames: ['metric'],
    registers: [register]
});

export const userMetrics = new client.Gauge({
    name: 'instance_users_total',
    help: 'Total number of users on the instance',
    registers: [register]
});

export const notesMetrics = new client.Gauge({
    name: 'instance_notes_total',
    help: 'Total number of notes on the instance',
    registers: [register]
});

// System metrics
export const systemCpuMetrics = new client.Gauge({
    name: 'system_cpu_usage',
    help: 'CPU usage percentage',
    registers: [register]
});

export const systemMemoryMetrics = new client.Gauge({
    name: 'system_memory_bytes',
    help: 'Memory usage in bytes',
    labelNames: ['type'],
    registers: [register]
});

export const systemDiskMetrics = new client.Gauge({
    name: 'system_disk_bytes',
    help: 'Disk usage in bytes',
    labelNames: ['type'],
    registers: [register]
});

export const systemNetworkMetrics = new client.Gauge({
    name: 'system_network_bytes',
    help: 'Network traffic in bytes',
    labelNames: ['direction'],
    registers: [register]
});

export const fileCountMetrics = new client.Gauge({
    name: 'system_files_total',
    help: 'Total number of files',
    labelNames: ['type'],
    registers: [register]
});

// Process metrics
export const processMemoryMetrics = new client.Gauge({
    name: 'process_memory_bytes',
    help: 'Process memory usage in bytes',
    labelNames: ['type'],
    registers: [register]
});

export const processCpuMetrics = new client.Gauge({
    name: 'process_cpu_usage_percent',
    help: 'Process CPU usage percentage',
    registers: [register]
});

// Drive metrics
export const driveUsageMetrics = new client.Gauge({
    name: 'drive_usage_bytes',
    help: 'Drive usage in bytes',
    labelNames: ['type'],
    registers: [register]
});

// Instance detailed metrics
export const instanceDetailMetrics = new client.Gauge({
    name: 'instance_detail',
    help: 'Detailed instance statistics',
    labelNames: ['metric'],
    registers: [register]
});

// Uptime metrics
export const uptimeMetrics = new client.Gauge({
    name: 'instance_uptime_milliseconds',
    help: 'Instance uptime in milliseconds',
    registers: [register]
});

// Queue metrics
export const queueMetrics = new client.Gauge({
    name: 'instance_queue_jobs',
    help: 'Number of jobs in each queue',
    labelNames: ['queue', 'software'],
    registers: [register]
});

export const queueDelayMetrics = new client.Gauge({
    name: 'instance_queue_delayed_jobs',
    help: 'Number of delayed jobs in each queue',
    labelNames: ['queue', 'software'],
    registers: [register]
});

// Federation metrics
export const federatedInstanceMetrics = new client.Gauge({
    name: 'federated_instance_info',
    help: 'Information about federated instances',
    labelNames: ['host', 'metric'],
    registers: [register]
});

// Software metrics
export const softwareMetrics = new client.Gauge({
    name: 'instance_software',
    help: 'Information about the instance software',
    labelNames: ['metric', 'software', 'version'],
    registers: [register]
});

// API endpoint metrics
export const endpointMetrics = new client.Gauge({
    name: 'endpoint_availability',
    help: 'Availability of API endpoints',
    labelNames: ['endpoint', 'software'],
    registers: [register]
});

// Database metrics
export const databaseTableRowsGauge = new client.Gauge({
    name: 'database_table_rows',
    help: 'Estimated number of rows in each database table',
    labelNames: ['tablename', 'software'],
    registers: [register]
});

export const databaseTableSizeGauge = new client.Gauge({
    name: 'database_table_size_bytes',
    help: 'Size of each database table in bytes',
    labelNames: ['tablename', 'software'],
    registers: [register]
});
