/**
 * Enhanced error handling functionality for AJAX requests
 */

// Log all AJAX requests for debugging
$(document).ajaxSend(function(event, jqXHR, settings) {
    console.log('AJAX Request:', {
        url: settings.url,
        method: settings.type || settings.method || 'GET',
        data: settings.data
    });
});

// Log all AJAX responses for debugging
$(document).ajaxComplete(function(event, jqXHR, settings) {
    console.log('AJAX Response:', {
        url: settings.url,
        status: jqXHR.status,
        responseText: jqXHR.responseText
    });
});

// Handle all AJAX errors globally
$(document).ajaxError(function(event, jqXHR, settings, error) {
    console.error('AJAX Error:', {
        url: settings.url,
        method: settings.type || settings.method || 'GET',
        status: jqXHR.status,
        statusText: jqXHR.statusText,
        responseText: jqXHR.responseText,
        error: error
    });
    
    // Display a user-friendly error message
    let errorMessage = 'An error occurred. Please try again.';
    
    try {
        // Try to parse the error response
        const response = JSON.parse(jqXHR.responseText);
        if (response.error) {
            errorMessage = response.error;
        }
    } catch (e) {
        // If we can't parse the response, use a generic message
        if (jqXHR.status === 0) {
            errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (jqXHR.status === 404) {
            errorMessage = 'The requested resource was not found.';
        } else if (jqXHR.status === 500) {
            errorMessage = 'Internal server error. Please try again later.';
        }
    }
    
    // Show the error message as a toast notification
    if (typeof showToast === 'function') {
        showToast({
            message: errorMessage,
            type: 'error'
        });
    } else {
        alert(errorMessage);
    }
});
