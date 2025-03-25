import sequelize from '../config/database.js';
import Note from './note.js';

/**
 * Initialize models and sync them with the MySQL database on GCP
 */
const initModels = async () => {
    try {
        await sequelize.sync({ alter: true }); // Use alter:true to make changes without dropping tables
        console.log('MySQL database models synchronized successfully');
    } catch (error) {
        console.error('Error syncing MySQL database models:', error);
        throw error;
    }
};

export {
    initModels,
    Note
};
