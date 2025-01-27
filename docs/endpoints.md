# API Endpoints Documentation

This document describes the API endpoints that we scrape for different Fediverse software variants.

## Common Endpoints

These endpoints are available across all software variants (Misskey, Calckey, Firefish, Sharkey):

### Meta Information
- **Endpoint**: `/api/meta`
- **Auth Required**: No
- **Method**: POST
- **Description**: Provides information about the instance software and version
- **Response Fields Used**:
  - `repositoryUrl`: URL of the software repository
  - `softwareName`: Name of the software
  - `version`: Software version
  - `process`: Process statistics (if available)
    - `heapUsed`: Heap memory used in bytes
    - `heapTotal`: Total heap memory in bytes
    - `rss`: Resident Set Size in bytes
    - `external`: External memory in bytes
    - `cpuUsage`: CPU usage percentage (optional)

### Instance Statistics
- **Endpoint**: `/stats`
- **Auth Required**: Yes
- **Method**: POST
- **Description**: Detailed instance statistics
- **Response Fields**:
  ```json
  {
    "cpu": number,          // CPU usage percentage
    "mem": {
      "total": number,      // Total memory in bytes
      "used": number,       // Used memory in bytes
      "free": number        // Free memory in bytes
    },
    "disk": {
      "total": number,      // Total disk space in bytes
      "used": number        // Used disk space in bytes
    },
    "fs": {
      "totalFiles": number,   // Total number of files
      "totalDrive": number,   // Total drive space in bytes
      "usedDrive": number    // Used drive space in bytes
    },
    "net": {
      "rx": number,          // Received bytes
      "tx": number           // Transmitted bytes
    },
    "notesCount": number,           // Total notes
    "usersCount": number,           // Total users
    "originalNotesCount": number,    // Local notes
    "originalUsersCount": number,    // Local users
    "driveUsageLocal": number,      // Local drive usage in bytes
    "driveUsageRemote": number,     // Remote drive usage in bytes
    "instances": number,            // Number of known instances
    "reactionsCount": number        // Total number of reactions
  }
  ```

### Federation Information
- **Endpoint**: `/api/federation/instances`
- **Auth Required**: Yes
- **Method**: POST
- **Description**: Information about federated instances
- **Request Body**:
  ```json
  {
    "sort": "+pubSub",
    "limit": 100
  }
  ```
- **Response Fields Used**:
  - `host`: Instance hostname
  - `notesCount`: Number of notes from this instance
  - `usersCount`: Number of users from this instance
  - `followingCount`: Number of users being followed
  - `followersCount`: Number of followers
  - `isBlocked`: Whether the instance is blocked (Calckey specific)

### Database Table Statistics
- **Endpoint**: `/api/admin/get-table-stats`
- **Auth Required**: Yes
- **Permission Required**: `read:admin:table-stats`
- **Method**: POST
- **Description**: Statistics about database tables
- **Response Fields**:
  ```json
  [
    {
      "tablename": string,
      "schemaname": string,
      "estimatedrowcount": number,
      "diskusage": number,
      "diskusageWithIndices": number
    }
  ]
  ```

### Database Index Statistics
- **Endpoint**: `/api/admin/get-index-stats`
- **Auth Required**: Yes
- **Permission Required**: `read:admin:index-stats`
- **Method**: POST
- **Description**: Statistics about database indexes
- **Response Fields**:
  ```json
  [
    {
      "tablename": string,
      "indexname": string
    }
  ]
  ```

## Software-Specific Endpoints

### Queue Statistics

Different Fediverse software variants expose queue statistics through the same endpoint but with different response structures:

#### Misskey/Calckey/Sharkey Queue Stats
- **Endpoint**: `/api/admin/queue/stats`
- **Auth Required**: Yes
- **Permission Required**: `read:admin:emoji`
- **Method**: POST
- **Description**: Retrieves job queue statistics
- **Response Structure**:
  ```json
  {
    "deliver": {
      "waiting": number,
      "active": number,
      "completed": number,
      "failed": number,
      "delayed": number
    },
    "inbox": {
      "waiting": number,
      "active": number,
      "completed": number,
      "failed": number,
      "delayed": number
    },
    "db": {
      "waiting": number,
      "active": number,
      "completed": number,
      "failed": number,
      "delayed": number
    },
    "objectStorage": {
      "waiting": number,
      "active": number,
      "completed": number,
      "failed": number,
      "delayed": number
    }
  }
  ```

#### Firefish Queue Stats
- **Endpoint**: `/api/admin/queue/stats`
- **Auth Required**: Yes
- **Permission Required**: Moderator
- **Method**: POST
- **Description**: Retrieves job queue statistics (different structure from Misskey)
- **Response Structure**:
  ```json
  {
    "deliver": {
      "waiting": number,
      "active": number,
      "delayed": number
    },
    "inbox": {
      "waiting": number,
      "active": number,
      "delayed": number
    },
    "db": {
      "waiting": number,
      "active": number,
      "delayed": number
    },
    "objectStorage": {
      "waiting": number,
      "active": number,
      "delayed": number
    },
    "backgroundQueue": {
      "waiting": number,
      "active": number,
      "delayed": number
    }
  }
  ```

## Authentication

Most administrative endpoints require authentication using a bearer token. Set the token in your environment:

```bash
export API_TOKEN="your_token_here"
```

Then include it in the Authorization header:

```
Authorization: Bearer your_token_here
