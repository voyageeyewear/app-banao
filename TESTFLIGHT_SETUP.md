# TestFlight Configuration Guide for Goeye Store

## 🚀 Overview
This guide will help you configure Xcode for TestFlight distribution of your Goeye Store iOS app.

## 📋 Prerequisites
- ✅ Apple Developer Account (paid)
- ✅ Xcode installed
- ✅ Apple Distribution Certificate (already available)

## 🔧 Step-by-Step Configuration

### 1. App Store Connect Setup

1. **Go to App Store Connect**: https://appstoreconnect.apple.com
2. **Create new app**:
   - Click "My Apps" → "+" → "New App"
   - Platform: iOS
   - Name: "Goeye Store"
   - Bundle ID: `com.goeye.store`
   - Language: English
   - SKU: `goeye-store-ios`

### 2. Xcode Project Configuration

1. **Open Xcode project**:
   ```bash
   cd ios/App
   open App.xcworkspace
   ```

2. **Configure Signing & Capabilities**:
   - Select **App** project in navigator
   - Go to **Signing & Capabilities** tab
   - **Team**: Select "Atul Saini (GU5JPSFKYM)"
   - **Bundle Identifier**: `com.goeye.store`
   - **Signing Certificate**: "Apple Distribution: Atul Saini (GU5JPSFKYM)"

3. **Build Settings**:
   - Go to **Build Settings** tab
   - Search for "Code Signing Identity"
   - **Release**: "Apple Distribution: Atul Saini (GU5JPSFKYM)"

### 3. Provisioning Profile Setup

1. **Go to Apple Developer Portal**: https://developer.apple.com/account
2. **Create Distribution Provisioning Profile**:
   - Go to **Certificates, Identifiers & Profiles**
   - Click **Profiles** → **+** (Add)
   - Choose **App Store** under Distribution
   - Select your App ID: `com.goeye.store`
   - Select your Apple Distribution certificate
   - Name: `com.goeye.store Distribution`
   - Download and install the profile

3. **Install Profile in Xcode**:
   - Download the `.mobileprovision` file
   - Double-click to install or drag to Xcode
   - In Xcode, go to **Preferences** → **Accounts** → **Manage Certificates**
   - Verify the profile is installed

### 4. App Information

Update the following in your app:
- **Display Name**: "Goeye Store"
- **Version**: 1.0
- **Build Number**: 1
- **Bundle ID**: com.goeye.store

## 🏗️ Building for TestFlight

### Option 1: Using Build Script (Recommended)
```bash
./build-testflight.sh
```

### Option 2: Manual Xcode Build
1. **Archive the App**:
   - Select **Any iOS Device** as destination
   - Go to **Product** → **Archive**
   - Wait for archive to complete

2. **Distribute to App Store**:
   - In Organizer, select your archive
   - Click **Distribute App**
   - Choose **App Store Connect**
   - Select **Upload**
   - Choose your distribution certificate
   - Click **Upload**

### Option 3: Command Line
```bash
# Archive
xcodebuild archive \
    -workspace ios/App/App.xcworkspace \
    -scheme App \
    -configuration Release \
    -archivePath ios/App/build/GoEye-Store-TestFlight.xcarchive \
    -destination 'generic/platform=iOS' \
    CODE_SIGN_IDENTITY="Apple Distribution: Atul Saini (GU5JPSFKYM)" \
    DEVELOPMENT_TEAM="GU5JPSFKYM"

# Export
xcodebuild -exportArchive \
    -archivePath ios/App/build/GoEye-Store-TestFlight.xcarchive \
    -exportPath ios/App/build/export \
    -exportOptionsPlist ios/App/ExportOptions.plist
```

## 📤 Uploading to TestFlight

### Using Xcode Organizer
1. **Open Organizer**: Window → Organizer
2. **Select Archive**: Choose your built archive
3. **Distribute App**: Click "Distribute App"
4. **Choose Distribution**: Select "App Store Connect"
5. **Upload**: Follow the prompts to upload

### Using Command Line (Alternative)
```bash
# Using Application Loader (deprecated but still works)
xcrun altool --upload-app \
    -f Goeye-Store-TestFlight.ipa \
    -u your-apple-id@email.com \
    -p your-app-specific-password

# Or using newer transporter tool
xcrun altool --upload-app \
    -f Goeye-Store-TestFlight.ipa \
    -t ios \
    --apiKey YOUR_API_KEY \
    --apiIssuer YOUR_ISSUER_ID
```

## 🧪 TestFlight Distribution

### Internal Testing
1. **Add Internal Testers**:
   - Go to App Store Connect → TestFlight
   - Add internal testers (up to 100)
   - They'll receive email invitations

### External Testing
1. **Submit for Beta Review**:
   - Add external testers (up to 10,000)
   - Submit for Apple's beta review
   - Review takes 24-48 hours

## 🔍 Troubleshooting

### Common Issues

1. **"No matching provisioning profiles found"**:
   - Ensure you have an App Store distribution provisioning profile
   - Bundle ID must match exactly: `com.goeye.store`

2. **"Code signing failed"**:
   - Check that Apple Distribution certificate is installed
   - Verify Team ID matches: `GU5JPSFKYM`

3. **"Archive failed"**:
   - Clean build folder: Product → Clean Build Folder
   - Try running the build script: `./build-testflight.sh`

### Certificate Issues
```bash
# Check installed certificates
security find-identity -v -p codesigning

# Should show:
# "Apple Distribution: Atul Saini (GU5JPSFKYM)"
```

## 📱 App Features
Your Goeye Store app includes:
- ✅ Mobile-optimized interface
- ✅ Real Shopify integration (47 products, 4 collections)
- ✅ Dynamic navigation (All/Classic/Premium/Prescription/New Tab)
- ✅ Auto-refresh system (15-second intervals)
- ✅ Safe area insets for modern iPhones
- ✅ Cross-platform compatibility

## 🚀 Next Steps
1. Complete the Xcode configuration above
2. Run the build script: `./build-testflight.sh`
3. Upload to TestFlight using Xcode Organizer
4. Add internal testers in App Store Connect
5. Submit for external beta review if needed

## 📞 Support
If you encounter issues:
1. Check the troubleshooting section above
2. Verify all certificates and profiles are installed
3. Ensure App Store Connect app is created
4. Check Apple Developer Portal for any issues

---

**Ready to distribute your iOS app to TestFlight! 🎉** 