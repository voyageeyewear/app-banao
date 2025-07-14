# iOS Setup Guide - GoEye Store Mobile App

## 🍎 Overview
This guide helps you build and deploy the GoEye Store iOS app with all the dynamic features including navigation management, announcement bar, auto-refresh, and real Shopify integration.

## 📋 Prerequisites

### Required Software
- **macOS** (iOS development only supported on Mac)
- **Xcode 15+** (available from Mac App Store)
- **Node.js 18+** 
- **Apple Developer Account** (free for device testing, paid for App Store)

### Verify Installation
```bash
# Check Xcode
xcodebuild -version

# Check Node.js
node --version
npm --version
```

## 🚀 Quick Start

### 1. Build iOS Project
```bash
# Make build script executable and run
chmod +x build-ios.sh
./build-ios.sh
```

### 2. Open in Xcode
```bash
# Open iOS project in Xcode
npx cap open ios
```

### 3. Configure Code Signing
1. Select your project in Xcode Navigator
2. Go to **"Signing & Capabilities"** tab
3. Check **"Automatically manage signing"**
4. Select your **Apple Developer Team**
5. Choose a unique **Bundle Identifier** (e.g., `com.yourcompany.goeye-store`)

### 4. Build and Run
- **iOS Simulator**: Press `Cmd+R` or click ▶️ button
- **iOS Device**: Connect device via USB, select it as destination, then `Cmd+R`

## 🎯 Features Included

### ✅ Dynamic Navigation
- **Admin Controlled**: All, Classic, Premium + custom tabs
- **API Integration**: Loads from `/api/header-settings`
- **Live Updates**: No app rebuild needed
- **Fallback**: Hardcoded navigation if API fails

### ✅ Auto-Refresh System
- **15-second intervals**: Automatic content refresh
- **Focus refresh**: Updates when app regains focus
- **Manual retry**: User-triggered refresh buttons
- **Multiple endpoints**: Fallback API system

### ✅ Announcement Bar
- **Auto-scroll**: Configurable scroll speed
- **Admin managed**: Text, colors, enable/disable
- **Responsive**: Adapts to content length

### ✅ Real Shopify Integration
- **47 Products**: Real product data from your store
- **4 Collections**: Actual collection structure
- **Live inventory**: Current pricing and availability
- **Images**: High-quality product photos

### ✅ iOS-Specific Features
- **Safe Area Support**: Proper iPhone notch/Dynamic Island handling
- **Native Performance**: Capacitor-based native wrapper
- **iOS Design Guidelines**: Follows Apple Human Interface Guidelines

## 📱 Testing Checklist

### Navigation Testing
- [ ] All 5 navigation items display (All, Classic, Premium, Prescription, New Tab)
- [ ] Custom navigation items from admin appear
- [ ] Navigation updates without app restart
- [ ] Fallback navigation works if API fails

### Auto-Refresh Testing
- [ ] Content refreshes every 15 seconds
- [ ] App refresh when returning from background
- [ ] Manual refresh buttons work
- [ ] Console logs show refresh activity

### Content Testing
- [ ] Real products load from Shopify
- [ ] Collections display correctly
- [ ] Images load properly
- [ ] Pricing shows in correct currency

### iOS-Specific Testing
- [ ] Status bar doesn't overlap content
- [ ] Safe area respected on all iPhone models
- [ ] App works in both portrait and landscape
- [ ] Smooth scrolling and animations

## 🔧 Advanced Configuration

### Custom Bundle Identifier
1. In Xcode, select your project
2. Change **Bundle Identifier** to your domain
3. Example: `com.yourstore.goeye-app`

### App Icons and Splash Screen
- Replace icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Update splash screen in `ios/App/App/Assets.xcassets/Splash.imageset/`

### App Store Preparation
```bash
# Create archive for distribution
# In Xcode: Product → Archive
# Then use Organizer to upload to App Store Connect
```

## 🚀 Deployment Options

### 1. Development Testing
- **iOS Simulator**: Free, no Apple ID needed
- **Connected Device**: Requires free Apple Developer account

### 2. TestFlight Beta
- **Requirements**: Paid Apple Developer account ($99/year)
- **Process**: Archive → Upload → TestFlight → Invite testers

### 3. App Store Release
- **Requirements**: Paid Apple Developer account + App Store review
- **Process**: Archive → Upload → App Store Review → Release

## 🔄 Update Workflow

### Content Updates (No Rebuild Needed)
1. Update content via admin interface
2. Changes appear in app within 15 seconds
3. Navigation, announcements, products update automatically

### App Updates (Requires Rebuild)
1. Update code/features
2. Run `./build-ios.sh`
3. Build and test in Xcode
4. Deploy via TestFlight or App Store

## 🐛 Troubleshooting

### Code Signing Issues
```
Error: "Signing for 'App' requires a development team"
```
**Solution**: Configure Apple Developer Team in Xcode Signing & Capabilities

### Build Failures
```
Error: "No matching destinations found"
```
**Solution**: Select a valid simulator or connected device as build destination

### API Not Loading
```
"Unable to load collections/products"
```
**Solution**: Check network connection and API URL in mobile-app.html

### Safe Area Issues
```
Content appears under status bar
```
**Solution**: Verify safe area insets are properly implemented (should be automatic)

## 📞 Support

### Development Help
- Check Xcode console for detailed error messages
- Use iOS Simulator for testing without physical device
- Test on multiple iOS versions if targeting older devices

### API Integration
- Verify production API URL in `mobile-app.html`
- Test API endpoints manually: `https://your-domain/api/header-settings`
- Check admin interface for navigation and content settings

## 🎉 Success Metrics

### Performance Indicators
- ✅ App launches in under 3 seconds
- ✅ Content loads within 5 seconds
- ✅ Navigation responsive to touches
- ✅ Smooth scrolling on all screens

### Feature Verification
- ✅ All 5 navigation items working
- ✅ Auto-refresh every 15 seconds
- ✅ Real Shopify products displaying
- ✅ Status bar safe area working
- ✅ Admin changes reflect immediately

---

## 📋 Quick Commands Reference

```bash
# Setup iOS project
./build-ios.sh

# Open in Xcode
npx cap open ios

# Sync changes to iOS
npx cap sync ios

# Clean and rebuild
npx cap clean ios && npx cap sync ios
```

**🎯 Ready to deploy your GoEye Store iOS app!** 