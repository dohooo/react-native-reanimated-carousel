#!/usr/bin/env zsh
# Conductor workspace setup script for react-native-reanimated-carousel
# This script initializes a new worktree by installing dependencies,
# building the library, and copying environment/config files not tracked by git.

set -e

echo "Setting up Conductor workspace..."
echo "Root path: $CONDUCTOR_ROOT_PATH"
echo "Workspace path: $CONDUCTOR_WORKSPACE_PATH"

# =============================================================================
# Reusable utility functions
# =============================================================================

# Function to copy a single file if it exists in the root worktree
copy_env_file() {
    local relative_path="$1"
    local source="$CONDUCTOR_ROOT_PATH/$relative_path"
    local dest="$CONDUCTOR_WORKSPACE_PATH/$relative_path"

    if [ -f "$source" ]; then
        # Create parent directory if it doesn't exist
        mkdir -p "$(dirname "$dest")"
        cp "$source" "$dest"
        echo "  Copied: $relative_path"
    fi
}

# Function to copy/sync a directory from root to workspace
copy_dir() {
    local relative_path="$1"
    local source="$CONDUCTOR_ROOT_PATH/$relative_path"
    local dest="$CONDUCTOR_WORKSPACE_PATH/$relative_path"

    if [ ! -d "$source" ]; then
        echo "  Warning: $relative_path not found in root, skipping"
        return 0
    fi

    # Ensure parent exists
    mkdir -p "$(dirname "$dest")"

    # If dest exists but is not a directory, remove it
    if [ -e "$dest" ] && [ ! -d "$dest" ]; then
        echo "  Warning: $relative_path exists as a non-directory, removing"
        rm -f "$dest"
    fi

    # Ensure destination directory exists
    mkdir -p "$dest"

    # Sync contents (exclude git-tracked subdirectories to avoid deleting them)
    local exclude_args=()
    if [ "$relative_path" = ".claude" ]; then
        exclude_args=(--exclude='skills/')
    fi
    if ! rsync -a --delete "${exclude_args[@]}" "$source/" "$dest/"; then
        echo "  Warning: rsync failed for $relative_path (broken symlink or missing file?)"
        echo "           Continuing setup..."
        return 0
    fi

    echo "  Synced: $relative_path"
}

# =============================================================================
# Install dependencies
# =============================================================================

# Install root library dependencies
echo ""
echo "Installing root library dependencies..."
cd "$CONDUCTOR_WORKSPACE_PATH"
yarn install
echo "Root dependencies installed successfully!"

# Build the library (needed because example/app links via "link:../..")
echo ""
echo "Building library (yarn prepare)..."
cd "$CONDUCTOR_WORKSPACE_PATH"
yarn prepare
echo "Library built successfully!"

# Install example app dependencies
echo ""
echo "Installing example app dependencies..."
if [ -d "$CONDUCTOR_WORKSPACE_PATH/example/app" ]; then
    cd "$CONDUCTOR_WORKSPACE_PATH/example/app"
    yarn install
    cd "$CONDUCTOR_WORKSPACE_PATH"
    echo "Example app dependencies installed successfully!"
else
    echo "Warning: example/app directory not found, skipping"
fi

# Install example website dependencies
echo ""
echo "Installing example website dependencies..."
if [ -d "$CONDUCTOR_WORKSPACE_PATH/example/website" ]; then
    cd "$CONDUCTOR_WORKSPACE_PATH/example/website"
    yarn install
    cd "$CONDUCTOR_WORKSPACE_PATH"
    echo "Example website dependencies installed successfully!"
else
    echo "Warning: example/website directory not found, skipping"
fi

# =============================================================================
# Copy environment files (git-ignored)
# =============================================================================

echo ""
echo "Copying environment files..."

env_files_to_copy=(
    # Root env file (contains GITHUB_TOKEN, NPM_TOKEN — in .gitignore)
    ".env"

    # Example app local env files (matched by .env*.local in example/app/.gitignore)
    "example/app/.env.local"
    "example/app/.env.development.local"
    "example/app/.env.production.local"
)

for file in "${env_files_to_copy[@]}"; do
    copy_env_file "$file"
done

echo "Environment files copied successfully!"

# =============================================================================
# Copy development tool configurations (git-ignored)
# =============================================================================

echo ""
echo "Copying development tool configurations..."

# .cursorrules — project-level Cursor rules (in .gitignore)
copy_env_file ".cursorrules"

# .cursorignore — Cursor ignore patterns (in .gitignore)
copy_env_file ".cursorignore"

# CLAUDE.md — Claude Code guidance file (in .gitignore)
copy_env_file "CLAUDE.md"

# Local markdown docs (matched by *.local.md in .gitignore)
# Find and copy any .local.md files from root
if compgen -G "$CONDUCTOR_ROOT_PATH"/*.local.md > /dev/null 2>&1; then
    for f in "$CONDUCTOR_ROOT_PATH"/*.local.md; do
        local_md_name="$(basename "$f")"
        cp "$f" "$CONDUCTOR_WORKSPACE_PATH/$local_md_name"
        echo "  Copied: $local_md_name"
    done
fi

# .claude/ directory (in .gitignore)
if [ -d "$CONDUCTOR_ROOT_PATH/.claude" ]; then
    echo ""
    echo "Syncing .claude directory..."
    copy_dir ".claude"
fi

# .vscode/ directory (in .gitignore)
if [ -d "$CONDUCTOR_ROOT_PATH/.vscode" ]; then
    echo ""
    echo "Syncing .vscode directory..."
    copy_dir ".vscode"
fi

# .cursor/ directory (settings, rules, etc.)
if [ -d "$CONDUCTOR_ROOT_PATH/.cursor" ]; then
    echo ""
    echo "Syncing .cursor directory..."
    copy_dir ".cursor"
fi

# .codex/ directory (if exists)
if [ -d "$CONDUCTOR_ROOT_PATH/.codex" ]; then
    echo ""
    echo "Syncing .codex directory..."
    copy_dir ".codex"
fi

# .issue-tasks/ directory (in .gitignore)
if [ -d "$CONDUCTOR_ROOT_PATH/.issue-tasks" ]; then
    echo ""
    echo "Syncing .issue-tasks directory..."
    copy_dir ".issue-tasks"
fi

# .conductor/ directory (conductor config)
if [ -d "$CONDUCTOR_ROOT_PATH/.conductor" ]; then
    echo ""
    echo "Syncing .conductor directory..."
    copy_dir ".conductor"
fi

# =============================================================================
# Copy iOS native dependencies (CocoaPods Pods) to avoid re-installation
# =============================================================================

echo ""
echo "Copying iOS native dependencies (CocoaPods Pods)..."

# Copy example/app iOS Pods directory if it exists
if [ -d "$CONDUCTOR_ROOT_PATH/example/app/ios/Pods" ]; then
    echo "  Found Pods directory in root, copying to workspace..."
    copy_dir "example/app/ios/Pods"
    
    # Also copy Podfile.lock if it exists (ensures version consistency)
    if [ -f "$CONDUCTOR_ROOT_PATH/example/app/ios/Podfile.lock" ]; then
        copy_env_file "example/app/ios/Podfile.lock"
    fi
    
    echo "  iOS Pods copied successfully! This will skip CocoaPods installation."
else
    echo "  No Pods directory found in root, CocoaPods will install on first run."
fi

echo ""
echo "🎉 Conductor workspace setup complete!"
