import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');
console.log('Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });
if (result.error) {
    console.error('Error loading .env file:', result.error);
}

export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
export const API_TOKEN = process.env.API_TOKEN;

if (!API_TOKEN) {
    console.warn('Warning: API_TOKEN is not set. Some endpoints may not work without authentication.');
}
