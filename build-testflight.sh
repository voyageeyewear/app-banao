#!/bin/bash

# TestFlight Build Script for Goeye Store
# This script builds and prepares the iOS app for TestFlight distribution

set -e

echo "🚀 Starting TestFlight build for Goeye Store..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Goeye Store"
BUNDLE_ID="com.goeye.store"
SCHEME="App"
WORKSPACE="App.xcworkspace"
ARCHIVE_PATH="build/GoEye-Store-TestFlight.xcarchive"
EXPORT_PATH="build/export"
EXPORT_OPTIONS="ExportOptions.plist"

echo -e "${YELLOW}📱 Building $APP_NAME for TestFlight...${NC}"

# Check if we're in the correct directory
if [ ! -f "capacitor.config.ts" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf ios/App/build
rm -rf ios/App/DerivedData

# Sync Capacitor
echo -e "${YELLOW}🔄 Syncing Capacitor...${NC}"
npx cap sync ios

# Build the project
echo -e "${YELLOW}🔨 Building project...${NC}"
cd ios/App
xcodebuild clean -workspace $WORKSPACE -scheme $SCHEME -configuration Release

# Archive the project
echo -e "${YELLOW}📦 Creating archive...${NC}"
xcodebuild archive \
    -workspace $WORKSPACE \
    -scheme $SCHEME \
    -configuration Release \
    -archivePath $ARCHIVE_PATH \
    -destination 'generic/platform=iOS' \
    CODE_SIGN_IDENTITY="Apple Distribution: Atul Saini (GU5JPSFKYM)" \
    DEVELOPMENT_TEAM="GU5JPSFKYM" \
    CODE_SIGN_STYLE="Manual"

# Check if archive was created successfully
if [ ! -d "$ARCHIVE_PATH" ]; then
    echo -e "${RED}❌ Archive creation failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Archive created successfully!${NC}"

# Export for App Store
echo -e "${YELLOW}📤 Exporting for App Store...${NC}"
xcodebuild -exportArchive \
    -archivePath $ARCHIVE_PATH \
    -exportPath $EXPORT_PATH \
    -exportOptionsPlist $EXPORT_OPTIONS

# Check if export was successful
if [ -f "$EXPORT_PATH/App.ipa" ]; then
    echo -e "${GREEN}🎉 TestFlight build completed successfully!${NC}"
    echo -e "${GREEN}📱 IPA file created: $EXPORT_PATH/App.ipa${NC}"
    
    # Show file info
    echo -e "${YELLOW}📊 File Information:${NC}"
    ls -lh "$EXPORT_PATH/App.ipa"
    
    # Copy to root for easy access
    cp "$EXPORT_PATH/App.ipa" "../../Goeye-Store-TestFlight.ipa"
    echo -e "${GREEN}✅ IPA copied to project root: Goeye-Store-TestFlight.ipa${NC}"
    
    echo -e "${GREEN}🚀 Ready for TestFlight upload!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Open Xcode and go to Window > Organizer"
    echo "2. Select your archive and click 'Distribute App'"
    echo "3. Choose 'App Store Connect' and follow the steps"
    echo "4. Or use: xcrun altool --upload-app -f Goeye-Store-TestFlight.ipa -u your-apple-id -p your-app-password"
else
    echo -e "${RED}❌ Export failed!${NC}"
    exit 1
fi 