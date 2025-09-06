// Utility functions for the Twitch Moderator Stream Deck plugin

const Utils = {
    /**
     * Debounce function to limit how often a function can fire
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function to limit function calls to once per interval
     * @param {Function} func - Function to throttle
     * @param {number} limit - Milliseconds between calls
     * @returns {Function} Throttled function
     */
    throttle: function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Format time in seconds to human readable string
     * @param {number} seconds - Time in seconds
     * @returns {string} Formatted time string
     */
    formatTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${secs}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${secs}s`;
        } else {
            return `${secs}s`;
        }
    },

    /**
     * Format large numbers with abbreviations
     * @param {number} num - Number to format
     * @returns {string} Formatted number string
     */
    formatNumber: function(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    /**
     * Validate Twitch username
     * @param {string} username - Username to validate
     * @returns {boolean} True if valid
     */
    validateTwitchUsername: function(username) {
        const regex = /^[a-zA-Z0-9_]{4,25}$/;
        return regex.test(username);
    },

    /**
     * Validate OAuth token format
     * @param {string} token - OAuth token to validate
     * @returns {boolean} True if valid format
     */
    validateOAuthToken: function(token) {
        // Basic validation - tokens usually start with specific prefixes
        return token && (
            token.startsWith('oauth:') || 
            token.length > 20
        );
    },

    /**
     * Parse Twitch user ID from various formats
     * @param {string} input - User ID or URL
     * @returns {string|null} User ID or null if invalid
     */
    parseTwitchUserId: function(input) {
        // Direct ID (numeric string)
        if (/^\d+$/.test(input)) {
            return input;
        }
        
        // URL format
        const urlMatch = input.match(/twitch\.tv\/.*\/(\d+)/);
        if (urlMatch) {
            return urlMatch[1];
        }
        
        return null;
    },

    /**
     * Store data in local storage with JSON serialization
     * @param {string} key - Storage key
     * @param {*} value - Value to store
     */
    store: function(key, value) {
        try {
            if (typeof(Storage) !== "undefined") {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            }
        } catch (e) {
            console.error('Failed to store data:', e);
        }
        return false;
    },

    /**
     * Retrieve data from local storage with JSON parsing
     * @param {string} key - Storage key
     * @param {*} defaultValue - Default value if not found
     * @returns {*} Stored value or default
     */
    retrieve: function(key, defaultValue = null) {
        try {
            if (typeof(Storage) !== "undefined") {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            }
        } catch (e) {
            console.error('Failed to retrieve data:', e);
        }
        return defaultValue;
    },

    /**
     * Create a rate limiter
     * @param {number} maxRequests - Maximum requests allowed
     * @param {number} timeWindow - Time window in milliseconds
     * @returns {Function} Rate limit checker function
     */
    createRateLimiter: function(maxRequests, timeWindow) {
        const requests = [];
        
        return function canMakeRequest() {
            const now = Date.now();
            const cutoff = now - timeWindow;
            
            // Remove old requests outside the time window
            while (requests.length > 0 && requests[0] < cutoff) {
                requests.shift();
            }
            
            if (requests.length < maxRequests) {
                requests.push(now);
                return true;
            }
            
            return false;
        };
    },

    /**
     * Retry a promise-based function with exponential backoff
     * @param {Function} fn - Async function to retry
     * @param {number} maxRetries - Maximum number of retries
     * @param {number} delay - Initial delay in milliseconds
     * @returns {Promise} Result of the function
     */
    retryWithBackoff: async function(fn, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === maxRetries - 1) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    },

    /**
     * Deep clone an object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone: function(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        if (obj instanceof Array) {
            return obj.map(item => this.deepClone(item));
        }
        if (obj instanceof Object) {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    },

    /**
     * Generate a unique ID
     * @returns {string} Unique identifier
     */
    generateId: function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Parse duration string to seconds
     * @param {string} duration - Duration string (e.g., "5m", "30s", "1h")
     * @returns {number} Duration in seconds
     */
    parseDuration: function(duration) {
        const match = duration.match(/^(\d+)([smh])$/);
        if (!match) {
            return 0;
        }
        
        const value = parseInt(match[1]);
        const unit = match[2];
        
        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 3600;
            default:
                return 0;
        }
    },

    /**
     * Sanitize text for display
     * @param {string} text - Text to sanitize
     * @returns {string} Sanitized text
     */
    sanitizeText: function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Check if running in Stream Deck environment
     * @returns {boolean} True if in Stream Deck
     */
    isStreamDeckEnvironment: function() {
        return typeof window !== 'undefined' && 
               window.location.protocol === 'file:' &&
               typeof connectElgatoStreamDeckSocket === 'function';
    },

    /**
     * Log with timestamp and level
     * @param {string} level - Log level (info, warn, error)
     * @param {string} message - Message to log
     * @param {*} data - Optional data to log
     */
    log: function(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        switch (level) {
            case 'error':
                console.error(logMessage, data || '');
                break;
            case 'warn':
                console.warn(logMessage, data || '');
                break;
            default:
                console.log(logMessage, data || '');
        }
    }
};

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
