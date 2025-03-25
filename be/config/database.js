import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create Sequelize instance with MySQL on GCP using environment variables
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    logging: console.log, // Enable logging to see SQL queries
    dialectOptions: {
        connectTimeout: 60000, // Increase connection timeout for cloud DB
        // Add SSL if running in production/cloud environment
        ssl: process.env.NODE_ENV === 'production' ? {
            rejectUnauthorized: true
        } : null
    },
    pool: {
        max: 5, // Maximum number of connection in pool
        min: 0, // Minimum number of connection in pool
        acquire: 60000, // The maximum time, in milliseconds, that pool will try to get connection before throwing error
        idle: 10000 // The maximum time, in milliseconds, that a connection can be idle before being released
    }
});

// Test the connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL database connection to GCP established successfully.');
        console.log(`Connected to MySQL at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    } catch (error) {
        console.error('Unable to connect to the MySQL database on GCP:', error);
    }
})();

export default sequelize;
