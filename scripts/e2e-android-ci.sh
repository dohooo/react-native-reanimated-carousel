#!/usr/bin/env bash
set -euxo pipefail

cd example/app

mkdir -p /tmp/e2e-debug
cleanup() {
  kill "${METRO_PID:-}" >/dev/null 2>&1 || true
  cp -f /tmp/metro.log /tmp/e2e-debug/metro.log || true
  cp -f /tmp/maestro.log /tmp/e2e-debug/maestro.log || true
  cp -R /tmp/maestro-flow-logs /tmp/e2e-debug/maestro-flow-logs || true
  timeout 30 adb logcat -d > /tmp/e2e-debug/android-logcat.txt || true
  timeout 30 adb exec-out screencap -p > /tmp/e2e-debug/final-emulator-screen.png || true
}
trap cleanup EXIT

retry() {
  local max_retries="$1"
  shift
  local attempt=1
  until "$@"; do
    if [ "$attempt" -ge "$max_retries" ]; then
      echo "Command failed after ${attempt} attempts: $*"
      return 1
    fi
    attempt=$((attempt + 1))
    echo "Retrying (${attempt}/${max_retries}): $*"
    adb start-server || true
    sleep 5
  done
}

ensure_adb_device() {
  for i in $(seq 1 30); do
    state="$(adb get-state 2>/dev/null || true)"
    boot_completed="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
    if [ "$state" = "device" ] && [ "$boot_completed" = "1" ]; then
      return 0
    fi
    echo "Waiting for stable adb device... ($i/30)"
    adb reconnect offline || true
    adb start-server || true
    sleep 2
  done
  return 1
}

build_android_apk() {
  pushd android >/dev/null
  chmod +x ./gradlew
  ./gradlew --stop || true
  rm -rf app/.cxx

  python3 "$GITHUB_WORKSPACE/scripts/run_with_timeout.py" \
    --timeout-seconds 900 \
    -- \
    ./gradlew app:assembleDebug \
      -PreactNativeArchitectures=x86_64 \
      --no-daemon
  popd >/dev/null
}

retry 2 build_android_apk

ensure_adb_device
retry 3 adb install -r android/app/build/outputs/apk/debug/app-debug.apk

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

ensure_adb_device
adb reverse tcp:8081 tcp:8081 || true
adb shell am force-stop "$E2E_APP_ID" || true
MAESTRO_DEVICE_ID="$(adb devices | awk 'NR>1 && $2 == "device" && $1 ~ /emulator-/ { print $1; exit }')"
if [ -z "$MAESTRO_DEVICE_ID" ]; then
  echo "No online emulator device found for Maestro"
  exit 1
fi

MAESTRO_DEVICE="$MAESTRO_DEVICE_ID" \
MAESTRO_FLOW_TIMEOUT_SECONDS=360 \
MAESTRO_FLOW_MAX_ATTEMPTS=2 \
MAESTRO_FAIL_FAST=1 \
bash "$GITHUB_WORKSPACE/scripts/e2e-maestro-suite.sh" "$GITHUB_WORKSPACE/e2e"
