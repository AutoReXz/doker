/**
 * Enhanced toast notification system for notes application
 * Can be included as a separate file or integrated into main script.js
 */

/**
 * Display a toast notification with customizable options
 * @param {Object} options - Toast configuration options
 * @param {string} options.message - The message to display
 * @param {string} options.type - The toast type (success, error, warning, info)
 * @param {number} options.duration - How long to show the toast in ms
 * @param {string} options.position - Position (top-right, top-left, bottom-right, bottom-left)
 */
function showToast(options = {}) {
    // Default options
    const config = {
        message: options.message || 'Notification',
        type: options.type || 'success',
        duration: options.duration || 3000,
        position: options.position || 'bottom-right'
    };
    
    // Remove existing toasts if they would overlap
    $(`.toast-notification.toast-${config.position}`).remove();
    
    // Determine colors and icon based on type
    let bgColor, textColor, icon, borderColor;
    switch(config.type) {
        case 'error':
            bgColor = 'bg-red-50';
            textColor = 'text-red-800';
            borderColor = 'border-red-400';
            icon = '<i class="fas fa-exclamation-circle text-red-600"></i>';
            break;
        case 'warning':
            bgColor = 'bg-yellow-50';
            textColor = 'text-yellow-800';
            borderColor = 'border-yellow-400';
            icon = '<i class="fas fa-exclamation-triangle text-yellow-600"></i>';
            break;
        case 'info':
            bgColor = 'bg-blue-50';
            textColor = 'text-blue-800';
            borderColor = 'border-blue-400';
            icon = '<i class="fas fa-info-circle text-blue-600"></i>';
            break;
        case 'success':
        default:
            bgColor = 'bg-green-50';
            textColor = 'text-green-800';
            borderColor = 'border-green-400';
            icon = '<i class="fas fa-check-circle text-green-600"></i>';
    }
    
    // Determine position class
    let positionClass;
    switch(config.position) {
        case 'top-right':
            positionClass = 'top-4 right-4';
            break;
        case 'top-left':
            positionClass = 'top-4 left-4';
            break;
        case 'bottom-left':
            positionClass = 'bottom-4 left-4';
            break;
        case 'bottom-right':
        default:
            positionClass = 'bottom-4 right-4';
    }
    
    // Create toast element with improved design
    const toast = $(`
        <div class="toast-notification toast-${config.position} fixed ${positionClass} ${bgColor} ${textColor} border ${borderColor} px-4 py-3 rounded-lg shadow-md flex items-center max-w-xs sm:max-w-sm transform transition-all duration-300 translate-y-10 opacity-0">
            <div class="mr-3 text-xl">
                ${icon}
            </div>
            <div class="flex-1 mr-2">
                ${config.message}
            </div>
            <button class="text-gray-500 hover:text-gray-700 focus:outline-none toast-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `);
    
    // Add to body
    $('body').append(toast);
    
    // Animate in
    setTimeout(() => {
        toast.removeClass('translate-y-10 opacity-0');
    }, 10);
    
    // Add close button event
    toast.find('.toast-close').on('click', function() {
        hideToast(toast);
    });
    
    // Auto-remove after duration
    setTimeout(() => {
        hideToast(toast);
    }, config.duration);
}

/**
 * Hides a toast with animation
 * @param {JQuery} toast - The toast element to hide
 */
function hideToast(toast) {
    toast.addClass('opacity-0 translate-y-10');
    setTimeout(() => {
        toast.remove();
    }, 300);
}
