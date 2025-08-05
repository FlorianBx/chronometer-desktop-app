# Tempo

[![Built with Tauri](https://img.shields.io/badge/built%20with-Tauri-24C8DB?style=flat&logo=tauri)](https://tauri.app/)
[![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?style=flat&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white)](https://www.apple.com/macos/)

<img width="1512" height="38" alt="Screenshot 2025-08-05 at 12 37 34 PM" src="https://github.com/user-attachments/assets/e397d693-883f-4ee5-b828-cc561d646911" />
A minimalist desktop chronometer that lives in your macOS menu bar.


<img width="912" height="712" alt="Screenshot 2025-08-05 at 12 33 03 PM" src="https://github.com/user-attachments/assets/53241e4a-6690-4b17-9a92-9db1898a9a16" />

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
