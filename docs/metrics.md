# Prometheus Metrics Documentation

This document describes the metrics exposed by our Prometheus exporter on the `/metrics` endpoint.

## System Metrics

### CPU Usage
- **Name**: `system_cpu_usage_percent`
- **Type**: Gauge
- **Description**: CPU usage percentage
- **Labels**: None
- **Example**:
  ```
  system_cpu_usage_percent 45.2
  ```

### Memory Usage
- **Name**: `system_memory_bytes`
- **Type**: Gauge
- **Description**: System memory usage in bytes
- **Labels**:
  - `type`: Memory type (total, used, free)
- **Example**:
  ```
  system_memory_bytes{type="total"} 16777216000
  system_memory_bytes{type="used"} 8388608000
  system_memory_bytes{type="free"} 8388608000
  ```

### Disk Usage
- **Name**: `system_disk_bytes`
- **Type**: Gauge
- **Description**: Disk usage in bytes
- **Labels**:
  - `type`: Usage type (total, used, drive_total, drive_used)
- **Example**:
  ```
  system_disk_bytes{type="total"} 1099511627776
  system_disk_bytes{type="used"} 549755813888
  ```

### Network Traffic
- **Name**: `system_network_bytes`
- **Type**: Gauge
- **Description**: Network traffic in bytes
- **Labels**:
  - `direction`: Traffic direction (rx, tx)
- **Example**:
  ```
  system_network_bytes{direction="rx"} 1024000
  system_network_bytes{direction="tx"} 512000
  ```

## Process Metrics

### Process Memory
- **Name**: `process_memory_bytes`
- **Type**: Gauge
- **Description**: Process memory usage in bytes
- **Labels**:
  - `type`: Memory type (heap_used, heap_total, rss, external)
- **Example**:
  ```
  process_memory_bytes{type="heap_used"} 524288000
  process_memory_bytes{type="rss"} 1048576000
  ```

### Process CPU
- **Name**: `process_cpu_usage_percent`
- **Type**: Gauge
- **Description**: Process CPU usage percentage
- **Labels**: None
- **Example**:
  ```
  process_cpu_usage_percent 12.5
  ```

## Drive Metrics

### Drive Usage
- **Name**: `drive_usage_bytes`
- **Type**: Gauge
- **Description**: Drive usage in bytes
- **Labels**:
  - `type`: Storage type (local, remote)
- **Example**:
  ```
  drive_usage_bytes{type="local"} 1073741824
  drive_usage_bytes{type="remote"} 2147483648
  ```

### File Counts
- **Name**: `files_total`
- **Type**: Gauge
- **Description**: Total number of files
- **Labels**:
  - `type`: File type (total, local, remote)
- **Example**:
  ```
  files_total{type="local"} 1000
  files_total{type="remote"} 2000
  ```

## Instance Metrics

### Users
- **Name**: `instance_users_total`
- **Type**: Gauge
- **Description**: Total number of users on the instance
- **Labels**: None
- **Example**:
  ```
  instance_users_total 1234
  ```

### Notes/Posts
- **Name**: `instance_notes_total`
- **Type**: Gauge
- **Description**: Total number of notes/posts on the instance
- **Labels**: None
- **Example**:
  ```
  instance_notes_total 5678
  ```

### Instance Details
- **Name**: `instance_detail`
- **Type**: Gauge
- **Description**: Detailed instance statistics
- **Labels**:
  - `metric`: Statistic type
    - `notes_count`: Total notes
    - `users_count`: Total users
    - `original_notes_count`: Local notes
    - `original_users_count`: Local users
    - `instances_count`: Known instances
- **Example**:
  ```
  instance_detail{metric="notes_count"} 50000
  instance_detail{metric="users_count"} 1000
  ```

### Uptime
- **Name**: `instance_uptime_milliseconds`
- **Type**: Gauge
- **Description**: Instance uptime in milliseconds
- **Labels**: None
- **Example**:
  ```
  instance_uptime_milliseconds 86400000
  ```

## Queue Metrics

### Queue Jobs
- **Name**: `instance_queue_jobs`
- **Type**: Gauge
- **Description**: Number of jobs in each queue (sum of waiting, active, and delayed jobs)
- **Labels**:
  - `queue`: Queue name (e.g., "deliver", "inbox", "db")
  - `software`: Software variant name (e.g., "misskey", "calckey", "firefish")
- **Example**:
  ```
  instance_queue_jobs{queue="deliver",software="firefish"} 42
  instance_queue_jobs{queue="inbox",software="firefish"} 10
  ```

### Delayed Queue Jobs
- **Name**: `instance_queue_delayed_jobs`
- **Type**: Gauge
- **Description**: Number of delayed jobs in each queue
- **Labels**:
  - `queue`: Queue name (e.g., "deliver", "inbox", "db")
  - `software`: Software variant name
- **Example**:
  ```
  instance_queue_delayed_jobs{queue="deliver",software="misskey"} 5
  ```

## Federation Metrics

### Federated Instance Stats
- **Name**: `federated_instance_stats`
- **Type**: Gauge
- **Description**: Various statistics for federated instances
- **Labels**:
  - `host`: Federated instance hostname
  - `metric`: Type of statistic
    - `notes_count`: Number of notes from this instance
    - `users_count`: Number of users from this instance
    - `following_count`: Number of users being followed
    - `followers_count`: Number of followers
    - `is_blocked`: Whether the instance is blocked (1 for blocked, 0 for not blocked)
- **Example**:
  ```
  federated_instance_stats{host="example.com",metric="notes_count"} 1000
  federated_instance_stats{host="example.com",metric="users_count"} 50
  ```

## Database Metrics

### Database Size
- **Name**: `database_size_bytes`
- **Type**: Gauge
- **Description**: Total database size in bytes
- **Labels**: None
- **Example**:
  ```
  database_size_bytes 5368709120
  ```

### Database Connections
- **Name**: `database_connections_active`
- **Type**: Gauge
- **Description**: Number of active database connections
- **Labels**: None
- **Example**:
  ```
  database_connections_active 42
  ```

### Database Transactions
- **Name**: `database_transactions_per_second`
- **Type**: Gauge
- **Description**: Number of transactions per second
- **Labels**: None
- **Example**:
  ```
  database_transactions_per_second 150.5
  ```

### Database Cache
- **Name**: `database_cache_hit_ratio`
- **Type**: Gauge
- **Description**: Database cache hit ratio (0-1)
- **Labels**: None
- **Example**:
  ```
  database_cache_hit_ratio 0.95
  ```

### Database Errors
- **Name**: `database_errors_total`
- **Type**: Gauge
- **Description**: Database error counts
- **Labels**:
  - `type`: Error type (deadlocks, conflicts)
- **Example**:
  ```
  database_errors_total{type="deadlocks"} 5
  database_errors_total{type="conflicts"} 12
  ```

### Table Statistics
- **Name**: `table_stats`
- **Type**: Gauge
- **Description**: Table statistics
- **Labels**:
  - `table`: Table name
  - `metric`: Metric type
    - `rows`: Estimated row count
    - `total_bytes`: Total size in bytes
    - `index_bytes`: Index size in bytes
    - `toast_bytes`: TOAST size in bytes
    - `table_bytes`: Table size in bytes
- **Example**:
  ```
  table_stats{table="users",metric="rows"} 10000
  table_stats{table="users",metric="total_bytes"} 1048576
  ```

### Index Statistics
- **Name**: `index_stats`
- **Type**: Gauge
- **Description**: Index statistics
- **Labels**:
  - `table`: Table name
  - `index`: Index name
  - `metric`: Metric type (size, rows)
  - `type`: Index type (primary, unique, normal)
- **Example**:
  ```
  index_stats{table="users",index="users_pkey",metric="size",type="primary"} 524288
  index_stats{table="users",index="users_username_key",metric="rows",type="unique"} 10000
  ```

## Software Information

### Software Version
- **Name**: `instance_software`
- **Type**: Gauge
- **Description**: Information about the instance software
- **Labels**:
  - `metric`: Type of information (currently only "version")
  - `software`: Software variant name
  - `version`: Software version string
- **Example**:
  ```
  instance_software{metric="version",software="firefish",version="1.0.0"} 1
  ```

## API Endpoint Availability

### Endpoint Availability
- **Name**: `endpoint_availability`
- **Type**: Gauge
- **Description**: Availability status of API endpoints (1 for available, 0 for unavailable)
- **Labels**:
  - `endpoint`: API endpoint path
  - `software`: Software variant name
- **Example**:
  ```
  endpoint_availability{endpoint="/queue/stats",software="misskey"} 1
  endpoint_availability{endpoint="/federation/instances",software="misskey"} 1
  ```

## Prometheus Configuration

Example Prometheus scrape configuration:

```yaml
scrape_configs:
  - job_name: 'fediverse'
    static_configs:
      - targets: ['localhost:9125']
    scrape_interval: 15s
```
