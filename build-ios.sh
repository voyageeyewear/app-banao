#!/bin/bash

echo ""
echo "=========================================="
echo "   GoEye Store - iOS Builder v1.0"
echo "   Always uses mobile-app.html"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Validate Build Environment
print_step "1/6 - Validating Build Environment"

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    print_error "Xcode is not installed or not in PATH"
    exit 1
fi

# Check if iOS simulator is available
if ! xcrun simctl list &> /dev/null; then
    print_error "iOS Simulator is not available"
    exit 1
fi

print_success "Environment validation passed"

# Step 2: Setup Mobile App Files with Slider Data
print_step "2/6 - Setting up Mobile App Files with Slider Data"
print_info "Injecting current slider data into mobile-app.html..."

# Run the slider data injection script
if [ -f "inject-slider-data.js" ]; then
    node inject-slider-data.js
    if [ $? -eq 0 ]; then
        print_success "Slider data injection completed"
    else
        print_error "Slider data injection failed"
        exit 1
    fi
else
    print_info "No slider injection script found, using mobile-app.html as-is"
fi

print_success "Mobile app files setup complete"
print_info "Primary file: mobile-app.html → index.html"

# Step 3: Update Capacitor Configuration
print_step "3/6 - Updating Capacitor Configuration"

# Create timestamp for app version
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
APP_NAME="GoEye-Store-${TIMESTAMP}"

# Update capacitor.config.ts with app name
if [ -f "capacitor.config.ts" ]; then
    sed -i '' "s/appName: .*/appName: '${APP_NAME}',/" capacitor.config.ts
fi

print_success "Capacitor configuration updated"

# Step 4: Sync iOS Platform
print_step "4/6 - Syncing iOS Platform"
print_info "Syncing web assets to iOS platform..."

npx cap sync ios
if [ $? -eq 0 ]; then
    print_success "iOS platform synced successfully"
else
    print_error "iOS platform sync failed"
    exit 1
fi

# Step 5: Update iOS Configuration
print_step "5/6 - Updating iOS Configuration"

# Update app name in Info.plist
INFO_PLIST="ios/App/App/Info.plist"
if [ -f "$INFO_PLIST" ]; then
    # Update CFBundleDisplayName
    /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName ${APP_NAME}" "$INFO_PLIST" 2>/dev/null || \
    /usr/libexec/PlistBuddy -c "Add :CFBundleDisplayName string ${APP_NAME}" "$INFO_PLIST"
    
    print_info "Updated app name in Info.plist"
fi

print_success "iOS configuration updated"

# Step 6: Prepare iOS App for Building
print_step "6/6 - Preparing iOS App for Building"

# Clean previous builds
print_info "Cleaning previous builds..."
cd ios/App
xcodebuild clean -workspace App.xcworkspace -scheme App -configuration Debug

print_success "iOS project prepared successfully!"

echo ""
echo "🎉 iOS PROJECT SETUP COMPLETED! 🎉"
echo ""
echo "📱 iOS App Details:"
echo "   📄 Project: ${APP_NAME}"
echo "   📍 Location: ios/App/App.xcworkspace"
echo "   📊 Platform: iOS"
echo ""
echo "✅ Features Included:"
echo "   🎯 Primary file: mobile-app.html"
echo "   🏪 Real products from Shopify"
echo "   📱 Collections with real data"
echo "   🎨 Modern mobile UI"
echo "   📱 Responsive design"
echo "   🔄 Auto-refresh system"
echo "   📐 Safe area insets"
echo "   🍎 iOS Safe Area support"
echo ""
echo "🚀 Next Steps - Complete iOS Build:"
echo ""
echo "   1️⃣ Open Xcode:"
echo "      npx cap open ios"
echo ""
echo "   2️⃣ Configure Code Signing:"
echo "      • Select your project in Xcode"
echo "      • Go to 'Signing & Capabilities' tab"
echo "      • Select your Apple Developer Team"
echo "      • Choose a Bundle Identifier"
echo ""
echo "   3️⃣ Build Options:"
echo "      📲 iOS Simulator: Cmd+R to run in simulator"
echo "      📱 iOS Device: Connect device and select it as destination"
echo "      📦 Archive: Product → Archive for App Store/TestFlight"
echo ""
echo "   4️⃣ Testing:"
echo "      • All navigation features work (All, Classic, Premium, Prescription, New Tab)"
echo "      • Auto-refresh every 15 seconds"
echo "      • Real Shopify products and collections"
echo "      • Status bar safe area implemented"
echo ""
echo "💡 iOS Development Requirements:"
echo "   • Apple Developer Account (free for device testing)"
echo "   • Xcode 15+ installed"
echo "   • macOS required for iOS development"
echo ""
echo "✨ Setup completed on $(date)"
echo ""
echo "🎯 Ready for iOS deployment!" 