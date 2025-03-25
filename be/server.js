import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initModels } from './models/index.js';
import noteRoutes from './routes/noteRoutes.js';
import migrateCategories from './utils/migrate-categories.js';
import { mysqlErrorMiddleware } from './utils/mysql-error-handler.js';
import os from 'os';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Listen on all interfaces by default

// Enhanced CORS configuration to allow requests from any VM or local client
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add OPTIONS pre-flight handling for all routes
app.options('*', cors());

// Middleware for logging requests
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'Unknown'}`);
    next();
});

app.use(express.json({
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            console.error('Invalid JSON:', e.message);
            throw new Error('Invalid JSON');
        }
        
        // Log request body for debugging
        if (req.method === 'POST' || req.method === 'PUT') {
            console.log('Request body:', JSON.parse(buf.toString()));
        }
    }
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', noteRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route all other requests to index.html (for SPA functionality)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MySQL error handling middleware - place this AFTER routes
app.use(mysqlErrorMiddleware);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
});

// Helper function to get server IP addresses
function getServerIPs() {
    const networkInterfaces = os.networkInterfaces();
    const addresses = [];
    
    for (const interfaceName in networkInterfaces) {
        for (const iface of networkInterfaces[interfaceName]) {
            // Skip internal and non-ipv4 addresses
            if (!iface.internal && iface.family === 'IPv4') {
                addresses.push(iface.address);
            }
        }
    }
    
    return addresses;
}

// Start server
const startServer = async () => {
    try {
        // Initialize models (sync with MySQL database)
        await initModels();
        console.log('MySQL database models initialized');
        
        // Run migration to update notes without categories
        await migrateCategories();
        
        app.listen(PORT, HOST, () => {
            console.log(`\n--- Server Information ---`);
            console.log(`Server is running on http://${HOST}:${PORT}`);
            console.log(`Local access: http://localhost:${PORT}`);
            
            // Display all IPs the server is accessible on
            const ipAddresses = getServerIPs();
            if (ipAddresses.length > 0) {
                console.log('Available on network at:');
                ipAddresses.forEach(ip => {
                    console.log(`- http://${ip}:${PORT}`);
                });
                console.log('\nFRONTEND ACCESS OPTIONS:');
                console.log('1. Local mode: Just use the "Connect to Local Backend" option');
                console.log('2. Remote mode: Use one of these IP addresses with the backend port:');
                ipAddresses.forEach(ip => {
                    console.log(`   http://${ip}:${PORT}/api`);
                });
            }
            
            console.log(`\nConnected to MySQL database on ${process.env.DB_HOST}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`---------------------------\n`);
        });
    } catch (error) {
        console.error('Unable to start the server:', error);
        process.exit(1);
    }
};

startServer();
