import { Note } from '../models/index.js';

/**
 * Update any notes that don't have a category
 */
const migrateCategories = async () => {
    try {
        // Find all notes without a category
        const notesWithoutCategory = await Note.findAll({
            where: {
                category: null
            }
        });
        
        console.log(`Found ${notesWithoutCategory.length} notes without categories`);
        
        // Update each note with a default category
        for (const note of notesWithoutCategory) {
            note.category = 'work'; // Default category
            await note.save();
            console.log(`Updated note ID ${note.id} with default category`);
        }
        
        console.log('Category migration completed successfully');
    } catch (error) {
        console.error('Error during category migration:', error);
    }
};

export default migrateCategories;
