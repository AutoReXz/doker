import sequelize from '../config/database.js';
import { Note } from '../models/index.js';
import { fileURLToPath } from 'url';

/**
 * Check database connection and table structure
 */
const checkDatabase = async () => {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✅ Database connection successful');
        
        // Check if Notes table exists
        try {
            await Note.findAll({ limit: 1 });
            console.log('✅ Notes table exists');
            
            // Log table structure
            const tableInfo = await sequelize.getQueryInterface().describeTable('Notes');
            console.log('Table structure:');
            console.table(tableInfo);
            
            // Check for null categories
            const notesWithoutCategory = await Note.findAll({
                where: {
                    category: null
                }
            });
            
            if (notesWithoutCategory.length > 0) {
                console.log(`⚠️ Found ${notesWithoutCategory.length} notes without categories`);
            } else {
                console.log('✅ All notes have categories');
            }
            
            // Show some sample data
            const sampleNotes = await Note.findAll({ limit: 3 });
            console.log('Sample notes:');
            sampleNotes.forEach(note => {
                console.log({
                    id: note.id,
                    title: note.title,
                    category: note.category || 'NULL'
                });
            });
            
        } catch (error) {
            console.error('❌ Error accessing Notes table:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
};

// Run the check directly if this script is executed
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    console.log('🔍 Running database check...');
    checkDatabase().finally(() => {
        console.log('Database check completed');
        process.exit();
    });
}

export default checkDatabase;
