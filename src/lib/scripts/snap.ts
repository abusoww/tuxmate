import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';

export function generateSnapScript(packages: PackageInfo[]): string {
    return generateAsciiHeader('Snap', packages.length) + generateSharedUtils('snap', packages.length) + `
is_installed() {
    local snap_name
    snap_name=$(echo "$1" | awk '{print $1}')
    snap list 2>/dev/null | grep -q "^$snap_name "
}

install_pkg() {
    local name=$1 pkg=$2
    CURRENT=$((CURRENT + 1))

    if is_installed "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi

    local start=$(date +%s)

    # pkg is intentionally unquoted: it may contain flags like --classic
    with_retry sudo snap install $pkg &
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

command -v snap &>/dev/null || {
    error "Snap not installed"
    info "Install: sudo apt/dnf/pacman install snapd" >&3
    exit 1
}

info "Caching sudo credentials..."
sudo -v || exit 1
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

if command -v systemctl &>/dev/null && ! systemctl is-active --quiet snapd; then
    info "Starting snapd..."
    sudo systemctl enable --now snapd.socket >/dev/null 2>&1
    sudo systemctl start snapd >/dev/null 2>&1
    sleep 2
    printf "\\r\\033[K" >&3
    success "snapd started"
fi

echo >&3
info "Installing $TOTAL packages"
echo >&3

${packages.map(({ app, pkg }) => `install_pkg "${escapeShellString(app.name)}" "${pkg}"`).join('\n')}

print_summary
`;
}
