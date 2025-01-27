// Import config first to ensure environment variables are loaded
import './config';
import express from 'express';
import { register } from './metrics';
import { fetchStats } from './stats-collector';

const app = express();
const port = process.env.PORT || 9125;
const scrapeInterval = process.env.SCRAPE_INTERVAL ? parseInt(process.env.SCRAPE_INTERVAL) : 15000;

// Endpoint for Prometheus to scrape metrics
app.get('/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        console.error('Error serving metrics:', error);
        res.status(500).end();
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
    // Start collecting metrics
    setInterval(fetchStats, scrapeInterval);
    fetchStats(); // Initial collection
});
