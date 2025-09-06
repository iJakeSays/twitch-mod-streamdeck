# Twitch Moderator Tools - Stream Deck Plugin

A comprehensive Stream Deck plugin that provides quick access to essential Twitch moderation features.

## Features

### Chat Moderation
- **Shield Mode** - Quickly enable/disable shield mode for your channel
- **Subscribers Only** - Toggle subscriber-only chat mode
- **Followers Only** - Toggle follower-only chat mode
- **Emotes Only** - Toggle emote-only chat mode
- **Slow Mode** - Toggle slow mode with customizable delay (default 3 seconds)

### AutoMod Management
- **Allow AutoMod** - Instantly approve the most recent message held by AutoMod

### Community Features
- **Auto Shoutout** - Automatically shoutout the most recent raider with one button press
- **Clear Rewards** - Clear all pending channel point reward redemptions

## Installation

### Prerequisites
- Stream Deck software version 5.0 or higher
- Twitch account with moderator privileges
- Twitch API credentials

### Step 1: Download and Install
1. Download the latest `.streamDeckPlugin` file from the releases page
2. Double-click the file to install it in Stream Deck

### Step 2: Configure Twitch Credentials
1. Add any of the plugin's actions to your Stream Deck
2. Click on the action to open the Property Inspector
3. Enter the following information:
   - **Twitch Channel**: Your channel name (without the @ symbol)
   - **OAuth Token**: Click "Get Token" to generate one via Twitch
   - **Broadcaster ID**: The channel owner's user ID
   - **Moderator ID**: Your Twitch user ID

### Step 3: Getting Your IDs
To find your Broadcaster and User IDs:
1. Visit [Twitch Username to ID Converter](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/)
2. Enter the usernames to get the corresponding IDs
3. Or use the Twitch API directly with your OAuth token

## Usage

### Button States
Each button displays its current state:
- **ON/OFF** indicators for toggle features
- **Status messages** for action confirmations
- **Error alerts** for failed operations

### Customization
Access the Property Inspector for each button to customize:
- **Shield Mode Duration**: 1-1800 seconds
- **Follower Mode Duration**: 0-129600 minutes
- **Slow Mode Delay**: 1-120 seconds

## API Requirements

This plugin requires a Twitch application with the following OAuth scopes:
- `moderator:manage:shield_mode` - For Shield Mode
- `moderator:manage:automod` - For AutoMod management
- `channel:manage:redemptions` - For reward queue management
- `moderator:manage:chat_settings` - For chat mode controls
- `chat:edit` - For sending commands
- `chat:read` - For reading chat events

## Troubleshooting

### Buttons show alert/error
- Verify your OAuth token is valid and has the required scopes
- Check that your Broadcaster and Moderator IDs are correct
- Ensure you have moderator privileges in the channel

### Auto Shoutout not working
- The plugin monitors for raids in real-time
- Ensure the plugin is running when a raid occurs
- The most recent raider is stored for the session

### Commands not executing
- Verify your OAuth token hasn't expired
- Check your internet connection
- Ensure the Twitch API services are operational

## File Structure

```
com.twitchmod.streamdeck.sdPlugin/
├── manifest.json              # Plugin configuration
├── plugin/
│   ├── main.html             # Main plugin logic
│   └── libs/
│       ├── js/
│       │   ├── stream-deck.js
│       │   └── utils.js
├── pi/
│   ├── pi.html               # Property Inspector
│   ├── css/
│   │   └── sdpi.css         # Property Inspector styles
│   └── js/
│       └── property-inspector.js
├── icons/
│   ├── plugin.png            # Plugin icon (20x20, 40x40)
│   ├── plugin@2x.png
│   ├── category.png          # Category icon (28x28, 56x56)
│   ├── category@2x.png
│   ├── shield.png            # Action icons (20x20, 40x40, 72x72, 144x144)
│   ├── shield@2x.png
│   ├── subscribers.png
│   ├── subscribers@2x.png
│   ├── followers.png
│   ├── followers@2x.png
│   ├── emotes.png
│   ├── emotes@2x.png
│   ├── slow.png
│   ├── slow@2x.png
│   ├── automod.png
│   ├── automod@2x.png
│   ├── shoutout.png
│   ├── shoutout@2x.png
│   ├── rewards.png
│   └── rewards@2x.png
└── README.md
```

## Development

### Building from Source
```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Package for distribution
npm run package
```

### Adding New Features
1. Add action definition in `manifest.json`
2. Implement handler in `plugin/main.html`
3. Add configuration UI in `pi/pi.html`
4. Create appropriate icons in multiple resolutions

## Security Notes

- OAuth tokens are stored locally and encrypted by Stream Deck
- Never share your OAuth token or API credentials
- Regenerate tokens periodically for security
- The plugin only communicates with official Twitch API endpoints

## Support

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/yourusername/twitch-mod-streamdeck).

## License

MIT License - See LICENSE file for details

## Changelog

### Version 1.0.0
- Initial release
- Shield Mode toggle
- Chat mode controls (Subscribers, Followers, Emotes, Slow)
- AutoMod message approval
- Auto shoutout for recent raiders
- Channel point reward queue clearing

## Credits

Created for the Twitch streaming community to streamline moderation tasks.
