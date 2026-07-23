#!/usr/bin/env bash

set -euo pipefail

SDK_VERSION="${1:-}"

case "$SDK_VERSION" in
  54|55|56|57) ;;
  *)
    echo "Usage: $0 <54|55|56|57>" >&2
    exit 2
    ;;
esac

REPOSITORY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_ROOT="${PACKED_EXPO_WORK_ROOT:-${TMPDIR:-/tmp}/rnrc-packed-expo-consumer}"
CONSUMER_DIR="$WORK_ROOT/sdk-$SDK_VERSION"
TARBALL_DIR="$WORK_ROOT/tarballs"

rm -rf "$CONSUMER_DIR" "$TARBALL_DIR"
mkdir -p "$TARBALL_DIR"

cd "$REPOSITORY_ROOT"
npm pack --pack-destination "$TARBALL_DIR"
yarn package:check
TARBALL_PATH="$(find "$TARBALL_DIR" -maxdepth 1 -type f -name '*.tgz' -print -quit)"

if [[ -z "$TARBALL_PATH" ]]; then
  echo "npm pack did not produce a tarball" >&2
  exit 1
fi

CI=1 npx --yes create-expo-app@4.0.0 "$CONSUMER_DIR" \
  --template "blank-typescript@sdk-$SDK_VERSION" \
  --yes \
  --no-install \
  --no-agents-md

cd "$CONSUMER_DIR"

if [[ "$SDK_VERSION" == "56" ]]; then
  # expo-modules-autolinking@56.0.21 currently requires an unpublished
  # @expo/require-utils@^56.1.6. Keep this compatibility fixture on the last
  # complete SDK 56 dependency set until the upstream package is available.
  npm pkg set overrides.expo-modules-autolinking=56.0.20
fi

npm install
npx expo install \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-worklets \
  react-dom \
  react-native-web \
  @expo/metro-runtime
npm install --save "$TARBALL_PATH"
cp "$REPOSITORY_ROOT/e2e/fixtures/packed-expo/App.tsx" App.tsx

npx expo install --fix
npx tsc --noEmit
npx expo install --check
npx --yes expo-doctor@1.20.1
CI=1 npx expo export --platform web --output-dir dist-web --clear
CI=1 npx expo prebuild --platform android --clean

cd android
NODE_ENV=development ./gradlew :app:assembleDebug \
  -PreactNativeArchitectures=arm64-v8a \
  --no-daemon
