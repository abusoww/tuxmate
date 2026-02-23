import { apps, type DistroId, type AppData } from '../data';

export interface PackageInfo {
    app: AppData;
    pkg: string;
}

export function escapeShellString(str: string): string {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\$/g, '\\$')
        .replace(/`/g, '\\`')
        .replace(/!/g, '\\!');
}

export function getSelectedPackages(selectedAppIds: Set<string>, distroId: DistroId): PackageInfo[] {
    return Array.from(selectedAppIds)
        .map(id => apps.find(a => a.id === id))
        .filter((app): app is AppData => !!app && !!app.targets[distroId])
        .map(app => ({ app, pkg: app.targets[distroId]! }));
}

export function generateAsciiHeader(distroName: string, pkgCount: number): string {
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
# ---------------------------------------------------------------------------

set -euo pipefail

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
export LC_ALL=C
umask 077

`;
}

export function generateSharedUtils(distroName: string, total: number): string {
    return `# ---------------------------------------------------------------------------
#  Logging & Colors
# ---------------------------------------------------------------------------

LOG="/tmp/tuxmate-${distroName.toLowerCase().replace(/\s+/g, '-')}-$(date +%Y%m%d-%H%M%S).log"
# Save original stdout to FD 3
exec 3>&1
# Redirect script's stdout & stderr to the log file to keep TTY clean
exec > "$LOG" 2>&1

if [ -t 3 ]; then
    RED='\\033[0;31m' GREEN='\\033[0;32m' YELLOW='\\033[1;33m'
    BLUE='\\033[0;34m' CYAN='\\033[0;36m' BOLD='\\033[1m' DIM='\\033[2m' NC='\\033[0m'
else
    RED='' GREEN='' YELLOW='' BLUE='' CYAN='' BOLD='' DIM='' NC=''
fi

# Print visually to FD 3 (the user's terminal)
info()    { echo -e "\${BLUE}::\${NC} $1" >&3; echo ":: $1"; }
success() {
    if [ -n "\${2:-}" ]; then
        echo -e "\${GREEN}[+]\${NC} $1 \${DIM}(\$2)\${NC}" >&3
        echo "[+] $1 (\$2)"
    else
        echo -e "\${GREEN}[+]\${NC} $1" >&3
        echo "[+] $1"
    fi
}
warn()    { echo -e "\${YELLOW}[!]\${NC} $1" >&3; echo "[!] $1"; }
error()   { echo -e "\${RED}[x]\${NC} $1" >&3; echo "[x] $1" >&2; }
skip()    {
    local reason="\${2:-already installed}"
    echo -e "\${DIM}[-]\${NC} $1 \${DIM}(\$reason)\${NC}" >&3
    echo "[-] $1 (\$reason)"
}

trap 'printf "\\n" >&3; warn "Cancelled by user"; print_summary; exit 130' INT

TOTAL=${total}
CURRENT=0
FAILED=()
SUCCEEDED=()
SKIPPED=()
START_TIME=$(date +%s)

animate_progress() {
    local name=$1 pid=$2
    local start=$(date +%s)
    local spinstr='|/-\\'
    local spin_idx=0
    
    while kill -0 $pid 2>/dev/null; do
        local elapsed=$(($(date +%s) - start))
        local percent=$((CURRENT * 100 / TOTAL))
        local filled=$((percent / 5))
        local empty=$((20 - filled))
        
        local hash="####################"
        local dash="--------------------"
        local bar="\${CYAN}\${hash:0:filled}\${NC}\${dash:0:empty}"
        local spin_char="\${spinstr:$spin_idx:1}"
        spin_idx=$(( (spin_idx + 1) % 4 ))
        
        printf "\\r\\033[K[%b] %3d%% (%d/%d) \${BOLD}%s\${NC} [%c] %ds" "$bar" "$percent" "$CURRENT" "$TOTAL" "$name" "$spin_char" "$elapsed" >&3
        
        sleep 0.1
    done
    wait $pid
    return $?
}

with_retry() {
    local attempt=1 max=3 delay=5
    while [ $attempt -le $max ]; do
        echo "=== Executing (Attempt $attempt/$max): $* ==="
        if "$@"; then return 0; fi
        echo "=== Command failed ==="
        if [ $attempt -lt $max ]; then
            echo "Retrying in \${delay}s..."
            sleep $delay
            delay=$((delay * 2))
        fi
        attempt=$((attempt + 1))
    done
    return 1
}

wait_for_lock() {
    local file=$1 timeout=60 elapsed=0
    while [ -f "$file" ] || fuser "$file" >/dev/null 2>&1; do
        if [ $elapsed -ge $timeout ]; then
            error "Lock timeout after \${timeout}s: $file"
            exit 1
        fi
        warn "Waiting for lock: $file"
        sleep 2
        elapsed=$((elapsed + 2))
    done
}

print_summary() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local mins=$((duration / 60))
    local secs=$((duration % 60))

    echo >&3
    echo "---------------------------------------------------------------------------" >&3
    local installed=\${#SUCCEEDED[@]}
    local skipped_count=\${#SKIPPED[@]}
    local failed_count=\${#FAILED[@]}

    if [ $failed_count -eq 0 ]; then
        if [ $skipped_count -gt 0 ]; then
            echo -e "\${GREEN}[+]\${NC} Done: $installed installed, $skipped_count already present \${DIM}(\${mins}m \${secs}s)\${NC}" >&3
        else
            echo -e "\${GREEN}[+]\${NC} All $TOTAL packages installed \${DIM}(\${mins}m \${secs}s)\${NC}" >&3
        fi
    else
        echo -e "\${YELLOW}[!]\${NC} $installed installed, $skipped_count skipped, $failed_count failed \${DIM}(\${mins}m \${secs}s)\${NC}" >&3
        echo >&3
        echo -e "\${RED}Failed:\${NC}" >&3
        for pkg in "\${FAILED[@]}"; do
            echo "  - $pkg" >&3
        done
    fi
    echo "---------------------------------------------------------------------------" >&3
    echo -e "\${DIM}Log: $LOG\${NC}" >&3
}

`;
}
