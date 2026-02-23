import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';

export function generateOpenSUSEScript(packages: PackageInfo[]): string {
    return generateAsciiHeader('openSUSE', packages.length) + generateSharedUtils('opensuse', packages.length) + `
is_installed() { rpm -q "$1" &>/dev/null; }

install_pkg() {
    local name=$1 pkg=$2
    CURRENT=$((CURRENT + 1))

    if is_installed "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi

    local start=$(date +%s)

    with_retry sudo zypper --non-interactive install --auto-agree-with-licenses "$pkg" &
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

[ "$EUID" -eq 0 ] && { error "Do not run as root."; exit 1; }
command -v zypper &>/dev/null || { error "zypper not found"; exit 1; }

info "Caching sudo credentials..."
sudo -v || exit 1
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

if [ -f /run/zypp.pid ]; then
    wait_for_lock /run/zypp.pid
elif [ -f /var/run/zypp.pid ]; then
    wait_for_lock /var/run/zypp.pid
fi

info "Refreshing repositories..."
with_retry sudo zypper --non-interactive refresh &
if animate_progress "Refreshing..." $!; then
    printf "\\r\\033[K" >&3
    success "Refreshed"
else
    printf "\\r\\033[K" >&3
    warn "Refresh failed, continuing..."
fi

echo >&3
info "Installing $TOTAL packages"
echo >&3

${packages.map(({ app, pkg }) => `install_pkg "${escapeShellString(app.name)}" "${pkg}"`).join('\n')}

print_summary
`;
}
