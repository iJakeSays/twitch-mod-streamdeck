// Stream Deck JavaScript Library
// Helper functions for Stream Deck plugin communication

/**
 * Collection of constants used by the Stream Deck software
 */
const DestinationEnum = Object.freeze({
    HARDWARE_AND_SOFTWARE: 0,
    HARDWARE_ONLY: 1,
    SOFTWARE_ONLY: 2
});

const EventsReceived = Object.freeze({
    SETTINGS: 'didReceiveSettings',
    GLOBAL_SETTINGS: 'didReceiveGlobalSettings',
    KEY_DOWN: 'keyDown',
    KEY_UP: 'keyUp',
    WILL_APPEAR: 'willAppear',
    WILL_DISAPPEAR: 'willDisappear',
    TITLE_PARAMETERS_DID_CHANGE: 'titleParametersDidChange',
    DEVICE_DID_CONNECT: 'deviceDidConnect',
    DEVICE_DID_DISCONNECT: 'deviceDidDisconnect',
    APPLICATION_DID_LAUNCH: 'applicationDidLaunch',
    APPLICATION_DID_TERMINATE: 'applicationDidTerminate',
    SYSTEM_DID_WAKE_UP: 'systemDidWakeUp',
    PROPERTY_INSPECTOR_DID_APPEAR: 'propertyInspectorDidAppear',
    PROPERTY_INSPECTOR_DID_DISAPPEAR: 'propertyInspectorDidDisappear',
    SEND_TO_PLUGIN: 'sendToPlugin',
    SEND_TO_PROPERTY_INSPECTOR: 'sendToPropertyInspector'
});

const EventsSent = Object.freeze({
    SET_SETTINGS: 'setSettings',
    GET_SETTINGS: 'getSettings',
    SET_GLOBAL_SETTINGS: 'setGlobalSettings',
    GET_GLOBAL_SETTINGS: 'getGlobalSettings',
    OPEN_URL: 'openUrl',
    LOG_MESSAGE: 'logMessage',
    SET_TITLE: 'setTitle',
    SET_IMAGE: 'setImage',
    SET_STATE: 'setState',
    SHOW_ALERT: 'showAlert',
    SHOW_OK: 'showOk',
    SEND_TO_PLUGIN: 'sendToPlugin',
    SEND_TO_PROPERTY_INSPECTOR: 'sendToPropertyInspector'
});

/**
 * Stream Deck Plugin Manager
 */
class StreamDeckPlugin {
    constructor() {
        this.websocket = null;
        this.pluginUUID = null;
        this.registerEventName = null;
        this.info = null;
        this.actionInfo = null;
    }

    /**
     * Connect to Stream Deck
     */
    connect(inPort, inPluginUUID, inRegisterEvent, inInfo, inActionInfo) {
        this.pluginUUID = inPluginUUID;
        this.registerEventName = inRegisterEvent;
        this.info = inInfo ? JSON.parse(inInfo) : null;
        this.actionInfo = inActionInfo ? JSON.parse(inActionInfo) : null;

        this.websocket = new WebSocket('ws://127.0.0.1:' + inPort);

        this.websocket.onopen = () => {
            this.register();
            this.onConnected();
        };

        this.websocket.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            this.handleMessage(data);
        };

        this.websocket.onerror = (evt) => {
            console.error('WebSocket error:', evt);
            this.onError(evt);
        };

        this.websocket.onclose = (evt) => {
            console.log('WebSocket closed');
            this.onDisconnected();
        };
    }

    /**
     * Register with Stream Deck
     */
    register() {
        const json = {
            event: this.registerEventName,
            uuid: this.pluginUUID
        };
        this.send(json);
    }

    /**
     * Send message to Stream Deck
     */
    send(json) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(json));
        }
    }

    /**
     * Handle incoming messages
     */
    handleMessage(data) {
        const event = data.event;
        const context = data.context;
        const payload = data.payload || {};
        const action = data.action;
        const device = data.device;

        // Call appropriate handler based on event
        switch (event) {
            case EventsReceived.SETTINGS:
                this.onSettings(context, payload.settings, payload.coordinates, payload.isInMultiAction);
                break;
            case EventsReceived.GLOBAL_SETTINGS:
                this.onGlobalSettings(payload.settings);
                break;
            case EventsReceived.KEY_DOWN:
                this.onKeyDown(context, payload.settings, payload.coordinates, payload.userDesiredState, payload.state, payload.isInMultiAction);
                break;
            case EventsReceived.KEY_UP:
                this.onKeyUp(context, payload.settings, payload.coordinates, payload.userDesiredState, payload.state, payload.isInMultiAction);
                break;
            case EventsReceived.WILL_APPEAR:
                this.onWillAppear(context, payload.settings, payload.coordinates, action, device, payload.isInMultiAction);
                break;
            case EventsReceived.WILL_DISAPPEAR:
                this.onWillDisappear(context, payload.settings, payload.coordinates, action, device, payload.isInMultiAction);
                break;
            case EventsReceived.TITLE_PARAMETERS_DID_CHANGE:
                this.onTitleParametersDidChange(context, payload.title, payload.titleParameters, payload.state);
                break;
            case EventsReceived.DEVICE_DID_CONNECT:
                this.onDeviceDidConnect(device, data.deviceInfo);
                break;
            case EventsReceived.DEVICE_DID_DISCONNECT:
                this.onDeviceDidDisconnect(device);
                break;
            case EventsReceived.APPLICATION_DID_LAUNCH:
                this.onApplicationDidLaunch(payload.application);
                break;
            case EventsReceived.APPLICATION_DID_TERMINATE:
                this.onApplicationDidTerminate(payload.application);
                break;
            case EventsReceived.SYSTEM_DID_WAKE_UP:
                this.onSystemDidWakeUp();
                break;
            case EventsReceived.PROPERTY_INSPECTOR_DID_APPEAR:
                this.onPropertyInspectorDidAppear(context, action, device);
                break;
            case EventsReceived.PROPERTY_INSPECTOR_DID_DISAPPEAR:
                this.onPropertyInspectorDidDisappear(context, action, device);
                break;
            case EventsReceived.SEND_TO_PLUGIN:
                this.onSendToPlugin(context, payload, action, device);
                break;
        }
    }

    // Event handlers - override these in your plugin
    onConnected() {}
    onDisconnected() {}
    onError(error) {}
    onSettings(context, settings, coordinates, isInMultiAction) {}
    onGlobalSettings(settings) {}
    onKeyDown(context, settings, coordinates, userDesiredState, state, isInMultiAction) {}
    onKeyUp(context, settings, coordinates, userDesiredState, state, isInMultiAction) {}
    onWillAppear(context, settings, coordinates, action, device, isInMultiAction) {}
    onWillDisappear(context, settings, coordinates, action, device, isInMultiAction) {}
    onTitleParametersDidChange(context, title, titleParameters, state) {}
    onDeviceDidConnect(device, deviceInfo) {}
    onDeviceDidDisconnect(device) {}
    onApplicationDidLaunch(application) {}
    onApplicationDidTerminate(application) {}
    onSystemDidWakeUp() {}
    onPropertyInspectorDidAppear(context, action, device) {}
    onPropertyInspectorDidDisappear(context, action, device) {}
    onSendToPlugin(context, payload, action, device) {}

    // Helper methods for common actions
    setSettings(context, settings) {
        this.send({
            event: EventsSent.SET_SETTINGS,
            context: context,
            payload: settings
        });
    }

    getSettings(context) {
        this.send({
            event: EventsSent.GET_SETTINGS,
            context: context
        });
    }

    setGlobalSettings(settings) {
        this.send({
            event: EventsSent.SET_GLOBAL_SETTINGS,
            context: this.pluginUUID,
            payload: settings
        });
    }

    getGlobalSettings() {
        this.send({
            event: EventsSent.GET_GLOBAL_SETTINGS,
            context: this.pluginUUID
        });
    }

    openUrl(url) {
        this.send({
            event: EventsSent.OPEN_URL,
            payload: {
                url: url
            }
        });
    }

    logMessage(message) {
        this.send({
            event: EventsSent.LOG_MESSAGE,
            payload: {
                message: message
            }
        });
    }

    setTitle(context, title, target = DestinationEnum.HARDWARE_AND_SOFTWARE, state = null) {
        const payload = {
            title: title,
            target: target
        };
        if (state !== null) {
            payload.state = state;
        }
        this.send({
            event: EventsSent.SET_TITLE,
            context: context,
            payload: payload
        });
    }

    setImage(context, image, target = DestinationEnum.HARDWARE_AND_SOFTWARE, state = null) {
        const payload = {
            image: image,
            target: target
        };
        if (state !== null) {
            payload.state = state;
        }
        this.send({
            event: EventsSent.SET_IMAGE,
            context: context,
            payload: payload
        });
    }

    setState(context, state) {
        this.send({
            event: EventsSent.SET_STATE,
            context: context,
            payload: {
                state: state
            }
        });
    }

    showAlert(context) {
        this.send({
            event: EventsSent.SHOW_ALERT,
            context: context
        });
    }

    showOk(context) {
        this.send({
            event: EventsSent.SHOW_OK,
            context: context
        });
    }

    sendToPropertyInspector(context, payload, action) {
        this.send({
            event: EventsSent.SEND_TO_PROPERTY_INSPECTOR,
            context: context,
            payload: payload,
            action: action
        });
    }
}

/**
 * Property Inspector Manager
 */
class StreamDeckPropertyInspector {
    constructor() {
        this.websocket = null;
        this.uuid = null;
        this.registerEventName = null;
        this.info = null;
        this.actionInfo = null;
    }

    connect(inPort, inPropertyInspectorUUID, inRegisterEvent, inInfo, inActionInfo) {
        this.uuid = inPropertyInspectorUUID;
        this.registerEventName = inRegisterEvent;
        this.info = inInfo ? JSON.parse(inInfo) : null;
        this.actionInfo = inActionInfo ? JSON.parse(inActionInfo) : null;

        this.websocket = new WebSocket('ws://127.0.0.1:' + inPort);

        this.websocket.onopen = () => {
            this.register();
            this.onConnected();
        };

        this.websocket.onmessage = (evt) => {
            const data = JSON.parse(evt.data);
            this.handleMessage(data);
        };

        this.websocket.onerror = (evt) => {
            console.error('WebSocket error:', evt);
            this.onError(evt);
        };

        this.websocket.onclose = (evt) => {
            console.log('WebSocket closed');
            this.onDisconnected();
        };
    }

    register() {
        const json = {
            event: this.registerEventName,
            uuid: this.uuid
        };
        this.send(json);
    }

    send(json) {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify(json));
        }
    }

    handleMessage(data) {
        const event = data.event;
        const payload = data.payload || {};

        switch (event) {
            case EventsReceived.SEND_TO_PROPERTY_INSPECTOR:
                this.onSendToPropertyInspector(payload);
                break;
        }
    }

    // Event handlers - override these
    onConnected() {}
    onDisconnected() {}
    onError(error) {}
    onSendToPropertyInspector(payload) {}

    // Helper methods
    sendToPlugin(payload) {
        this.send({
            event: EventsSent.SEND_TO_PLUGIN,
            action: this.actionInfo.action,
            context: this.uuid,
            payload: payload
        });
    }

    setSettings(settings) {
        this.send({
            event: EventsSent.SET_SETTINGS,
            context: this.uuid,
            payload: settings
        });
    }

    getSettings() {
        this.send({
            event: EventsSent.GET_SETTINGS,
            context: this.uuid
        });
    }

    setGlobalSettings(settings) {
        this.send({
            event: EventsSent.SET_GLOBAL_SETTINGS,
            context: this.uuid,
            payload: settings
        });
    }

    getGlobalSettings() {
        this.send({
            event: EventsSent.GET_GLOBAL_SETTINGS,
            context: this.uuid
        });
    }

    openUrl(url) {
        this.send({
            event: EventsSent.OPEN_URL,
            payload: {
                url: url
            }
        });
    }
}

// Export for use in plugins
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StreamDeckPlugin,
        StreamDeckPropertyInspector,
        DestinationEnum,
        EventsReceived,
        EventsSent
    };
}
