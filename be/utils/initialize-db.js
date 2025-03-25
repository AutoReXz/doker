import sequelize from '../config/database.js';
import { Note } from '../models/index.js';

/**
 * Initialize the database with tables and sample data
 */
const initializeDatabase = async () => {
    try {
        console.log('Starting database initialization...');
        
        // Sync all models with the database (create tables)
        console.log('Creating database tables...');
        await sequelize.sync({ force: true });
        console.log('Database tables created successfully');
        
        // Create sample notes
        console.log('Creating sample notes...');
        const sampleNotes = [
            {
                title: 'Welcome to Notes App',
                content: 'This is a simple notes application built with Express, Sequelize, and jQuery.',
                category: 'personal'
            },
            {
                title: 'Work Tasks',
                content: 'Complete the project documentation and send it to the team.',
                category: 'work'
            },
            {
                title: 'Study Plan',
                content: 'Read chapter 5 of the textbook and complete exercises.',
                category: 'study'
            }
        ];
        
        await Note.bulkCreate(sampleNotes);
        console.log('Sample notes created successfully');
        
        // Verify notes were created
        const noteCount = await Note.count();
        console.log(`Database now contains ${noteCount} notes`);
        
        console.log('✅ Database initialization completed successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        process.exit();
    }
};

// Run the initialization
initializeDatabase();
