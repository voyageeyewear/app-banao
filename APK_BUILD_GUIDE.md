# APK Build Guide

## Quick Start

To build your APK, you have several options:

### Option 1: Using the build script (Recommended)
```bash
# Build debug APK
./build-apk.sh

# Build release APK
./build-apk.sh release
```

### Option 2: Using npm scripts
```bash
# Build debug APK
npm run apk:debug

# Build release APK
npm run apk:release

# Clean build
npm run apk:clean
```

### Option 3: Manual steps
```bash
# 1. Build web app
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Build APK
cd android
./gradlew assembleDebug  # or assembleRelease
```

## Output

The APK will be generated in:
- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release: `android/app/build/outputs/apk/release/app-release.apk`

And copied to the project root as:
- `app-banao-debug.apk`
- `app-banao-release.apk`

## Installation

### Via ADB
```bash
adb install app-banao-debug.apk
```

### Manual Installation
1. Copy the APK to your Android device
2. Enable "Unknown Sources" in device settings
3. Tap the APK file to install

## App Information

- **App ID**: com.appbanao.builder
- **App Name**: App Banao
- **Features**: 
  - Real Shopify product loading
  - Beautiful demo products fallback
  - Responsive design
  - Modern UI

## Troubleshooting

### Common Issues

1. **Build fails**: Make sure you have Android SDK installed
2. **Gradle wrapper not found**: Run `chmod +x android/gradlew`
3. **Java version issues**: Use Java 11 or higher

### Requirements

- Node.js (v18+)
- Android SDK
- Java 11+
- Capacitor CLI

## Development

For development with live reload:
```bash
npm run mobile:serve
```

This will run the app on a connected device with live reload enabled. 