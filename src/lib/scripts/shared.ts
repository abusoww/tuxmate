// Stuff shared across all distro script generators

import { apps, type DistroId, type AppData } from '../data';

export interface PackageInfo {
    app: AppData;
    pkg: string;
}

// Don't let anyone sneak shell commands through app names :)
export function escapeShellString(str: string): string {
    return str
        .replace(/\\/g, '\\\\')   // Escape backslashes first
        .replace(/"/g, '\\"')     // Escape double quotes
        .replace(/\$/g, '\\$')    // Escape dollar signs
        .replace(/`/g, '\\`')     // Escape backticks
        .replace(/!/g, '\\!');    // Escape history expansion
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
#  ParchMate App Installer
#  https://mate.parchlinux.com
#
#  Distribution: ${distroName}
#  Packages: ${pkgCount}
#  Generated: ${date}
#
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

`;
}

export function generateSharedUtils(total: number): string {
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

# Graceful exit on Ctrl+C
trap 'printf "\\n"; warn "Installation cancelled by user"; print_summary; exit 130' INT

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

# Safe command executor (no eval)
run_cmd() {
    "$@" 2>&1
}

# Network retry wrapper - uses run_cmd for safety
with_retry() {
    local max_attempts=3
    local attempt=1
    local delay=5
    
    while [ $attempt -le $max_attempts ]; do
        if output=$(run_cmd "$@"); then
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
