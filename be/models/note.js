import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Note = sequelize.define('Note', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'work', // Default category if none provided
        allowNull: true,      // Allow null for backward compatibility
        validate: {
            isIn: [['work', 'personal', 'study', '']] // Allow empty string too
        }
    }
});

export default Note;
