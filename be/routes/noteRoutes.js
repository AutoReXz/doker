import express from 'express';
import { 
    getAllNotes, 
    getNoteById, 
    createNote, 
    updateNote, 
    deleteNote, 
    getNotesByCategory 
} from '../controllers/noteController.js';

const router = express.Router();

// Note routes - order is important!
router.get('/notes/category/:category', getNotesByCategory);  // This specific route must come before the generic :id route
router.get('/notes', getAllNotes);
router.post('/notes', createNote);
router.get('/notes/:id', getNoteById);
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

export default router;
