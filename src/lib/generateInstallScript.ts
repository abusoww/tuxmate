import { apps, distros, type DistroId, type AppData } from './data';

interface ScriptOptions {
    distroId: DistroId;
    selectedAppIds: Set<string>;
}

function getSelectedPackages(selectedAppIds: Set<string>, distroId: DistroId): { app: AppData; pkg: string }[] {
    return Array.from(selectedAppIds)
        .map(id => apps.find(a => a.id === id))
        .filter((app): app is AppData => !!app && !!app.targets[distroId])
        .map(app => ({ app, pkg: app.targets[distroId]! }));
}

function generateAsciiHeader(distroName: string, pkgCount: number): string {
    const date = new Date().toISOString().split('T')[0];
    return `#!/bin/bash
#
#  ████████╗██╗   ██╗██╗  ██╗███╗   ███╗ █████╗ ████████╗███████╗
#  ╚══██╔══╝██║   ██║╚██╗██╔╝████╗ ████║██╔══██╗╚══██╔══╝██╔════╝
#     ██║   ██║   ██║ ╚███╔╝ ██╔████╔██║███████║   ██║   █████╗
#     ██║   ██║   ██║ ██╔██╗ ██║╚██╔╝██║██╔══██║   ██║   ██╔══╝
#     ██║   ╚██████╔╝██╔╝ ██╗██║ ╚═╝ ██║██║  ██║   ██║   ███████╗
#     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝
#
#  Linux App Installer
#  https://github.com/abusoww/tuxmate
#
#  Distribution: ${distroName}
#  Packages: ${pkgCount}
#  Generated: ${date}
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

`;
}

// Shared utilities for all scripts
function generateSharedUtils(total: number): string {
    return `# ─────────────────────────────────────────────────────────────────────────────
#  Colors & Utilities
# ─────────────────────────────────────────────────────────────────────────────

if [ -t 1 ]; then
    RED='\\033[0;31m' GREEN='\\033[0;32m' YELLOW='\\033[1;33m'
    BLUE='\\033[0;34m' CYAN='\\033[0;36m' BOLD='\\033[1m' DIM='\\033[2m' NC='\\033[0m'
else
    RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' DIM='' NC=''
fi

info()    { echo -e "\${BLUE}::\${NC} $1"; }
success() { echo -e "\${GREEN}✓\${NC} $1"; }
warn()    { echo -e "\${YELLOW}!\${NC} $1"; }
error()   { echo -e "\${RED}✗\${NC} $1" >&2; }
skip()    { echo -e "\${DIM}○\${NC} $1 \${DIM}(already installed)\${NC}"; }
timing()  { echo -e "\${GREEN}✓\${NC} $1 \${DIM}($2s)\${NC}"; }

TOTAL=${total}
CURRENT=0
FAILED=()
SUCCEEDED=()
SKIPPED=()
INSTALL_TIMES=()
START_TIME=$(date +%s)
AVG_TIME=8  # Initial estimate: 8 seconds per package

show_progress() {
    local current=$1 total=$2 name=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 5))
    local empty=$((20 - filled))
    
    # Calculate ETA
    local remaining=$((total - current))
    local eta=$((remaining * AVG_TIME))
    local eta_str=""
    if [ $eta -ge 60 ]; then
        eta_str="~$((eta / 60))m"
    else
        eta_str="~\${eta}s"
    fi
    
    printf "\\r\\033[K[\${CYAN}"
    printf "%\${filled}s" | tr ' ' '█'
    printf "\${NC}"
    printf "%\${empty}s" | tr ' ' '░'
    printf "] %3d%% (%d/%d) \${BOLD}%s\${NC} \${DIM}%s left\${NC}" "$percent" "$current" "$total" "$name" "$eta_str"
}

# Update average install time
update_avg_time() {
    local new_time=$1
    if [ \${#INSTALL_TIMES[@]} -eq 0 ]; then
        AVG_TIME=$new_time
    else
        local sum=$new_time
        for t in "\${INSTALL_TIMES[@]}"; do
            sum=$((sum + t))
        done
        AVG_TIME=$((sum / (\${#INSTALL_TIMES[@]} + 1)))
    fi
    INSTALL_TIMES+=($new_time)
}

# Network retry wrapper
with_retry() {
    local max_attempts=3
    local attempt=1
    local delay=5
    local cmd="$1"
    
    while [ $attempt -le $max_attempts ]; do
        if output=$(eval "$cmd" 2>&1); then
            echo "$output"
            return 0
        fi
        
        # Check for network errors
        if echo "$output" | grep -qiE "network|connection|timeout|unreachable|resolve"; then
            if [ $attempt -lt $max_attempts ]; then
                warn "Network error, retrying in \${delay}s... (attempt $attempt/$max_attempts)"
                sleep $delay
                delay=$((delay * 2))
                attempt=$((attempt + 1))
                continue
            fi
        fi
        
        echo "$output"
        return 1
    done
    return 1
}

print_summary() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local mins=$((duration / 60))
    local secs=$((duration % 60))
    
    echo
    echo "─────────────────────────────────────────────────────────────────────────────"
    local installed=\${#SUCCEEDED[@]}
    local skipped_count=\${#SKIPPED[@]}
    local failed_count=\${#FAILED[@]}
    
    if [ $failed_count -eq 0 ]; then
        if [ $skipped_count -gt 0 ]; then
            echo -e "\${GREEN}✓\${NC} Done! $installed installed, $skipped_count already installed \${DIM}(\${mins}m \${secs}s)\${NC}"
        else
            echo -e "\${GREEN}✓\${NC} All $TOTAL packages installed! \${DIM}(\${mins}m \${secs}s)\${NC}"
        fi
    else
        echo -e "\${YELLOW}!\${NC} $installed installed, $skipped_count skipped, $failed_count failed \${DIM}(\${mins}m \${secs}s)\${NC}"
        echo
        echo -e "\${RED}Failed:\${NC}"
        for pkg in "\${FAILED[@]}"; do
            echo "  • $pkg"
        done
    fi
    echo "─────────────────────────────────────────────────────────────────────────────"
}

`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  UBUNTU SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

function generateUbuntuScript(packages: { app: AppData; pkg: string }[]): string {
    return generateAsciiHeader('Ubuntu', packages.length) + generateSharedUtils(packages.length) + `
is_installed() { dpkg -l "$1" 2>/dev/null | grep -q "^ii"; }

# Auto-fix broken dependencies
fix_deps() {
    if sudo apt-get --fix-broken install -y >/dev/null 2>&1; then
        success "Dependencies fixed"
        return 0
    fi
    return 1
}

install_pkg() {
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
    if output=$(with_retry "sudo apt-get install -y $pkg"); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        if echo "$output" | grep -q "Unable to locate"; then
            echo -e "    \${DIM}Package not found\${NC}"
        elif echo "$output" | grep -q "unmet dependencies"; then
            echo -e "    \${DIM}Fixing dependencies...\${NC}"
            if fix_deps; then
                # Retry once after fixing deps
                if sudo apt-get install -y "$pkg" >/dev/null 2>&1; then
                    timing "$name" "$(($(date +%s) - start))"
                    SUCCEEDED+=("$name")
                    return 0
                fi
            fi
        fi
        FAILED+=("$name")
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
#  Pre-flight
# ─────────────────────────────────────────────────────────────────────────────

[ "$EUID" -eq 0 ] && { error "Run as regular user, not root."; exit 1; }

# Wait for apt lock
while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
    warn "Waiting for package manager..."
    sleep 2
done

info "Updating package lists..."
with_retry "sudo apt-get update -qq" >/dev/null && success "Updated" || warn "Update failed, continuing..."

# ─────────────────────────────────────────────────────────────────────────────
#  Installation
# ─────────────────────────────────────────────────────────────────────────────

echo
info "Installing $TOTAL packages"
echo

${packages.map(({ app, pkg }) => `install_pkg "${app.name}" "${pkg}"`).join('\n')}

print_summary
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DEBIAN SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

function generateDebianScript(packages: { app: AppData; pkg: string }[]): string {
    return generateAsciiHeader('Debian', packages.length) + generateSharedUtils(packages.length) + `
is_installed() { dpkg -l "$1" 2>/dev/null | grep -q "^ii"; }

fix_deps() {
    if sudo apt-get --fix-broken install -y >/dev/null 2>&1; then
        success "Dependencies fixed"
        return 0
    fi
    return 1
}

install_pkg() {
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
    if output=$(with_retry "sudo apt-get install -y $pkg"); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        if echo "$output" | grep -q "Unable to locate"; then
            echo -e "    \${DIM}Package not found\${NC}"
        elif echo "$output" | grep -q "unmet dependencies"; then
            echo -e "    \${DIM}Fixing dependencies...\${NC}"
            if fix_deps; then
                if sudo apt-get install -y "$pkg" >/dev/null 2>&1; then
                    timing "$name" "$(($(date +%s) - start))"
                    SUCCEEDED+=("$name")
                    return 0
                fi
            fi
        fi
        FAILED+=("$name")
    fi
}

# ─────────────────────────────────────────────────────────────────────────────

[ "$EUID" -eq 0 ] && { error "Run as regular user, not root."; exit 1; }

while fuser /var/lib/dpkg/lock-frontend >/dev/null 2>&1; do
    warn "Waiting for package manager..."
    sleep 2
done

info "Updating package lists..."
with_retry "sudo apt-get update -qq" >/dev/null && success "Updated" || warn "Update failed, continuing..."

echo
info "Installing $TOTAL packages"
echo

${packages.map(({ app, pkg }) => `install_pkg "${app.name}" "${pkg}"`).join('\n')}

print_summary
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ARCH SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

function generateArchScript(packages: { app: AppData; pkg: string }[]): string {
    // Known AUR packages based on data.ts (not in official Arch repos)
    const knownAurPackages = new Set([
        // -bin, -git, -appimage suffixes
        'brave-bin', 'librewolf-bin', 'vesktop-bin', 'vscodium-bin', 'bun-bin',
        'postman-bin', 'heroic-games-launcher-bin', 'protonup-qt-bin', 'onlyoffice-bin',
        'logseq-desktop-bin', 'joplin-appimage', 'localsend-bin', 'zen-browser-bin',
        'helium-browser-bin', 'cursor-bin', 'ab-download-manager-bin', 'mullvad-vpn-bin',
        'orcaslicer-bin', 'bruno-bin', 'hoppscotch-bin',
        // Known AUR packages without suffix
        'google-chrome', 'sublime-text-4', 'spotify', 'stremio', 'dropbox',
        'slack-desktop', 'zoom', 'proton-vpn-gtk-app', 'bitwarden', 'obsidian'
    ]);

    const aurPackages = packages.filter(p => knownAurPackages.has(p.pkg));
    const officialPackages = packages.filter(p => !knownAurPackages.has(p.pkg));

    return generateAsciiHeader('Arch Linux', packages.length) + generateSharedUtils(packages.length) + `
is_installed() { pacman -Qi "$1" &>/dev/null; }

install_pkg() {
    local name=$1 cmd=$2 pkg=$3
    CURRENT=$((CURRENT + 1))
    
    if is_installed "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi
    
    show_progress $CURRENT $TOTAL "$name"
    local start=$(date +%s)
    
    local output
    if output=$(with_retry "$cmd"); then
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

# ─────────────────────────────────────────────────────────────────────────────

[ "$EUID" -eq 0 ] && { error "Run as regular user, not root."; exit 1; }

while [ -f /var/lib/pacman/db.lck ]; do
    warn "Waiting for pacman lock..."
    sleep 2
done

info "Syncing databases..."
with_retry "sudo pacman -Sy --noconfirm" >/dev/null && success "Synced" || warn "Sync failed, continuing..."

${aurPackages.length > 0 ? `
if ! command -v yay &>/dev/null; then
    warn "Installing yay for AUR packages..."
    sudo pacman -S --needed --noconfirm git base-devel >/dev/null 2>&1
    tmp=$(mktemp -d)
    git clone https://aur.archlinux.org/yay.git "$tmp/yay" >/dev/null 2>&1
    (cd "$tmp/yay" && makepkg -si --noconfirm >/dev/null 2>&1)
    rm -rf "$tmp"
    command -v yay &>/dev/null && success "yay installed" || warn "yay install failed"
fi
` : ''}

echo
info "Installing $TOTAL packages"
echo

${officialPackages.map(({ app, pkg }) => `install_pkg "${app.name}" "sudo pacman -S --needed --noconfirm ${pkg}" "${pkg}"`).join('\n')}
${aurPackages.length > 0 ? `
if command -v yay &>/dev/null; then
${aurPackages.map(({ app, pkg }) => `    install_pkg "${app.name}" "yay -S --needed --noconfirm ${pkg}" "${pkg}"`).join('\n')}
fi
` : ''}

print_summary
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FEDORA SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

function generateFedoraScript(packages: { app: AppData; pkg: string }[]): string {
    const rpmFusionPkgs = ['steam', 'vlc', 'ffmpeg', 'obs-studio'];
    const needsRpmFusion = packages.some(p => rpmFusionPkgs.includes(p.pkg));

    return generateAsciiHeader('Fedora', packages.length) + generateSharedUtils(packages.length) + `
is_installed() { rpm -q "$1" &>/dev/null; }

install_pkg() {
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
    if output=$(with_retry "sudo dnf install -y $pkg"); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        if echo "$output" | grep -q "No match"; then
            echo -e "    \${DIM}Package not found\${NC}"
        fi
        FAILED+=("$name")
    fi
}

# ─────────────────────────────────────────────────────────────────────────────

[ "$EUID" -eq 0 ] && { error "Run as regular user, not root."; exit 1; }
command -v dnf &>/dev/null || { error "dnf not found"; exit 1; }

${needsRpmFusion ? `
if ! dnf repolist 2>/dev/null | grep -q rpmfusion; then
    info "Enabling RPM Fusion..."
    sudo dnf install -y \\
        "https://mirrors.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm" \\
        "https://mirrors.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm" \\
        >/dev/null 2>&1 && success "RPM Fusion enabled"
fi
` : ''}

echo
info "Installing $TOTAL packages"
echo

${packages.map(({ app, pkg }) => `install_pkg "${app.name}" "${pkg}"`).join('\n')}

print_summary
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  OPENSUSE SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

function generateOpenSUSEScript(packages: { app: AppData; pkg: string }[]): string {
    return generateAsciiHeader('openSUSE', packages.length) + generateSharedUtils(packages.length) + `
is_installed() { rpm -q "$1" &>/dev/null; }

install_pkg() {
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
    if output=$(with_retry "sudo zypper --non-interactive install --auto-agree-with-licenses $pkg"); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        FAILED+=("$name")
    fi
}

# ─────────────────────────────────────────────────────────────────────────────

[ "$EUID" -eq 0 ] && { error "Run as regular user, not root."; exit 1; }
command -v zypper &>/dev/null || { error "zypper not found"; exit 1; }

while [ -f /var/run/zypp.pid ]; do
    warn "Waiting for zypper..."
    sleep 2
done

info "Refreshing repos..."
with_retry "sudo zypper --non-interactive refresh" >/dev/null && success "Refreshed" || warn "Refresh failed"

echo
info "Installing $TOTAL packages"
echo

${packages.map(({ app, pkg }) => `install_pkg "${app.name}" "${pkg}"`).join('\n')}

print_summary
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  NIX SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

function generateNixScript(packages: { app: AppData; pkg: string }[]): string {
    return generateAsciiHeader('Nix', packages.length) + generateSharedUtils(packages.length) + `
is_installed() { nix-env -q 2>/dev/null | grep -q "$1"; }

install_pkg() {
    local name=$1 attr=$2
    CURRENT=$((CURRENT + 1))
    
    if is_installed "$attr"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi
    
    show_progress $CURRENT $TOTAL "$name"
    local start=$(date +%s)
    
    local output
    if output=$(with_retry "nix-env -iA nixpkgs.$attr"); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        if echo "$output" | grep -q "attribute.*not found"; then
            echo -e "    \${DIM}Attribute not found\${NC}"
        fi
        FAILED+=("$name")
    fi
}

# ─────────────────────────────────────────────────────────────────────────────

command -v nix-env &>/dev/null || { error "nix-env not found"; exit 1; }

info "Updating channels..."
with_retry "nix-channel --update" >/dev/null && success "Updated" || warn "Update failed"

echo
info "Installing $TOTAL packages"
echo

${packages.map(({ app, pkg }) => `install_pkg "${app.name}" "${pkg}"`).join('\n')}

print_summary
echo
info "Restart your shell for new commands."
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  FLATPAK SCRIPT - WITH PARALLEL INSTALL
// ═══════════════════════════════════════════════════════════════════════════════

function generateFlatpakScript(packages: { app: AppData; pkg: string }[]): string {
    const parallel = packages.length >= 3;

    return generateAsciiHeader('Flatpak', packages.length) + generateSharedUtils(packages.length) + `
is_installed() { flatpak list --app 2>/dev/null | grep -q "$1"; }

${parallel ? `
# Parallel install for Flatpak
install_parallel() {
    local pids=()
    local names=()
    local start=$(date +%s)
    
    for pair in "$@"; do
        local name="\${pair%%|*}"
        local appid="\${pair##*|}"
        
        if is_installed "$appid"; then
            skip "$name"
            SKIPPED+=("$name")
            continue
        fi
        
        (flatpak install flathub -y "$appid" >/dev/null 2>&1) &
        pids+=($!)
        names+=("$name")
    done
    
    local total=\${#pids[@]}
    local done_count=0
    
    if [ $total -eq 0 ]; then
        return
    fi
    
    info "Installing $total apps in parallel..."
    
    for i in "\${!pids[@]}"; do
        wait \${pids[$i]}
        local status=$?
        done_count=$((done_count + 1))
        
        if [ $status -eq 0 ]; then
            SUCCEEDED+=("\${names[$i]}")
            success "\${names[$i]}"
        else
            FAILED+=("\${names[$i]}")
            error "\${names[$i]} failed"
        fi
    done
    
    local elapsed=$(($(date +%s) - start))
    echo -e "\${DIM}Parallel install took \${elapsed}s\${NC}"
}
` : `
install_pkg() {
    local name=$1 appid=$2
    CURRENT=$((CURRENT + 1))
    
    if is_installed "$appid"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi
    
    show_progress $CURRENT $TOTAL "$name"
    local start=$(date +%s)
    
    if with_retry "flatpak install flathub -y $appid" >/dev/null; then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        FAILED+=("$name")
    fi
}
`}

# ─────────────────────────────────────────────────────────────────────────────

command -v flatpak &>/dev/null || { 
    error "Flatpak not installed"
    info "Install: sudo apt/dnf/pacman install flatpak"
    exit 1
}

if ! flatpak remotes 2>/dev/null | grep -q flathub; then
    info "Adding Flathub..."
    flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
    success "Flathub added"
fi

echo
info "Installing $TOTAL packages"
echo

${parallel
            ? `install_parallel ${packages.map(({ app, pkg }) => `"${app.name}|${pkg}"`).join(' ')}`
            : packages.map(({ app, pkg }) => `install_pkg "${app.name}" "${pkg}"`).join('\n')
        }

print_summary
echo
info "Restart session for apps in menu."
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SNAP SCRIPT
// ═══════════════════════════════════════════════════════════════════════════════

function generateSnapScript(packages: { app: AppData; pkg: string }[]): string {
    return generateAsciiHeader('Snap', packages.length) + generateSharedUtils(packages.length) + `
is_installed() {
    local snap_name=$(echo "$1" | awk '{print $1}')
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
    
    show_progress $CURRENT $TOTAL "$name"
    local start=$(date +%s)
    
    local output
    if output=$(with_retry "sudo snap install $pkg"); then
        local elapsed=$(($(date +%s) - start))
        update_avg_time $elapsed
        printf "\\r\\033[K"
        timing "$name" "$elapsed"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K\${RED}✗\${NC} %s\\n" "$name"
        if echo "$output" | grep -q "not found"; then
            echo -e "    \${DIM}Snap not found\${NC}"
        fi
        FAILED+=("$name")
    fi
}

# ─────────────────────────────────────────────────────────────────────────────

command -v snap &>/dev/null || { 
    error "Snap not installed"
    info "Install: sudo apt/dnf/pacman install snapd"
    exit 1
}

if command -v systemctl &>/dev/null && ! systemctl is-active --quiet snapd; then
    info "Starting snapd..."
    sudo systemctl enable --now snapd.socket
    sudo systemctl start snapd
    sleep 2
    success "snapd started"
fi

echo
info "Installing $TOTAL packages"
echo

${packages.map(({ app, pkg }) => `install_pkg "${app.name}" "${pkg}"`).join('\n')}

print_summary
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export function generateInstallScript(options: ScriptOptions): string {
    const { distroId, selectedAppIds } = options;
    const distro = distros.find(d => d.id === distroId);

    if (!distro) return '#!/bin/bash\necho "Error: Unknown distribution"\nexit 1';

    const packages = getSelectedPackages(selectedAppIds, distroId);
    if (packages.length === 0) return '#!/bin/bash\necho "No packages selected"\nexit 0';

    switch (distroId) {
        case 'ubuntu': return generateUbuntuScript(packages);
        case 'debian': return generateDebianScript(packages);
        case 'arch': return generateArchScript(packages);
        case 'fedora': return generateFedoraScript(packages);
        case 'opensuse': return generateOpenSUSEScript(packages);
        case 'nix': return generateNixScript(packages);
        case 'flatpak': return generateFlatpakScript(packages);
        case 'snap': return generateSnapScript(packages);
        default: return '#!/bin/bash\necho "Unsupported distribution"\nexit 1';
    }
}

export function generateSimpleCommand(selectedAppIds: Set<string>, distroId: DistroId): string {
    const packages = getSelectedPackages(selectedAppIds, distroId);
    if (packages.length === 0) return '# No packages selected';

    const pkgList = packages.map(p => p.pkg).join(' ');

    switch (distroId) {
        case 'ubuntu':
        case 'debian': return `sudo apt install -y ${pkgList}`;
        case 'arch': return `yay -S --needed --noconfirm ${pkgList}`;
        case 'fedora': return `sudo dnf install -y ${pkgList}`;
        case 'opensuse': return `sudo zypper install -y ${pkgList}`;
        case 'nix': return `nix-env -iA ${packages.map(p => `nixpkgs.${p.pkg}`).join(' ')}`;
        case 'flatpak': return `flatpak install flathub -y ${pkgList}`;
        case 'snap':
            if (packages.length === 1) return `sudo snap install ${pkgList}`;
            return packages.map(p => `sudo snap install ${p.pkg}`).join(' && ');
        default: return `# Install: ${pkgList}`;
    }
}
