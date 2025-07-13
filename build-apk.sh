#!/bin/bash

# ========================================
# GoEye Store - Automated APK Builder
# Always uses mobile-app.html as primary mobile app file
# ========================================

set -e  # Exit on any error

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Banner
echo -e "${GREEN}"
echo "=========================================="
echo "   GoEye Store - APK Builder v2.0"
echo "   Always uses mobile-app.html"
echo "=========================================="
echo -e "${NC}"

# Create timestamp for unique APK naming
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APK_NAME="GoEye-Store-${TIMESTAMP}.apk"

# ========================================
# STEP 1: Validate Environment
# ========================================
log_step "1/7 - Validating Build Environment"

# Check if we're in the right directory
if [ ! -f "capacitor.config.ts" ]; then
    log_error "capacitor.config.ts not found! Please run this script from the project root directory."
    exit 1
fi

# Check if mobile-app.html exists
if [ ! -f "build/client/mobile-app.html" ]; then
    log_error "mobile-app.html not found at build/client/mobile-app.html!"
    log_error "This is the primary mobile application file and is required."
    exit 1
fi

# Check required tools
if ! command -v npx &> /dev/null; then
    log_error "npx is not installed. Please install Node.js and npm."
    exit 1
fi

log_success "Environment validation passed"

# ========================================
# STEP 2: Setup Mobile App File with Data Injection
# ========================================
log_step "2/7 - Setting up Mobile App Files with Slider Data"

# Ensure build/client directory exists
mkdir -p build/client

# Inject current slider data into mobile-app.html
log_info "Injecting current slider data into mobile-app.html..."
if [ -f "inject-slider-data.cjs" ]; then
    node inject-slider-data.cjs
    if [ $? -eq 0 ]; then
        log_success "Slider data injection completed"
    else
        log_warning "Slider data injection failed, using original file"
        # Fallback: copy original file
        cp build/client/mobile-app.html build/client/index.html
    fi
else
    log_warning "inject-slider-data.cjs not found, using original mobile-app.html"
    # ALWAYS use mobile-app.html as the primary mobile application file
    log_info "Using mobile-app.html as primary mobile application file"
    cp build/client/mobile-app.html build/client/index.html
fi

# Verify the copy was successful
if [ ! -f "build/client/index.html" ]; then
    log_error "Failed to copy mobile-app.html to index.html"
    exit 1
fi

log_success "Mobile app files setup complete"
log_info "Primary file: mobile-app.html → index.html"

# ========================================
# STEP 3: Update Capacitor Configuration
# ========================================
log_step "3/7 - Updating Capacitor Configuration"

# Create optimized capacitor.config.ts
cat > capacitor.config.ts << 'EOF'
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.goeye.store',
  appName: 'GoEye Store',
  webDir: 'build/client',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#667eea",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#667eea'
    }
  }
};

export default config;
EOF

log_success "Capacitor configuration updated"

# ========================================
# STEP 4: Sync Android Platform
# ========================================
log_step "4/7 - Syncing Android Platform"

# Add android platform if not exists
if [ ! -d "android" ]; then
    log_info "Adding Android platform..."
    npx cap add android
fi

# Sync the web assets to Android
log_info "Syncing web assets to Android platform..."
npx cap sync android

if [ $? -ne 0 ]; then
    log_error "Failed to sync Android platform"
    exit 1
fi

log_success "Android platform synced successfully"

# ========================================
# STEP 5: Update Android Configuration
# ========================================
log_step "5/7 - Updating Android Configuration"

# Update app name in strings.xml
STRINGS_FILE="android/app/src/main/res/values/strings.xml"
if [ -f "$STRINGS_FILE" ]; then
    sed -i.bak 's/<string name="app_name">.*<\/string>/<string name="app_name">GoEye Store<\/string>/' "$STRINGS_FILE"
    rm -f "${STRINGS_FILE}.bak" 2>/dev/null || true
    log_info "Updated app name in strings.xml"
fi

# Update package name in build.gradle
BUILD_GRADLE="android/app/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
    sed -i.bak 's/applicationId ".*"/applicationId "com.goeye.store"/' "$BUILD_GRADLE"
    rm -f "${BUILD_GRADLE}.bak" 2>/dev/null || true
    log_info "Updated package name in build.gradle"
fi

# Update MainActivity.java
MAIN_ACTIVITY_DIR="android/app/src/main/java/com/goeye/store"
MAIN_ACTIVITY_FILE="$MAIN_ACTIVITY_DIR/MainActivity.java"

# Create directory if it doesn't exist
mkdir -p "$MAIN_ACTIVITY_DIR"

# Create/update MainActivity.java
cat > "$MAIN_ACTIVITY_FILE" << 'EOF'
package com.goeye.store;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {}
EOF

log_success "Android configuration updated"

# ========================================
# STEP 6: Build APK
# ========================================
log_step "6/7 - Building APK"

# Navigate to android directory
cd android

# Clean previous builds
log_info "Cleaning previous builds..."
./gradlew clean

# Build debug APK
log_info "Building debug APK..."
./gradlew assembleDebug

# Check if build was successful
if [ $? -eq 0 ]; then
    log_success "APK built successfully!"
    
    # Copy APK to root directory with timestamp
    cp app/build/outputs/apk/debug/app-debug.apk "../$APK_NAME"
    
    # Navigate back to root
    cd ..
    
    # ========================================
    # STEP 7: Build Summary
    # ========================================
    log_step "7/7 - Build Summary"
    
    echo ""
    echo -e "${GREEN}🎉 APK BUILD COMPLETED SUCCESSFULLY! 🎉${NC}"
    echo ""
    echo -e "${BLUE}📱 APK Details:${NC}"
    echo -e "   📄 File: $APK_NAME"
    echo -e "   📍 Location: $(pwd)/$APK_NAME"
    
    # Show APK size
    if [ -f "$APK_NAME" ]; then
        APK_SIZE=$(du -h "$APK_NAME" | cut -f1)
        echo -e "   📊 Size: $APK_SIZE"
    fi
    
    echo ""
    echo -e "${BLUE}✅ Features Included:${NC}"
    echo -e "   🎯 Primary file: mobile-app.html"
    echo -e "   🏪 Real products from Shopify"
    echo -e "   📱 Collections with real data"
    echo -e "   🎨 Modern mobile UI"
    echo -e "   📱 Responsive design"
    echo ""
    echo -e "${BLUE}🚀 Installation:${NC}"
    echo -e "   📲 ADB: adb install $APK_NAME"
    echo -e "   📁 Manual: Copy to device and install"
    echo ""
    echo -e "${GREEN}✨ Build completed in $(date)${NC}"
    
else
    cd ..
    log_error "APK build failed!"
    log_error "Check the error messages above for details."
    exit 1
fi 