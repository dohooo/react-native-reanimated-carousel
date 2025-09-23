---
"react-native-reanimated-carousel": major
---

# 🎯 Support for Expo 54 & Dynamic Sizing

## ✨ Major Features

### Dynamic Sizing Support
- **Auto-sizing**: `width` and `height` props are now optional. Carousel automatically measures container dimensions via layout

### Expo 54 Compatibility
- Full support for Expo SDK 54
- Updated dependencies for latest React Native ecosystem

## 💥 Breaking Changes

### Dependencies Update Required
- **react-native-reanimated**: Upgrade to `^4.1.0` (was `^3.0.0`)
- **react-native-worklets**: New peer dependency `^0.5.1` required
- **react-native-gesture-handler**: Minimum version `^2.9.0` (no breaking changes)

### Migration Steps
1. Upgrade Reanimated: `npm install react-native-reanimated@^4.1.0`
2. Install Worklets: `npm install react-native-worklets@^0.5.1`
3. Follow Reanimated 4.0 migration guide for any breaking changes

## 🔧 Technical Improvements
- Replaced deprecated `runOnJS` with `scheduleOnRN` from react-native-worklets
- Enhanced test coverage for dynamic sizing scenarios
- Improved overscroll protection logic
- Better error handling for edge cases

## 📚 Documentation
- Updated installation guide with new dependency requirements
- Added migration guide from v4 to v5
- Enhanced examples showcasing dynamic sizing capabilities

**Fixes**: #668 - Auto height calculation support
