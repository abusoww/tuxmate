/**
 * Arch Linux script generator with AUR support
 */

import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';
import { isAurPackage } from '../aur';

export function generateArchScript(packages: PackageInfo[], helper: 'yay' | 'paru' = 'yay'): string {
    const aurPackages = packages.filter(p => isAurPackage(p.pkg));
    const officialPackages = packages.filter(p => !isAurPackage(p.pkg));

    return generateAsciiHeader('Arch Linux', packages.length) + generateSharedUtils(packages.length) + `
is_installed() { pacman -Qi "$1" &>/dev/null; }

install_pacman() {
    local name=$1 pkg=$2
    CURRENT=$((CURRENT + 1))
    
    if is_installed "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi
    
    show_progress $CURRENT $TOTAL "$name"
    local start=$(date +%s)
    
    local output
    if output=$(with_retry sudo pacman -S --needed --noconfirm "$pkg"); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        if echo "$output" | grep -q "target not found"; then
            echo -e "    \${DIM}Package not found\${NC}"
        elif echo "$output" | grep -q "signature"; then
            echo -e "    \${DIM}GPG issue - try: sudo pacman-key --refresh-keys\${NC}"
        fi
        FAILED+=("$name")
    fi
}

install_aur() {
    local name=$1 pkg=$2
    CURRENT=$((CURRENT + 1))
    
    if is_installed "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi
    
    show_progress $CURRENT $TOTAL "$name"
    local start=$(date +%s)
    
    local output
    if output=$(with_retry ${helper} -S --needed --noconfirm "$pkg"); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        if echo "$output" | grep -q "target not found"; then
            echo -e "    \${DIM}Package not found in AUR\${NC}"
        fi
        FAILED+=("$name")
    fi
}

# ─────────────────────────────────────────────────────────────────────────────

[ "$EUID" -eq 0 ] && { error "Run as regular user, not root."; exit 1; }

while [ -f /var/lib/pacman/db.lck ]; do
    warn "Waiting for pacman lock..."
    sleep 2
done

info "Syncing databases..."
with_retry sudo pacman -Sy --noconfirm >/dev/null && success "Synced" || warn "Sync failed, continuing..."

${aurPackages.length > 0 ? `
if ! command -v ${helper} &>/dev/null; then
    warn "Installing ${helper} for AUR packages..."
    sudo pacman -S --needed --noconfirm git base-devel >/dev/null 2>&1
    tmp=$(mktemp -d)
    git clone https://aur.archlinux.org/${helper}.git "$tmp/${helper}" >/dev/null 2>&1
    (cd "$tmp/${helper}" && makepkg -si --noconfirm >/dev/null 2>&1)
    rm -rf "$tmp"
    command -v ${helper} &>/dev/null && success "${helper} installed" || warn "${helper} install failed"
fi
` : ''}

echo
info "Installing $TOTAL packages"
echo

${officialPackages.map(({ app, pkg }) => `install_pacman "${escapeShellString(app.name)}" "${pkg}"`).join('\n')}
${aurPackages.length > 0 ? `
if command -v ${helper} &>/dev/null; then
${aurPackages.map(({ app, pkg }) => `    install_aur "${escapeShellString(app.name)}" "${pkg}"`).join('\n')}
fi
` : ''}

print_summary
`;
}
