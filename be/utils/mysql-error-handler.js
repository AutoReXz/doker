/**
 * Helper functions to handle MySQL-specific errors
 */

/**
 * Handles common MySQL error codes and provides friendly messages
 * @param {Error} error - The error object from Sequelize/MySQL
 * @returns {Object} - User-friendly error details
 */
export function handleMySQLError(error) {
    // Default error information
    let errorInfo = {
        message: 'A database error occurred',
        type: 'unknown',
        details: error.message,
        code: error.original?.code || 'UNKNOWN'
    };
    
    // Check the specific MySQL error code
    if (error.original?.code) {
        switch (error.original.code) {
            case 'ER_ACCESS_DENIED_ERROR':
                errorInfo = {
                    message: 'Cannot connect to the database - access denied',
                    type: 'connection',
                    details: 'Check your database username and password',
                    code: error.original.code
                };
                break;
                
            case 'ER_BAD_DB_ERROR':
                errorInfo = {
                    message: 'Database does not exist',
                    type: 'connection',
                    details: 'Create the database "notes_app" in phpMyAdmin',
                    code: error.original.code
                };
                break;
                
            case 'ER_NO_SUCH_TABLE':
                errorInfo = {
                    message: 'Table does not exist',
                    type: 'schema',
                    details: 'Run the database initialization script',
                    code: error.original.code
                };
                break;
                
            case 'ER_BAD_FIELD_ERROR':
                errorInfo = {
                    message: 'Column does not exist in table',
                    type: 'schema',
                    details: 'The database schema needs to be updated',
                    code: error.original.code
                };
                break;
                
            // Add more error codes as needed
        }
    }
    
    // Log the formatted error with helpful info
    console.error('[MySQL Error]', {
        errorInfo,
        originalError: {
            message: error.message,
            stack: error.stack
        }
    });
    
    return errorInfo;
}

/**
 * Express middleware to handle MySQL errors
 */
export function mysqlErrorMiddleware(err, req, res, next) {
    // Check if this is a Sequelize/MySQL error
    if (err.name === 'SequelizeConnectionError' || 
        err.name === 'SequelizeDatabaseError' || 
        err.name === 'SequelizeValidationError') {
        
        const errorInfo = handleMySQLError(err);
        
        return res.status(500).json({
            error: errorInfo.message,
            code: errorInfo.code,
            type: errorInfo.type
        });
    }
    
    // Pass other errors to the next handler
    next(err);
}
