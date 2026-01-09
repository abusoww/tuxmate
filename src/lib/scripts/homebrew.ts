// Homebrew script - brew with cask support for macOS + formulae for both platforms

import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';

export function generateHomebrewScript(packages: PackageInfo[]): string {
    return generateAsciiHeader('Homebrew', packages.length) + generateSharedUtils(packages.length) + `
# Platform detection
IS_MACOS=false
if [[ "$OSTYPE" == "darwin"* ]]; then
    IS_MACOS=true
fi

# Safety check: Homebrew should not be run as root
if [ "$EUID" -eq 0 ]; then
    error "Homebrew should not be run as root. Please run as a normal user."
    exit 1
fi

is_installed() {
    local type=$1
    local pkg=$2
    # brew list returns 0 if installed, 1 if not. Suppress output.
    # We use grep -Fxq for exact line matching to handle regex chars in names
    if [ "$type" == "--cask" ]; then
        brew list --cask 2>/dev/null | grep -Fxq "$pkg"
    else
        brew list --formula 2>/dev/null | grep -Fxq "$pkg"
    fi
}

install_package() {
    local name=$1
    local pkg=$2
    local type=$3 # "" (formula) or "--cask"
    
    CURRENT=$((CURRENT + 1))
    
    # Casks are macOS only
    if [ "$type" == "--cask" ] && [ "$IS_MACOS" = false ]; then
        # Silent skip or minimal output for cleaner Linux logs?
        # Using minimal output to let user know it was skipped intentionally
        printf "\\r\\033[K\${YELLOW}○\${NC} %s \${DIM}(cask skipped on Linux)\${NC}\\n" "$name"
        SKIPPED+=("$name")
        return 0
    fi
    
    if is_installed "$type" "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi
    
    show_progress $CURRENT $TOTAL "$name"
    local start=$(date +%s)
    
    # Construct brew command
    local cmd="brew install"
    if [ "$type" == "--cask" ]; then
        cmd="brew install --cask"
    fi
    
    local output
    if output=$(with_retry $cmd "$pkg" 2>&1); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        
        # Friendly error messages
        if echo "$output" | grep -q "No available formula"; then
            echo -e "    \${DIM}Formula not found\${NC}"
        elif echo "$output" | grep -q "No Cask with this name"; then
             echo -e "    \${DIM}Cask not found\${NC}"
        fi
        
        FAILED+=("$name")
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#  Pre-flight
# ─────────────────────────────────────────────────────────────────────────────

command -v brew &>/dev/null || { 
    error "Homebrew not found. Install from https://brew.sh"
    exit 1 
}

if [ "$IS_MACOS" = true ]; then
    info "Detected macOS - casks enabled"
else
    info "Detected Linux - formulae only (casks will be skipped)"
fi

info "Updating Homebrew..."
# Run update silently; on error warn but continue (network flakes shouldn't block install)
brew update >/dev/null 2>&1 && success "Updated" || warn "Update failed, continuing..."

# ─────────────────────────────────────────────────────────────────────────────
#  Installation
# ─────────────────────────────────────────────────────────────────────────────

echo
info "Installing $TOTAL packages"
echo

${packages.map(({ app, pkg }) => {
        if (pkg.startsWith('--cask ')) {
            const caskName = pkg.replace('--cask ', '');
            return `install_package "${escapeShellString(app.name)}" "${caskName}" "--cask"`;
        }
        return `install_package "${escapeShellString(app.name)}" "${pkg}" ""`;
    }).join('\n')}

print_summary
`;
}
