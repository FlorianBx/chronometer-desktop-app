# Chronometer

A minimalist desktop chronometer that lives in your macOS menu bar.

## Features

- **Menu bar integration** - Always visible timer in the status bar
- **Clean interface** - Distraction-free fullscreen timer window
- **Keyboard shortcuts** - Space to start/pause, R to reset
- **System tray controls** - Start, pause, reset directly from the menu
- **Persistent state** - Timer continues running even when the window is closed

## Technologies

- **Frontend**: Vue 3 with TypeScript and Tailwind CSS
- **Backend**: Rust with Tauri framework
- **Build tool**: Vite

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

## Usage

- **Space**: Start/Pause timer
- **R**: Reset timer
- **Close window**: Timer continues in menu bar
- **Menu bar**: Right-click for controls

The application runs as a menu bar utility and doesn't appear in the dock. Close the main window to run the timer in the background, accessible via the status bar.

## License

MIT