import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initModels } from './models/index.js';
import noteRoutes from './routes/noteRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api', noteRoutes);

const startServer = async () => {
    try {
        await initModels();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            console.log(`Connected to MySQL database on ${process.env.DB_HOST}`);
        });
    } catch (error) {
        console.error('Unable to start the server:', error);
    }
};

startServer();

