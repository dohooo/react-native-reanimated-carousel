#!/usr/bin/env python3
"""Run a command with a timeout while streaming output to stdout and optional log file."""

from __future__ import annotations

import argparse
import subprocess
import sys
import threading
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--timeout-seconds", type=int, required=True)
    parser.add_argument("--log-file", type=Path)
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()

    command = args.command
    if command and command[0] == "--":
        command = command[1:]
    if not command:
        print("No command provided", file=sys.stderr)
        return 2

    log_handle = None
    try:
        if args.log_file is not None:
            args.log_file.parent.mkdir(parents=True, exist_ok=True)
            log_handle = args.log_file.open("w", encoding="utf-8")

        proc = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
        )

        assert proc.stdout is not None

        def stream_output() -> None:
            assert proc.stdout is not None
            for line in iter(proc.stdout.readline, ""):
                print(line, end="")
                if log_handle is not None:
                    log_handle.write(line)
            proc.stdout.close()

        output_thread = threading.Thread(target=stream_output, daemon=True)
        output_thread.start()

        timed_out = False
        try:
            return_code = proc.wait(timeout=args.timeout_seconds)
        except subprocess.TimeoutExpired:
            timed_out = True
            proc.terminate()
            try:
                proc.wait(timeout=10)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait(timeout=10)
            return_code = 124
        finally:
            output_thread.join(timeout=5)

        if timed_out:
            message = f"Command timed out after {args.timeout_seconds} seconds: {' '.join(command)}"
            print(message, file=sys.stderr)
            if log_handle is not None:
                log_handle.write(f"{message}\n")
            return 124

        return return_code
    finally:
        if log_handle is not None:
            log_handle.close()


if __name__ == "__main__":
    raise SystemExit(main())
