# Building MOIKA DITHERER

This guide explains how to build MOIKA DITHERER for different platforms.

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [Node.js](https://nodejs.org/) (v18 or higher)
- Platform-specific tools (see below)

## Installation

```bash
# Clone the repository
git clone https://github.com/moikas-code/moikas-ditherer.git
cd moi-dither

# Install dependencies
bun install
```

## Development

```bash
# Start the development server (web version)
bun run dev

# Start Electron development mode
bun run dev:electron
```

## Building

### Build the Application

```bash
# Build all components
bun run build
```

This will:
1. Compile TypeScript for the main process
2. Build the renderer with Vite
3. Prepare the app for packaging

### Package for Current Platform

```bash
# Package for your current platform
bun run package
```

### Create Distributables

#### Build All Supported Platforms
```bash
# Build Windows and Linux packages (from Linux)
bun run dist

# Build all three platforms (only works on macOS)
bun run make:win && bun run make:mac && bun run make:linux
```

**Platform Build Matrix:**
| From Platform | Can Build For | Requirements |
|---------------|---------------|--------------|
| Windows       | Windows, Linux | WSL for Linux builds |
| Linux         | Windows, Linux | Wine/Mono for Windows |
| macOS         | Windows, Linux, macOS | Wine for Windows |

**Note:** macOS packages can ONLY be built on macOS due to Apple's code signing requirements.

#### Specific Platforms

**Windows (from any platform):**
```bash
bun run make:win
```
Creates:
- `moika_ditherer Setup.exe` (Squirrel installer)

**macOS (requires macOS):**
```bash
bun run make:mac
```
Creates:
- `MOIKA DITHERER.app.zip` (ZIP archive)
- `MOIKA DITHERER.dmg` (DMG installer)

**Linux (from Linux or macOS):**
```bash
bun run make:linux
```
Creates:
- `moika-ditherer.deb` (Debian package)
- `moika-ditherer.rpm` (RPM package)

## Platform-Specific Requirements

### Windows
- **Building on Windows:** No additional requirements
- **Cross-platform building:** Requires Wine and Mono (Linux/macOS)

To install on Linux:
```bash
# Ubuntu/Debian
sudo dpkg --add-architecture i386
sudo apt-get update
sudo apt-get install wine wine32 wine64 mono-complete

# Fedora
sudo dnf install wine mono-complete

# Arch Linux
sudo pacman -S wine mono
```

### macOS
- **Building on macOS:** No additional requirements  
- **DMG creation:** Requires macOS
- **Code signing:** Requires Apple Developer account

### Linux
- **Building on Linux:** No additional requirements
- **Debian packages:** `dpkg` and `fakeroot` (usually pre-installed)
- **RPM packages:** `rpm-build` package

```bash
# Ubuntu/Debian
sudo apt-get install rpm

# Fedora/RHEL
sudo dnf install rpm-build

# Arch Linux  
sudo pacman -S rpm-tools
```

## Output Directory

All built packages will be in `./dist/packages/` with subdirectories for each platform:
- `win32/` - Windows builds
- `darwin/` - macOS builds  
- `linux/` - Linux builds

## Testing Builds

### Before Building
```bash
# Run tests
bun test

# Type checking
bun run typecheck

# Linting
bun run lint
```

### Test Built App
```bash
# Start the built app
bun run start
```

## Troubleshooting

### Common Issues

1. **Missing native dependencies**: Some platforms may require additional native modules
2. **Icon files**: Ensure proper icon formats exist in `./public/`:
   - `icon.ico` (Windows)
   - `icon.icns` (macOS)  
   - `icon.png` (Linux)
3. **Code signing**: macOS and Windows may require code signing for distribution

### Clean Build
```bash
# Remove build artifacts
rm -rf dist/ node_modules/
bun install
bun run build
```

## Distribution

### Automated Builds with GitHub Actions

This project includes GitHub Actions workflows for automated cross-platform builds:

1. **Continuous Integration (CI)** - Runs on every push and PR:
   - Linting and type checking
   - Running tests
   - Building the application

2. **Build and Release** - Creates distributables for all platforms:
   - Triggers on tags (e.g., `v1.0.0`) or manual dispatch
   - Builds for Windows, macOS, and Linux
   - Automatically creates GitHub releases with artifacts

#### Creating a Release

1. Update version in `package.json`
2. Commit and push changes
3. Create and push a version tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
4. GitHub Actions will automatically:
   - Build for all platforms
   - Run tests
   - Create a GitHub release with all distributables

#### Manual Trigger

You can also manually trigger builds from the GitHub Actions tab in your repository.

### Manual Distribution
Generated packages can be distributed via:
- GitHub Releases (automatic with tags)
- App stores (Mac App Store, Microsoft Store, etc.)
- Direct download from your website

## Security Notes

- All builds include security fuses enabled
- ASAR archive protection is enabled
- Native module auto-unpacking is configured
- Cookie encryption is enabled
