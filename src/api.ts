import * as nodeFetch from 'node-fetch';
const fetch = nodeFetch.default;
import { ApiResponse } from './types';
import { endpointMetrics } from './metrics';
import { SoftwareVariant } from './types';
import { API_BASE_URL, API_TOKEN } from './config';

if (!API_TOKEN) {
    console.warn('Warning: API_TOKEN is not set. Some endpoints may not work without authentication.');
}

export { API_BASE_URL, API_TOKEN };

type ErrorResponse = { error: { code?: string; message?: string; details?: Record<string, any> } };

export function isError(response: any): response is ErrorResponse {
    return 'error' in response;
}

export async function fetchEndpoint<T>(
    endpoint: string,
    options: { body?: Record<string, any>; requiresAuth?: boolean, method?: string } = {}
): Promise<ApiResponse<T> & Partial<ErrorResponse>> {
    const DEBUG = process.env.DEBUG === 'true';
    try {
        // Remove leading slash if present to avoid double slashes
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const url = `${API_BASE_URL}/api/${cleanEndpoint}`;
        
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };

        // Add authorization header if endpoint requires auth or if token is available
        if ((options.requiresAuth || cleanEndpoint.includes('/admin/')) && API_TOKEN) {
            headers['Authorization'] = `Bearer ${API_TOKEN}`;
        } else if (options.requiresAuth) {
            throw new Error('API_TOKEN is required for this endpoint but not provided');
        }

        const method = options.method || 'POST';
        const body = options.body ? JSON.stringify(options.body) : '{}';
        DEBUG && console.log('Fetching', method, url, headers, body);

        const response = await fetch(url, {
            method,
            headers,
            body
        });

        DEBUG && console.log('Response:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as T;
        DEBUG && console.log('Data:', data);
        return { success: true, data };
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false, data: null as unknown as T };
    }
}

export function updateEndpointAvailability(
    endpoint: string,
    software: SoftwareVariant,
    available: boolean
): void {
    endpointMetrics.set({ endpoint, software }, available ? 1 : 0);
}
