import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';

export function generateFedoraScript(packages: PackageInfo[]): string {
    return generateAsciiHeader('Fedora', packages.length) + generateSharedUtils('fedora', packages.length) + `
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

    with_retry sudo dnf install -y "$pkg" &
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
command -v dnf &>/dev/null || { error "dnf not found"; exit 1; }

info "Caching sudo credentials..."
sudo -v || exit 1
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

echo >&3
info "Installing $TOTAL packages"
echo >&3

${packages.map(({ app, pkg }) => `install_pkg "${escapeShellString(app.name)}" "${pkg}"`).join('\n')}

print_summary
`;
}
