import sequelize from '../config/database.js';
import { Note } from '../models/index.js';
import readline from 'readline';
import { fileURLToPath } from 'url';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * Reset the database to fix issues
 */
const resetDatabase = async () => {
    console.log('⚠️ WARNING: This will DROP and recreate the database tables ⚠️');
    console.log('All data will be lost!');
    
    await new Promise((resolve) => {
        rl.question('Are you sure you want to proceed? (type "yes" to confirm): ', async (answer) => {
            if (answer.toLowerCase() === 'yes') {
                try {
                    console.log('Dropping tables...');
                    await sequelize.drop();
                    console.log('Tables dropped successfully');
                    
                    console.log('Syncing database models...');
                    await sequelize.sync({ force: true });
                    console.log('Database models synced successfully');
                    
                    console.log('Creating sample notes...');
                    await Note.bulkCreate([
                        {
                            title: 'Welcome to Notes App',
                            content: 'This is a simple notes application built with Express, Sequelize, and jQuery.',
                            category: 'personal'
                        },
                        {
                            title: 'How to use categories',
                            content: 'Click on a category in the sidebar to filter notes. You can categorize notes as Work, Personal, or Study.',
                            category: 'study'
                        },
                        {
                            title: 'Getting started with work notes',
                            content: 'Use work notes to keep track of your professional tasks and reminders.',
                            category: 'work'
                        }
                    ]);
                    console.log('Sample notes created successfully');
                    
                    console.log('✅ Database reset completed successfully');
                } catch (error) {
                    console.error('❌ Error resetting database:', error);
                }
            } else {
                console.log('Database reset cancelled');
            }
            rl.close();
            resolve();
        });
    });
};

// Run the reset directly if this script is executed
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    resetDatabase().finally(() => {
        console.log('Reset process completed');
        process.exit();
    });
}

export default resetDatabase;
