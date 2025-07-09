# Android Development Setup Guide

## Quick Setup for Running APK in Emulator

### Step 1: Install Android Studio

1. **Download Android Studio:**
   - Go to https://developer.android.com/studio
   - Download Android Studio for macOS
   - Install the `.dmg` file

2. **Launch Android Studio:**
   - Open Android Studio
   - Follow the setup wizard
   - Accept all licenses
   - Let it download the Android SDK components

### Step 2: Set up Environment Variables

Add these to your `~/.zshrc` file:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then reload your terminal:
```bash
source ~/.zshrc
```

### Step 3: Create an Android Virtual Device (AVD)

1. **Open AVD Manager:**
   - In Android Studio, go to `Tools > AVD Manager`
   - Click "Create Virtual Device"

2. **Choose Device:**
   - Select "Phone" category
   - Choose "Pixel 7" or similar modern device
   - Click "Next"

3. **Select System Image:**
   - Choose "API 34" (Android 14) or latest available
   - Download if needed
   - Click "Next"

4. **Configure AVD:**
   - Name: "Pixel_7_API_34"
   - Click "Finish"

### Step 4: Start Emulator and Install APK

1. **Start the emulator:**
   ```bash
   emulator -avd Pixel_7_API_34
   ```

2. **Install the APK:**
   ```bash
   adb install app-banao-debug.apk
   ```

3. **Launch the app:**
   The app will appear in the emulator's app drawer as "App Banao"

## Alternative: Using Command Line Only

If you prefer command line setup:

### Install Android SDK via Homebrew
```bash
brew install android-sdk
brew install android-platform-tools
```

### Create and run emulator
```bash
# List available system images
sdkmanager --list

# Install system image
sdkmanager "system-images;android-34;google_apis;x86_64"

# Create AVD
avdmanager create avd -n test_avd -k "system-images;android-34;google_apis;x86_64"

# Start emulator
emulator -avd test_avd
```

## Troubleshooting

### Common Issues:

1. **"adb: command not found"**
   - Make sure ANDROID_HOME is set correctly
   - Restart terminal after adding to ~/.zshrc

2. **"No emulators available"**
   - Create an AVD in Android Studio first
   - Make sure emulator is in PATH

3. **"Installation failed"**
   - Make sure emulator is running
   - Try: `adb devices` to see connected devices

### Verify Installation:
```bash
# Check if ADB is working
adb version

# List connected devices
adb devices

# List installed packages
adb shell pm list packages | grep banao
```

## Running Your App

Once everything is set up:

1. **Build APK:** `./build-apk.sh`
2. **Start emulator:** `emulator -avd Pixel_7_API_34`
3. **Install APK:** `adb install app-banao-debug.apk`
4. **Launch app:** Look for "App Banao" in the emulator

Your app will show:
- Header: "Goeye"
- Announcement: "Hello Hello"
- Products from tryongoeye.myshopify.com or demo products
- Beautiful responsive design 