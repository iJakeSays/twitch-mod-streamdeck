// Property Inspector JavaScript for Twitch Moderator Tools

class TwitchModPropertyInspector {
    constructor() {
        this.websocket = null;
        this.uuid = null;
        this.actionInfo = null;
        this.settings = {};
        this.globalSettings = {};
        
        // Bind methods
        this.onDocumentReady = this.onDocumentReady.bind(this);
        this.connectElgatoStreamDeckSocket = this.connectElgatoStreamDeckSocket.bind(this);
    }

    /**
     * Initialize when document is ready
     */
    onDocumentReady() {
        // Set up event listeners for all inputs
        this.setupEventListeners();
        
        // Initialize UI elements
        this.initializeUI();
    }

    /**
     * Connect to Stream Deck
     */
    connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
        this.uuid = inPropertyInspectorUUID;
        this.actionInfo = JSON.parse(inActionInfo);
        
        // Connect to Stream Deck
        this.websocket = new WebSocket('ws://127.0.0.1:' + inPort);
        
        this.websocket.onopen = () => {
            // Register with Stream Deck
            const json = {
                "event": inRegisterEvent,
                "uuid": inPropertyInspectorUUID
            };
            this.websocket.send(JSON.stringify(json));
            
            // Request global settings
            this.requestGlobalSettings();
            
            // Request settings for this action instance
            this.requestSettings();
        };
        
        this.websocket.onmessage = (evt) => {
            const jsonObj = JSON.parse(evt.data);
            const event = jsonObj.event;
            const payload = jsonObj.payload || {};
            
            switch(event) {
                case 'didReceiveSettings':
                    this.onDidReceiveSettings(payload.settings);
                    break;
                case 'didReceiveGlobalSettings':
                    this.onDidReceiveGlobalSettings(payload.settings);
                    break;
                case 'sendToPropertyInspector':
                    this.onSendToPropertyInspector(payload);
                    break;
            }
        };
        
        this.websocket.onerror = (evt) => {
            console.error('WebSocket error:', evt);
        };
        
        this.websocket.onclose = (evt) => {
            console.log('WebSocket connection closed');
        };
    }

    /**
     * Set up event listeners for form inputs
     */
    setupEventListeners() {
        // Global settings inputs
        const globalInputs = ['twitchChannel', 'twitchToken', 'twitchBroadcasterId', 'twitchModeratorId', 'twitchClientId'];
        globalInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.saveGlobalSettings());
            }
        });
        
        // Action-specific settings
        const actionInputs = ['shieldDuration', 'followDuration', 'slowDelay'];
        actionInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.saveSettings());
            }
        });
        
        // Button click handlers
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveGlobalSettings();
                this.saveSettings();
                this.showSaveConfirmation();
            });
        }
        
        const getTokenButton = document.getElementById('getTokenButton');
        if (getTokenButton) {
            getTokenButton.addEventListener('click', () => {
                this.openUrl('https://twitchapps.com/tmi/');
            });
        }
        
        const getIdButton = document.getElementById('getIdButton');
        if (getIdButton) {
            getIdButton.addEventListener('click', () => {
                this.openUrl('https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/');
            });
        }
        
        // Test connection button
        const testButton = document.getElementById('testConnection');
        if (testButton) {
            testButton.addEventListener('click', () => this.testTwitchConnection());
        }
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        // Show/hide action-specific settings based on action type
        const action = this.actionInfo?.action;
        
        // Hide all detail sections first
        document.querySelectorAll('.action-settings').forEach(el => {
            el.style.display = 'none';
        });
        
        // Show relevant section based on action
        switch(action) {
            case 'com.twitchmod.streamdeck.shieldmode':
                const shieldSettings = document.getElementById('shieldSettings');
                if (shieldSettings) shieldSettings.style.display = 'block';
                break;
            case 'com.twitchmod.streamdeck.followersonly':
                const followerSettings = document.getElementById('followerSettings');
                if (followerSettings) followerSettings.style.display = 'block';
                break;
            case 'com.twitchmod.streamdeck.slowmode':
                const slowSettings = document.getElementById('slowSettings');
                if (slowSettings) slowSettings.style.display = 'block';
                break;
        }
    }

    /**
     * Handle received settings
     */
    onDidReceiveSettings(settings) {
        this.settings = settings || {};
        
        // Update UI with received settings
        if (settings.shieldDuration) {
            const element = document.getElementById('shieldDuration');
            if (element) element.value = settings.shieldDuration;
        }
        
        if (settings.followDuration) {
            const element = document.getElementById('followDuration');
            if (element) element.value = settings.followDuration;
        }
        
        if (settings.slowDelay) {
            const element = document.getElementById('slowDelay');
            if (element) element.value = settings.slowDelay;
        }
    }

    /**
     * Handle received global settings
     */
    onDidReceiveGlobalSettings(settings) {
        this.globalSettings = settings || {};
        
        // Update UI with global settings
        if (settings.twitchChannel) {
            const element = document.getElementById('twitchChannel');
            if (element) element.value = settings.twitchChannel;
        }
        
        if (settings.twitchToken) {
            const element = document.getElementById('twitchToken');
            if (element) element.value = settings.twitchToken;
        }
        
        if (settings.twitchBroadcasterId) {
            const element = document.getElementById('twitchBroadcasterId');
            if (element) element.value = settings.twitchBroadcasterId;
        }
        
        if (settings.twitchModeratorId) {
            const element = document.getElementById('twitchModeratorId');
            if (element) element.value = settings.twitchModeratorId;
        }
        
        if (settings.twitchClientId) {
            const element = document.getElementById('twitchClientId');
            if (element) element.value = settings.twitchClientId;
        }
    }

    /**
     * Handle messages from plugin
     */
    onSendToPropertyInspector(payload) {
        // Handle custom messages from the plugin
        if (payload.event === 'connectionTest') {
            this.handleConnectionTestResult(payload.success, payload.message);
        }
    }

    /**
     * Save settings for this action instance
     */
    saveSettings() {
        const settings = {};
        
        // Get action-specific settings
        const shieldDuration = document.getElementById('shieldDuration');
        if (shieldDuration) {
            settings.shieldDuration = parseInt(shieldDuration.value) || 300;
        }
        
        const followDuration = document.getElementById('followDuration');
        if (followDuration) {
            settings.followDuration = parseInt(followDuration.value) || 10;
        }
        
        const slowDelay = document.getElementById('slowDelay');
        if (slowDelay) {
            settings.slowDelay = parseInt(slowDelay.value) || 3;
        }
        
        // Send settings to Stream Deck
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const json = {
                "event": "setSettings",
                "context": this.uuid,
                "payload": settings
            };
            this.websocket.send(JSON.stringify(json));
        }
        
        // Store locally
        this.settings = settings;
    }

    /**
     * Save global settings
     */
    saveGlobalSettings() {
        const settings = {};
        
        // Get global settings from form
        const twitchChannel = document.getElementById('twitchChannel');
        if (twitchChannel) {
            settings.twitchChannel = twitchChannel.value.trim().replace('@', '');
        }
        
        const twitchToken = document.getElementById('twitchToken');
        if (twitchToken) {
            settings.twitchToken = twitchToken.value.trim();
        }
        
        const twitchBroadcasterId = document.getElementById('twitchBroadcasterId');
        if (twitchBroadcasterId) {
            settings.twitchBroadcasterId = twitchBroadcasterId.value.trim();
        }
        
        const twitchModeratorId = document.getElementById('twitchModeratorId');
        if (twitchModeratorId) {
            settings.twitchModeratorId = twitchModeratorId.value.trim();
        }
        
        const twitchClientId = document.getElementById('twitchClientId');
        if (twitchClientId) {
            settings.twitchClientId = twitchClientId.value.trim();
        }
        
        // Send to Stream Deck
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const json = {
                "event": "setGlobalSettings",
                "context": this.uuid,
                "payload": settings
            };
            this.websocket.send(JSON.stringify(json));
        }
        
        // Also send to plugin for immediate use
        this.sendToPlugin({
            action: 'saveGlobalSettings',
            ...settings
        });
        
        // Store locally
        this.globalSettings = settings;
    }

    /**
     * Request settings from Stream Deck
     */
    requestSettings() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const json = {
                "event": "getSettings",
                "context": this.uuid
            };
            this.websocket.send(JSON.stringify(json));
        }
    }

    /**
     * Request global settings from Stream Deck
     */
    requestGlobalSettings() {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const json = {
                "event": "getGlobalSettings",
                "context": this.uuid
            };
            this.websocket.send(JSON.stringify(json));
        }
    }

    /**
     * Send message to plugin
     */
    sendToPlugin(payload) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const json = {
                "event": "sendToPlugin",
                "action": this.actionInfo.action,
                "context": this.uuid,
                "payload": payload
            };
            this.websocket.send(JSON.stringify(json));
        }
    }

    /**
     * Open URL in default browser
     */
    openUrl(url) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            const json = {
                "event": "openUrl",
                "payload": {
                    "url": url
                }
            };
            this.websocket.send(JSON.stringify(json));
        }
    }

    /**
     * Test Twitch connection
     */
    testTwitchConnection() {
        const testButton = document.getElementById('testConnection');
        const statusElement = document.getElementById('connectionStatus');
        
        if (testButton) {
            testButton.disabled = true;
            testButton.textContent = 'Testing...';
        }
        
        if (statusElement) {
            statusElement.textContent = 'Testing connection...';
            statusElement.className = 'status-testing';
        }
        
        // Send test request to plugin
        this.sendToPlugin({
            action: 'testConnection',
            twitchToken: this.globalSettings.twitchToken,
            twitchClientId: this.globalSettings.twitchClientId,
            twitchBroadcasterId: this.globalSettings.twitchBroadcasterId
        });
        
        // Re-enable button after timeout if no response
        setTimeout(() => {
            if (testButton && testButton.disabled) {
                testButton.disabled = false;
                testButton.textContent = 'Test Connection';
                if (statusElement) {
                    statusElement.textContent = 'Test timed out';
                    statusElement.className = 'status-error';
                }
            }
        }, 10000);
    }

    /**
     * Handle connection test result
     */
    handleConnectionTestResult(success, message) {
        const testButton = document.getElementById('testConnection');
        const statusElement = document.getElementById('connectionStatus');
        
        if (testButton) {
            testButton.disabled = false;
            testButton.textContent = 'Test Connection';
        }
        
        if (statusElement) {
            statusElement.textContent = message || (success ? 'Connected successfully!' : 'Connection failed');
            statusElement.className = success ? 'status-success' : 'status-error';
        }
    }

    /**
     * Show save confirmation
     */
    showSaveConfirmation() {
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
            const originalText = saveButton.textContent;
            saveButton.textContent = 'Saved!';
            saveButton.classList.add('saved');
            
            setTimeout(() => {
                saveButton.textContent = originalText;
                saveButton.classList.remove('saved');
            }, 2000);
        }
    }

    /**
     * Validate form inputs
     */
    validateInputs() {
        let isValid = true;
        const errors = [];
        
        // Validate Twitch channel
        const channelInput = document.getElementById('twitchChannel');
        if (channelInput && !this.validateTwitchUsername(channelInput.value)) {
            errors.push('Invalid Twitch channel name');
            isValid = false;
        }
        
        // Validate OAuth token
        const tokenInput = document.getElementById('twitchToken');
        if (tokenInput && !tokenInput.value) {
            errors.push('OAuth token is required');
            isValid = false;
        }
        
        // Validate IDs (should be numeric)
        const broadcasterIdInput = document.getElementById('twitchBroadcasterId');
        if (broadcasterIdInput && !/^\d+$/.test(broadcasterIdInput.value)) {
            errors.push('Broadcaster ID must be numeric');
            isValid = false;
        }
        
        const moderatorIdInput = document.getElementById('twitchModeratorId');
        if (moderatorIdInput && !/^\d+$/.test(moderatorIdInput.value)) {
            errors.push('Moderator ID must be numeric');
            isValid = false;
        }
        
        // Show errors if any
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            if (errors.length > 0) {
                errorContainer.innerHTML = errors.map(e => `<div class="error">${e}</div>`).join('');
                errorContainer.style.display = 'block';
            } else {
                errorContainer.style.display = 'none';
            }
        }
        
        return isValid;
    }

    /**
     * Validate Twitch username format
     */
    validateTwitchUsername(username) {
        const cleaned = username.replace('@', '').trim();
        const regex = /^[a-zA-Z0-9_]{4,25}$/;
        return regex.test(cleaned);
    }
}

// Initialize Property Inspector
const inspector = new TwitchModPropertyInspector();

// Set up document ready handler
if (document.readyState !== 'loading') {
    inspector.onDocumentReady();
} else {
    document.addEventListener('DOMContentLoaded', inspector.onDocumentReady);
}

// Make connectElgatoStreamDeckSocket available globally for Stream Deck to call
function connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
    inspector.connectElgatoStreamDeckSocket(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo);
}
