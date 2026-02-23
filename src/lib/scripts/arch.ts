import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';
import { isAurPackage } from '../aur';

export function generateArchScript(packages: PackageInfo[], helper: 'yay' | 'paru' = 'yay'): string {
    const aurPackages = packages.filter(p => isAurPackage(p.pkg));
    const officialPackages = packages.filter(p => !isAurPackage(p.pkg));

    return generateAsciiHeader('Arch Linux', packages.length) + generateSharedUtils('arch', packages.length) + `
is_installed() { pacman -Qi "$1" &>/dev/null; }

install_pkg() {
    local name=$1 pkg=$2 cmd=$3
    CURRENT=$((CURRENT + 1))

    if is_installed "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi

    local start=$(date +%s)
    
    with_retry $cmd -S --needed --noconfirm "$pkg" &
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

info "Caching sudo credentials..."
sudo -v || exit 1
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

wait_for_lock /var/lib/pacman/db.lck

info "Syncing package databases..."
with_retry sudo pacman -Sy --noconfirm &
if animate_progress "Syncing..." $!; then
    printf "\\r\\033[K" >&3
    success "Synced"
else
    printf "\\r\\033[K" >&3
    warn "Sync failed, continuing..."
fi

${aurPackages.length > 0 ? `
if ! command -v ${helper} &>/dev/null; then
    warn "${helper} not found, installing for AUR packages..."
    sudo pacman -S --needed --noconfirm git base-devel >/dev/null 2>&1
    tmp=$(mktemp -d)
    trap 'rm -rf "$tmp"' EXIT
    git clone "https://aur.archlinux.org/${helper}.git" "$tmp/${helper}" >/dev/null 2>&1
    (cd "$tmp/${helper}" && makepkg -si --noconfirm >/dev/null 2>&1)
    command -v ${helper} &>/dev/null && success "${helper} ready" || { error "Failed to install ${helper}"; exit 1; }
fi
` : ''}
echo >&3
info "Installing $TOTAL packages"
echo >&3

${officialPackages.map(({ app, pkg }) => `install_pkg "${escapeShellString(app.name)}" "${pkg}" "sudo pacman"`).join('\n')}
${aurPackages.length > 0 ? `
if command -v ${helper} &>/dev/null; then
${aurPackages.map(({ app, pkg }) => `    install_pkg "${escapeShellString(app.name)}" "${pkg}" "${helper}"`).join('\n')}
fi
` : ''}
print_summary
`;
}
