#!/usr/bin/env bash
set -euo pipefail

FLOW_DIR="${1:-${GITHUB_WORKSPACE}/e2e}"
FLOW_TIMEOUT_SECONDS="${MAESTRO_FLOW_TIMEOUT_SECONDS:-900}"
FLOW_MAX_ATTEMPTS="${MAESTRO_FLOW_MAX_ATTEMPTS:-2}"
FLOW_LOG_DIR="${MAESTRO_FLOW_LOG_DIR:-/tmp/maestro-flow-logs}"
FLOW_FAIL_FAST="${MAESTRO_FAIL_FAST:-0}"
FLOW_FILES="${MAESTRO_FLOW_FILES:-}"
FLOW_REUSE_DRIVER_BETWEEN_FLOWS="${MAESTRO_REUSE_DRIVER_BETWEEN_FLOWS:-1}"

if [ -z "${E2E_APP_ID:-}" ]; then
  echo "E2E_APP_ID is required"
  exit 1
fi

mkdir -p "$FLOW_LOG_DIR"

FLOWS=()
if [ -n "$FLOW_FILES" ]; then
  IFS=',' read -r -a requested_flows <<< "$FLOW_FILES"
  for flow in "${requested_flows[@]}"; do
    flow="${flow#"${flow%%[![:space:]]*}"}"
    flow="${flow%"${flow##*[![:space:]]}"}"
    [ -n "$flow" ] || continue

    if [[ "$flow" != *.yaml ]]; then
      flow="${flow}.yaml"
    fi
    flow_path="${FLOW_DIR}/${flow}"
    if [ ! -f "$flow_path" ]; then
      echo "Configured flow not found: $flow_path"
      exit 1
    fi
    FLOWS+=("$flow_path")
  done
else
  while IFS= read -r flow; do
    FLOWS+=("$flow")
  done < <(find "$FLOW_DIR" -maxdepth 1 -type f -name '[0-9]*.yaml' | sort)
fi

if [ "${#FLOWS[@]}" -eq 0 ]; then
  echo "No flow files found in $FLOW_DIR"
  exit 1
fi

skip_reinstall_driver=0
failed_flows=()

for flow in "${FLOWS[@]}"; do
  flow_basename="$(basename "${flow%.yaml}")"
  flow_name="$(awk -F': ' '/^name:/ {print $2; exit}' "$flow")"
  if [ -z "$flow_name" ]; then
    flow_name="$flow_basename"
  fi

  flow_passed=0
  for attempt in $(seq 1 "$FLOW_MAX_ATTEMPTS"); do
    echo "Running flow: ${flow_name} (${attempt}/${FLOW_MAX_ATTEMPTS})"

    cmd=(maestro test)
    if [ -n "${MAESTRO_DEVICE:-}" ]; then
      cmd+=(--device "$MAESTRO_DEVICE")
    fi
    if [ "$FLOW_REUSE_DRIVER_BETWEEN_FLOWS" = "1" ] && [ "$skip_reinstall_driver" -eq 1 ]; then
      cmd+=(--no-reinstall-driver)
    fi
    cmd+=(-e "APP_ID=${E2E_APP_ID}" "$flow")

    flow_log_file="${FLOW_LOG_DIR}/${flow_basename}.attempt${attempt}.log"
    if python3 "${GITHUB_WORKSPACE}/scripts/run_with_timeout.py" \
      --timeout-seconds "$FLOW_TIMEOUT_SECONDS" \
      --log-file "$flow_log_file" \
      -- \
      "${cmd[@]}"; then
      flow_passed=1
      if [ "$FLOW_REUSE_DRIVER_BETWEEN_FLOWS" = "1" ]; then
        skip_reinstall_driver=1
      fi
      break
    fi

    if [ "$FLOW_REUSE_DRIVER_BETWEEN_FLOWS" = "1" ]; then
      skip_reinstall_driver=1
    fi
    echo "Flow failed: ${flow_name} (attempt ${attempt}/${FLOW_MAX_ATTEMPTS})"
    sleep 3
  done

  if [ "$flow_passed" -ne 1 ]; then
    failed_flows+=("$flow_name")
    if [ "$FLOW_FAIL_FAST" = "1" ]; then
      echo "Fail-fast is enabled. Stopping after first failed flow: ${flow_name}"
      break
    fi
  fi
done

if [ "${#failed_flows[@]}" -gt 0 ]; then
  echo "Failed flows (${#failed_flows[@]}):"
  printf ' - %s\n' "${failed_flows[@]}"
  exit 1
fi
