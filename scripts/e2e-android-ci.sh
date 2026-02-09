#!/usr/bin/env bash
set -euxo pipefail

cd example/app

mkdir -p /tmp/e2e-debug
cleanup() {
  kill "${METRO_PID:-}" >/dev/null 2>&1 || true
  cp -f /tmp/metro.log /tmp/e2e-debug/metro.log || true
  cp -f /tmp/maestro.log /tmp/e2e-debug/maestro.log || true
  adb logcat -d > /tmp/e2e-debug/android-logcat.txt || true
  adb exec-out screencap -p > /tmp/e2e-debug/final-emulator-screen.png || true
}
trap cleanup EXIT

npx react-native run-android --mode debug --no-packager --active-arch-only

npx expo start --port 8081 > /tmp/metro.log 2>&1 &
METRO_PID=$!

for i in $(seq 1 60); do
  if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
    echo "Metro is ready"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Metro failed to start in time"
    exit 1
  fi
  echo "Waiting for Metro... ($i/60)"
  sleep 2
done

BUNDLE_URL='http://127.0.0.1:8081/node_modules/expo-router/entry.bundle?platform=android&dev=true&hot=false&lazy=true&transform.engine=hermes&transform.bytecode=1&transform.routerRoot=app&unstable_transformProfile=hermes-stable'
for i in $(seq 1 60); do
  if curl -sf "$BUNDLE_URL" -o /dev/null; then
    echo "Android bundle is ready"
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Timed out waiting for Android bundle"
    exit 1
  fi
  echo "Waiting for Android bundle... ($i/60)"
  sleep 2
done

adb shell am force-stop "$E2E_APP_ID" || true
maestro test -e APP_ID="$E2E_APP_ID" "$GITHUB_WORKSPACE/e2e/" | tee /tmp/maestro.log
