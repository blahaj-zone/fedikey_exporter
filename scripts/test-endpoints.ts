import * as dotenv from 'dotenv';

import * as path from 'path';
import { z } from 'zod';
import {
    SoftwareVariant,
    ApiResponse
} from '../src/types';
import {
    softwareVariantSchema,
    metaResponseSchema,
    serverStatsSchema,
    serverInfoSchema,
    firefishQueueStatsSchema,
    federatedInstanceSchema,
    apiResponseSchema,
    tableStatsSchema,
    indexStatsSchema
} from './schemas';
import { detectSoftwareFromMeta } from '../src/software-detection';
import { fetchEndpoint, isError } from '../src/api';
import { API_BASE_URL, API_TOKEN } from '../src/config';

// Load .env from project root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

if (!API_TOKEN) {
    console.error('API_TOKEN environment variable is required');
    process.exit(1);
}

interface TestSummary {
    total: number;
    successful: number;
    failed: number;
    errorsByType: Record<string, number>;
    validationErrors: Record<string, any[]>;
}

interface EndpointConfig {
    name: string;
    endpoint: string;
    requiresAuth: boolean;
    body?: Record<string, any>;
    supportedVariants?: SoftwareVariant[];
    schema?: any;
    debug?: boolean;
}

interface EndpointResult {
    success: boolean;
    data?: any;
    error?: {
        type: 'AUTH_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'TYPE_ERROR' | 'VALIDATION_ERROR' | 'UNKNOWN';
        status?: number;
        message: string;
        details?: any;
        validationErrors?: any[];
    };
    retries?: number;
}

async function testEndpoint(config: EndpointConfig): Promise<EndpointResult> {
    try {
        process.env.DEBUG = config.debug ? 'true' : 'false';

        const response = await fetchEndpoint(config.endpoint, {
            requiresAuth: config.requiresAuth,
            body: config.body
        });

        if (!response.success) {
            // Handle permission denied errors
            if (isError(response) && response.error.code === 'PERMISSION_DENIED') {
                console.warn(`Warning: Endpoint ${config.endpoint} requires additional permissions. Skipping validation.`);
                return {
                    success: true,
                    data: response
                };
            }

            return {
                success: false,
                error: {
                    type: 'SERVER_ERROR',
                    message: response.error?.message || 'Unknown server error',
                    details: response.error
                }
            };
        }

        if (config.schema) {
            const parseResult = config.schema.safeParse(response.data);
            if (!parseResult.success) {
                return {
                    success: false,
                    error: {
                        type: 'VALIDATION_ERROR',
                        message: 'Response data failed validation',
                        validationErrors: parseResult.error.errors
                    }
                };
            }
        }

        return {
            success: true,
            data: response
        };
    } catch (error: any) {
        if (error.message.includes('API_TOKEN is required')) {
            return {
                success: false,
                error: {
                    type: 'AUTH_ERROR',
                    message: error.message
                }
            };
        }

        return {
            success: false,
            error: {
                type: 'NETWORK_ERROR',
                message: error.message
            }
        };
    }
}

async function detectVariant(baseUrl: string): Promise<SoftwareVariant> {
    try {
        const result = await fetchEndpoint<any>('meta', {
            requiresAuth: false,
            body: { detail: false }
        });

        if (!result.success || !result.data) {
            console.warn('Meta endpoint failed:', result);
            return SoftwareVariant.UNKNOWN;
        }

        return detectSoftwareFromMeta(result.data);
    } catch (error) {
        console.error('Error detecting variant:', error);
        return SoftwareVariant.UNKNOWN;
    }
}

async function main() {
    const summary: TestSummary = {
        total: 0,
        successful: 0,
        failed: 0,
        errorsByType: {},
        validationErrors: {}
    };

    // Detect software variant
    const variant = await detectVariant(API_BASE_URL);
    const variantResult = softwareVariantSchema.safeParse(variant);
    if (!variantResult.success) {
        console.error('Invalid software variant:', variantResult.error);
        process.exit(1);
    }
    
    console.log(`Detected software variant: ${variant}`);

    const commonEndpoints: EndpointConfig[] = [
        {
            name: 'Meta',
            endpoint: 'meta',
            requiresAuth: false,
            body: {
                detail: false
            },
            schema: metaResponseSchema
        },
        {
            name: 'Stats',
            endpoint: 'stats',
            requiresAuth: false,
            body: {},
            schema: serverStatsSchema
        }
    ];

    const adminEndpoints: EndpointConfig[] = [
        {
            name: 'Server Info',
            endpoint: 'admin/server-info',
            requiresAuth: true,
            body: {},
            schema: serverInfoSchema
        },
        {
            name: 'Table Stats',
            endpoint: 'admin/get-table-stats',
            requiresAuth: true,
            body: {},
            schema: tableStatsSchema
        },
        {
            name: 'Index Stats',
            endpoint: 'admin/get-index-stats',
            requiresAuth: true,
            body: {},
            schema: indexStatsSchema
        },
        {
            name: 'Queue Stats',
            endpoint: 'admin/queue/stats',
            requiresAuth: true,
            body: {},
            schema: firefishQueueStatsSchema,
            debug: true
        },
        {
            name: 'Federation',
            endpoint: 'federation/instances',
            requiresAuth: false,
            body: {},
            schema: z.array(federatedInstanceSchema)
        }
    ];

    // Combine endpoints
    let endpoints = [...commonEndpoints, ...adminEndpoints];

    for (const endpoint of endpoints) {
        summary.total++;
        const result = await testEndpoint(endpoint);
        
        if (result.success) {
            summary.successful++;
        } else {
            summary.failed++;
            const errorType = result.error?.type || 'UNKNOWN';
            summary.errorsByType[errorType] = (summary.errorsByType[errorType] || 0) + 1;
            
            if (result.error?.type === 'VALIDATION_ERROR') {
                summary.validationErrors[endpoint.name] = result.error.validationErrors || [];
            }
        }
    }

    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`Software Variant: ${variant}`);
    console.log(`Total Endpoints: ${summary.total}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    
    if (summary.failed > 0) {
        console.log('\nErrors by Type:');
        Object.entries(summary.errorsByType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        if (Object.keys(summary.validationErrors).length > 0) {
            console.log('\nValidation Errors:');
            Object.entries(summary.validationErrors).forEach(([endpoint, errors]) => {
                console.log(`\n${endpoint}:`);
                errors.forEach(error => {
                    console.log(`  Path: ${error.path.join('.')} - ${error.message}`);
                });
            });
        }
    }
}

main().catch(console.error);
