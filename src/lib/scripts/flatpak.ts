import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';

export function generateFlatpakScript(packages: PackageInfo[]): string {
    return generateAsciiHeader('Flatpak', packages.length) + generateSharedUtils('flatpak', packages.length) + `
is_installed() { flatpak list --app --columns=application 2>/dev/null | grep -Fxq "$1"; }

install_pkg() {
    local name=$1 appid=$2
    CURRENT=$((CURRENT + 1))

    if is_installed "$appid"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi

    local start=$(date +%s)

    with_retry flatpak install flathub -y "$appid" &
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

command -v flatpak &>/dev/null || {
    error "Flatpak not installed"
    info "Install: sudo apt/dnf/pacman install flatpak"
    exit 1
}

# We only ask for sudo if we need to add the repo, since user flatpak installs generally don't need root
if ! flatpak remotes 2>/dev/null | grep -q flathub; then
    info "Caching sudo credentials to add Flathub..."
    sudo -v || exit 1
    while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &
    
    info "Adding Flathub..."
    flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo >/dev/null 2>&1
    success "Flathub added"
fi

echo >&3
info "Installing $TOTAL packages"
echo >&3

${packages.map(({ app, pkg }) => `install_pkg "${escapeShellString(app.name)}" "${pkg}"`).join('\n')}

print_summary
echo >&3
info "Restart session for new apps to appear in menu." >&3
`;
}
