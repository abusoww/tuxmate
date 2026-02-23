import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';

export function generateHomebrewScript(packages: PackageInfo[]): string {
    return generateAsciiHeader('Homebrew', packages.length) + generateSharedUtils('homebrew', packages.length) + `
export HOMEBREW_NO_AUTO_UPDATE=1

IS_MACOS=false
if [[ "$OSTYPE" == "darwin"* ]]; then
    IS_MACOS=true
fi

[ "$EUID" -eq 0 ] && { error "Do not run Homebrew as root."; exit 1; }

is_installed() {
    local type=$1 pkg=$2
    if [ "$type" = "--cask" ]; then
        brew list --cask 2>/dev/null | grep -Fxq "$pkg"
    else
        brew list --formula 2>/dev/null | grep -Fxq "$pkg"
    fi
}

install_pkg() {
    local name=$1 pkg=$2 type=$3

    CURRENT=$((CURRENT + 1))

    if [ "$type" = "--cask" ] && [ "$IS_MACOS" = false ]; then
        skip "$name" "cask, macOS only"
        SKIPPED+=("$name")
        return 0
    fi

    if is_installed "$type" "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi

    local start=$(date +%s)

    local cmd="brew install"
    [ "$type" = "--cask" ] && cmd="brew install --cask"

    with_retry $cmd "$pkg" &
    local pid=$!

    if animate_progress "$name" $pid; then
        local elapsed=$(($(date +%s) - start))
        printf "\\r\\033[K" >&3
        success "$name" "\${elapsed}s"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K" >&3
        error "$name"
        FAILED+=("$name")
    fi
}

# ---------------------------------------------------------------------------

command -v brew &>/dev/null || {
    error "Homebrew not found. Install from https://brew.sh"
    exit 1
}

if [ "$IS_MACOS" = true ]; then
    info "Detected macOS" >&3
else
    info "Detected Linux (casks will be skipped)" >&3
fi

info "Updating Homebrew..."
with_retry brew update &
if animate_progress "Updating..." $!; then
    printf "\\r\\033[K" >&3
    success "Updated"
else
    printf "\\r\\033[K" >&3
    warn "Update failed, continuing..."
fi

echo >&3
info "Installing $TOTAL packages"
echo >&3

${packages.map(({ app, pkg }) => {
        if (pkg.startsWith('--cask ')) {
            const caskName = pkg.replace('--cask ', '');
            return `install_pkg "${escapeShellString(app.name)}" "${caskName}" "--cask"`;
        }
        return `install_pkg "${escapeShellString(app.name)}" "${pkg}" ""`;
    }).join('\n')}

print_summary
`;
}
