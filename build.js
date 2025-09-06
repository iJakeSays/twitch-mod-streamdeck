const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Plugin identifier
const PLUGIN_ID = 'com.twitchmod.streamdeck';
const PLUGIN_DIR = `${PLUGIN_ID}.sdPlugin`;

// Create plugin directory structure
function createDirectoryStructure() {
    const directories = [
        PLUGIN_DIR,
        path.join(PLUGIN_DIR, 'plugin'),
        path.join(PLUGIN_DIR, 'plugin', 'libs'),
        path.join(PLUGIN_DIR, 'plugin', 'libs', 'js'),
        path.join(PLUGIN_DIR, 'pi'),
        path.join(PLUGIN_DIR, 'pi', 'css'),
        path.join(PLUGIN_DIR, 'pi', 'js'),
        path.join(PLUGIN_DIR, 'icons')
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
}

// Generate icon files (placeholder SVGs for now)
function generateIcons() {
    const iconSizes = {
        'plugin': [20, 40],
        'category': [28, 56],
        'shield': [20, 40, 72, 144],
        'subscribers': [20, 40, 72, 144],
        'followers': [20, 40, 72, 144],
        'emotes': [20, 40, 72, 144],
        'slow': [20, 40, 72, 144],
        'automod': [20, 40, 72, 144],
        'shoutout': [20, 40, 72, 144],
        'rewards': [20, 40, 72, 144]
    };

    const colors = {
        'plugin': '#9146FF',
        'category': '#9146FF',
        'shield': '#00D4FF',
        'subscribers': '#FF00FF',
        'followers': '#00FF00',
        'emotes': '#FFFF00',
        'slow': '#FF6600',
        'automod': '#0099FF',
        'shoutout': '#FF0099',
        'rewards': '#9900FF'
    };

    Object.keys(iconSizes).forEach(iconName => {
        iconSizes[iconName].forEach((size, index) => {
            const isRetina = index > 0 && size === iconSizes[iconName][index-1] * 2;
            const filename = isRetina ? 
                `${iconName}@2x.png` : 
                `${iconName}.png`;
            
            const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#1a1a1a"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="${colors[iconName]}" opacity="0.8"/>
    <text x="${size/2}" y="${size/2}" font-family="Arial" font-size="${size/4}" fill="white" text-anchor="middle" dy=".3em">${iconName[0].toUpperCase()}</text>
</svg>`;
            
            const iconPath = path.join(PLUGIN_DIR, 'icons', filename);
            
            // For this example, we'll save as SVG (in production, convert to PNG)
            fs.writeFileSync(iconPath.replace('.png', '.svg'), svg);
            console.log(`Generated icon: ${filename}`);
        });
    });
}

// Create Stream Deck library files
function createLibraryFiles() {
    // Create stream-deck.js
    const streamDeckJs = `// Stream Deck JavaScript Library
// This file provides helper functions for Stream Deck plugins

const StreamDeck = {
    // Helper function to parse command line arguments
    parseArgs: function() {
        const args = {};
        process.argv.slice(2).forEach(arg => {
            const [key, value] = arg.split('=');
            args[key.replace('-', '')] = value;
        });
        return args;
    },
    
    // Format logging
    log: function(message) {
        console.log(\`[StreamDeck] \${new Date().toISOString()} - \${message}\`);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreamDeck;
}`;

    fs.writeFileSync(
        path.join(PLUGIN_DIR, 'plugin', 'libs', 'js', 'stream-deck.js'),
        streamDeckJs
    );

    // Create utils.js
    const utilsJs = `// Utility functions for the plugin

const Utils = {
    // Debounce function
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
    
    // Format time
    formatTime: function(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return \`\${hours}h \${minutes}m \${secs}s\`;
        } else if (minutes > 0) {
            return \`\${minutes}m \${secs}s\`;
        } else {
            return \`\${secs}s\`;
        }
    },
    
    // Validate Twitch username
    validateTwitchUsername: function(username) {
        const regex = /^[a-zA-Z0-9_]{4,25}$/;
        return regex.test(username);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}`;

    fs.writeFileSync(
        path.join(PLUGIN_DIR, 'plugin', 'libs', 'js', 'utils.js'),
        utilsJs
    );

    // Create property-inspector.js
    const piJs = `// Property Inspector JavaScript

const PropertyInspector = {
    // Initialize
    init: function() {
        // Add event listeners
        document.addEventListener('DOMContentLoaded', this.onDOMContentLoaded.bind(this));
    },
    
    onDOMContentLoaded: function() {
        // Setup is handled in the HTML file's inline script
        console.log('Property Inspector loaded');
    }
};

PropertyInspector.init();`;

    fs.writeFileSync(
        path.join(PLUGIN_DIR, 'pi', 'js', 'property-inspector.js'),
        piJs
    );

    console.log('Created library files');
}

// Copy files from artifacts to plugin directory
function copyArtifactFiles() {
    // Note: In a real scenario, you would copy the actual files
    // For this example, we're showing the structure
    console.log('Files should be copied from artifacts to plugin directory');
}

// Main build function
function build() {
    console.log('Building Twitch Moderator Tools Stream Deck Plugin...\n');
    
    // Create directory structure
    createDirectoryStructure();
    
    // Generate icons
    generateIcons();
    
    // Create library files
    createLibraryFiles();
    
    // Copy artifact files
    copyArtifactFiles();
    
    console.log('\n✅ Build complete!');
    console.log(`Plugin directory created: ${PLUGIN_DIR}`);
    console.log('\nNext steps:');
    console.log('1. Copy the manifest.json to the plugin directory');
    console.log('2. Copy the HTML files to their respective directories');
    console.log('3. Copy the CSS file to pi/css/');
    console.log('4. Convert SVG icons to PNG format');
    console.log('5. Use the Stream Deck Distribution Tool to package the plugin');
    console.log('\nTo package: DistributionTool -b -i com.twitchmod.streamdeck -o .');
}

// Run build
build();
