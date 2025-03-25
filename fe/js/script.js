// Base URL for our API - use current hostname instead of hardcoded localhost
const API_URL = `${window.location.protocol}//${window.location.host}/api`;

// Global state to store notes
let allNotes = [];
let currentCategory = 'all';
let currentView = 'grid'; // grid or list

// Document ready function
$(document).ready(function() {
    // Load all notes when page loads
    getListNotes();

    // Attach event listeners
    setupEventListeners();
    
    // Setup sidebar toggle for mobile
    setupSidebar();
});

/**
 * Attach all event listeners
 */
function setupEventListeners() {
    // New note buttons
    $('#newNoteBtn, #newNoteBtnSidebar, #newNoteBtnTop, #newNoteBtnEmpty').on('click', showAddNoteModal);
    
    // Modal interactions
    $('#cancelBtn').on('click', closeNoteModal);
    $('#noteForm').on('submit', handleFormSubmit);
    $('#cancelDeleteBtn').on('click', closeDeleteModal);
    $('#confirmDeleteBtn').on('click', confirmDelete);
    
    // Search functionality
    $('#searchNotes, #searchNotesTop').on('input', function() {
        const query = $(this).val().toLowerCase();
        filterNotes(currentCategory, query);
        
        // Sync the two search boxes
        $('#searchNotes, #searchNotesTop').val(query);
    });
    
    // Category filtering
    $('.category-filter').on('click', function(e) {
        e.preventDefault();
        const category = $(this).data('category');
        
        // Update active state
        $('.category-filter').removeClass('active');
        $(this).addClass('active');
        
        // Update current category display
        currentCategory = category;
        updateCurrentCategoryDisplay();
        
        // Filter notes
        filterNotes(category, $('#searchNotes').val().toLowerCase());
    });
    
    // View toggle (grid/list)
    $('#viewToggleBtn').on('click', function() {
        if (currentView === 'grid') {
            currentView = 'list';
            $('#notesList').addClass('list-view');
            $(this).html('<i class="fas fa-grip"></i>');
        } else {
            currentView = 'grid';
            $('#notesList').removeClass('list-view');
            $(this).html('<i class="fas fa-th-list"></i>');
        }
    });
}

/**
 * Setup sidebar toggle functionality
 */
function setupSidebar() {
    $('#sidebarToggle, #sidebarToggleTop').on('click', function() {
        $('#sidebar').toggleClass('sidebar-hidden sidebar-visible');
    });
    
    // Close sidebar when clicking outside on mobile
    $(document).on('click', function(e) {
        if ($(window).width() < 1024) {
            if (!$(e.target).closest('#sidebar').length && 
                !$(e.target).closest('#sidebarToggle').length && 
                !$(e.target).closest('#sidebarToggleTop').length) {
                $('#sidebar').removeClass('sidebar-visible').addClass('sidebar-hidden');
            }
        }
    });
}

/**
 * Fetches all notes from the API
 */
function getListNotes() {
    showLoading();

    // Fetch notes using AJAX
    $.ajax({
        url: `${API_URL}/notes`,
        method: 'GET',
        success: function(notes) {
            allNotes = notes;
            updateNotesCounters();
            displayNotes(notes);
            hideLoading();
        },
        error: function(error) {
            console.error('Error fetching notes:', error);
            $('#notesList').html(`<p class="text-red-500 col-span-full text-center">Failed to load notes. Please try again.</p>`);
            hideLoading();
        }
    });
}

/**
 * Updates all counter displays
 */
function updateNotesCounters() {
    // Total notes count
    $('#totalNotesCount').text(allNotes.length);
    
    // Recent updates (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentNotes = allNotes.filter(note => new Date(note.updatedAt || note.createdAt) >= oneWeekAgo);
    $('#recentUpdatesCount').text(recentNotes.length);
    
    // Category counts
    $('#all-count').text(allNotes.length);
    
    // Get unique categories and count notes in each
    const categories = ['work', 'personal', 'study'];
    categories.forEach(category => {
        const count = allNotes.filter(note => (note.category || 'work') === category).length;
        $(`#${category}-count`).text(count);
    });
}

/**
 * Updates the current category display in the header
 */
function updateCurrentCategoryDisplay() {
    if (currentCategory === 'all') {
        $('#currentCategory').text('All Notes');
    } else {
        $('#currentCategory').text(
            currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) + ' Notes'
        );
    }
}

/**
 * Shows loading indicator
 */
function showLoading() {
    $('#notesList').html(`
        <div class="flex items-center justify-center col-span-full py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    `);
    $('#emptyState').addClass('hidden');
}

/**
 * Hides loading indicator
 */
function hideLoading() {
    // Will be replaced by displayNotes or empty state
}

/**
 * Filters notes by category and search query
 * @param {string} category - Category to filter by
 * @param {string} query - Search query
 */
function filterNotes(category, query = '') {
    let filteredNotes = [...allNotes];
    
    // Filter by category
    if (category && category !== 'all') {
        filteredNotes = filteredNotes.filter(note => note.category === category);
    }
    
    // Filter by search query
    if (query) {
        filteredNotes = filteredNotes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.content.toLowerCase().includes(query)
        );
    }
    
    // Display filtered notes
    displayNotes(filteredNotes);
}

/**
 * Displays the notes in the UI
 * @param {Array} notes - Array of note objects
 */
function displayNotes(notes) {
    // Clear the notes list
    $('#notesList').empty();

    // If no notes, display the empty state
    if (!notes || notes.length === 0) {
        // Show empty state with appropriate message
        const message = currentCategory === 'all' 
            ? 'You don\'t have any notes yet. Create your first note!'
            : `You don't have any ${currentCategory} notes yet.`;
            
        $('#emptyState .text-gray-500').text(message);
        $('#notesList').addClass('hidden');
        $('#emptyState').removeClass('hidden');
        return;
    }

    // Show notes list, hide empty state
    $('#notesList').removeClass('hidden');
    $('#emptyState').addClass('hidden');

    // Get category colors
    const categoryColors = {
        work: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            icon: 'fa-briefcase'
        },
        personal: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            icon: 'fa-user'
        },
        study: {
            bg: 'bg-purple-100',
            text: 'text-purple-800',
            icon: 'fa-book'
        }
    };

    // Loop through and add each note as a card
    notes.forEach(note => {
        // Handle null or undefined category
        const noteCat = note.category || 'work';
        const categoryColor = categoryColors[noteCat] || categoryColors.work;
        
        const noteCard = `
            <div class="note-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg fade-in">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="text-xl font-bold text-gray-800 truncate">${note.title}</h3>
                        <span class="${categoryColor.bg} ${categoryColor.text} text-xs px-2 py-1 rounded-full flex items-center">
                            <i class="fas ${categoryColor.icon} mr-1"></i>
                            ${noteCat.charAt(0).toUpperCase() + noteCat.slice(1)}
                        </span>
                    </div>
                    <p class="text-gray-600 note-content">${note.content}</p>
                    <div class="flex justify-between mt-4 pt-3 border-t border-gray-100">
                        <span class="text-gray-500 text-sm">
                            <i class="far fa-clock mr-1"></i>
                            ${formatDate(note.updatedAt || note.createdAt)}
                        </span>
                        <div class="flex space-x-2">
                            <button class="btn-icon text-blue-500 hover:text-blue-700" onclick="showEditNoteModal(${note.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon text-red-500 hover:text-red-700" onclick="showDeleteModal(${note.id})">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        $('#notesList').append(noteCard);
    });
}

/**
 * Format a date to a readable string
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
        return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/**
 * Shows the add note modal
 */
function showAddNoteModal() {
    // Reset form
    $('#noteForm')[0].reset();
    $('#noteId').val('');
    $('#modalTitle').text('Add New Note');
    $('#saveBtn').text('Save Note');
    
    // Show modal
    $('#noteModal').removeClass('hidden').addClass('flex');
    $('body').addClass('modal-open');
    
    // Focus on title input
    setTimeout(() => {
        $('#title').focus();
    }, 100);
}

/**
 * Shows the edit note modal with pre-filled data
 * @param {number} id - Note ID
 */
function showEditNoteModal(id) {
    // Fetch note details
    $.ajax({
        url: `${API_URL}/notes/${id}`,
        method: 'GET',
        success: function(note) {
            // Fill form with note data
            $('#noteId').val(note.id);
            $('#title').val(note.title);
            $('#content').val(note.content);
            $('#category').val(note.category || 'work');
            
            // Update modal title and button
            $('#modalTitle').text('Edit Note');
            $('#saveBtn').text('Update Note');
            
            // Show modal
            $('#noteModal').removeClass('hidden').addClass('flex');
            $('body').addClass('modal-open');
            
            // Focus on title input
            setTimeout(() => {
                $('#title').focus();
            }, 100);
        },
        error: function(error) {
            console.error('Error fetching note details:', error);
            alert('Failed to load note details. Please try again.');
        }
    });
}

/**
 * Close the note form modal
 */
function closeNoteModal() {
    $('#noteModal').removeClass('flex').addClass('hidden');
    $('body').removeClass('modal-open');
}

/**
 * Handles form submission for both adding and editing notes
 * @param {Event} e - Submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const noteId = $('#noteId').val();
    const title = $('#title').val().trim();
    const content = $('#content').val().trim();
    const category = $('#category').val() || 'work';  // Default to 'work' if not selected
    
    // Debug log
    console.log('Form submission:', { noteId, title, content, category });
    
    // Validate inputs
    if (!title || !content) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const noteData = {
        title,
        content,
        category
    };
    
    // Log the data we're sending
    console.log('Submitting note data:', noteData);
    
    if (noteId) {
        // If noteId exists, it's an update
        editNote(noteId, noteData);
    } else {
        // Otherwise, it's a new note
        saveNote(noteData);
    }
}

/**
 * Saves a new note via API
 * @param {Object} noteData - Note data object
 */
function saveNote(noteData) {
    // Log the specific AJAX call
    console.log('Sending POST request to create note:', noteData);
    
    $.ajax({
        url: `${API_URL}/notes`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(noteData),
        success: function(response) {
            console.log('Note created successfully:', response);
            closeNoteModal();
            getListNotes();
            alert('Note created successfully!');
        },
        error: function(xhr, status, error) {
            console.error('Error creating note:', xhr.responseText);
            alert('Failed to create note. Please check the console for details.');
        }
    });
}

/**
 * Updates an existing note via API
 * @param {number} id - Note ID
 * @param {Object} noteData - Updated note data
 */
function editNote(id, noteData) {
    $.ajax({
        url: `${API_URL}/notes/${id}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(noteData),
        success: function(response) {
            closeNoteModal();
            getListNotes();
            showToast('Note updated successfully!');
        },
        error: function(error) {
            console.error('Error updating note:', error);
            alert('Failed to update note. Please try again.');
        }
    });
}

/**
 * Shows the delete confirmation modal
 * @param {number} id - Note ID
 */
function showDeleteModal(id) {
    $('#deleteNoteId').val(id);
    $('#deleteModal').removeClass('hidden').addClass('flex');
    $('body').addClass('modal-open');
}

/**
 * Closes the delete confirmation modal
 */
function closeDeleteModal() {
    $('#deleteModal').removeClass('flex').addClass('hidden');
    $('body').removeClass('modal-open');
}

/**
 * Confirms and executes note deletion
 */
function confirmDelete() {
    const noteId = $('#deleteNoteId').val();
    
    $.ajax({
        url: `${API_URL}/notes/${noteId}`,
        method: 'DELETE',
        success: function(response) {
            closeDeleteModal();
            getListNotes();
            showToast('Note deleted successfully!');
        },
        error: function(error) {
            console.error('Error deleting note:', error);
            alert('Failed to delete note. Please try again.');
            closeDeleteModal();
        }
    });
}

/**
 * Displays a toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
    // Create toast element
    const toast = $(`
        <div class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-500">
            ${message}
        </div>
    `);
    
    // Add to body
    $('body').append(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.addClass('opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}
