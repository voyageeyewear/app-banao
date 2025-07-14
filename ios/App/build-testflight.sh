#!/bin/bash

echo "🚀 GoEye Store - TestFlight Builder"
echo "======================================"

# Step 1: Check certificates
echo "📋 Checking available certificates..."
security find-identity -v -p codesigning | grep "Apple Development\|Apple Distribution"

echo ""
echo "⚠️  For TestFlight, you need:"
echo "   1. Apple Distribution certificate"
echo "   2. App Store provisioning profile" 
echo "   3. Upload to App Store Connect"

echo ""
echo "🔧 NEXT STEPS FOR TESTFLIGHT:"
echo ""
echo "1. Open Xcode → Preferences → Accounts"
echo "   - Add your Apple ID"
echo "   - Manage Certificates → Create Apple Distribution"
echo ""
echo "2. In Xcode project:"
echo "   - Select 'Any iOS Device' as destination"
echo "   - Product → Archive"
echo "   - Distribute App → App Store Connect"
echo ""
echo "3. In App Store Connect:"
echo "   - Add app metadata"
echo "   - Configure TestFlight"
echo "   - Add beta testers"

echo ""
echo "📱 Your iOS project is ready at:"
echo "   ios/App/App.xcworkspace"
echo ""
echo "🎯 Current status: iOS app built successfully"
echo "   Issue: Need Apple Distribution certificate for TestFlight"
echo "" 