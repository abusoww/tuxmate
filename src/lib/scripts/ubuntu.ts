import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';

export function generateUbuntuScript(packages: PackageInfo[]): string {
    return generateAsciiHeader('Ubuntu', packages.length) + generateSharedUtils('ubuntu', packages.length) + `
export DEBIAN_FRONTEND=noninteractive

is_installed() { dpkg -l "$1" 2>/dev/null | grep -q "^ii"; }

install_pkg() {
    local name=$1 pkg=$2
    CURRENT=$((CURRENT + 1))

    if is_installed "$pkg"; then
        skip "$name"
        SKIPPED+=("$name")
        return 0
    fi

    local start=$(date +%s)

    with_retry sudo apt-get install -y "$pkg" &
    local pid=$!

    if animate_progress "$name" $pid; then
        local elapsed=$(($(date +%s) - start))
        printf "\\r\\033[K" >&3
        success "$name" "\${elapsed}s"
        SUCCEEDED+=("$name")
    else
        printf "\\r\\033[K" >&3
        if tail -n 50 "$LOG" | grep -q "unmet dependencies"; then
            warn "Fixing dependencies for $name..." >&3
            if sudo apt-get --fix-broken install -y >/dev/null 2>&1; then
                sudo apt-get install -y "$pkg" &
                if animate_progress "$name (retry)" $!; then
                    local elapsed=$(($(date +%s) - start))
                    success "$name" "\${elapsed}s, deps fixed"
                    SUCCEEDED+=("$name")
                    return 0
                fi
            fi
        fi
        error "$name"
        FAILED+=("$name")
    fi
}

# ---------------------------------------------------------------------------

[ "$EUID" -eq 0 ] && { error "Do not run as root."; exit 1; }

info "Caching sudo credentials..."
sudo -v || exit 1
while true; do sudo -n true; sleep 60; kill -0 "$$" || exit; done 2>/dev/null &

wait_for_lock /var/lib/dpkg/lock-frontend
sudo dpkg --configure -a >/dev/null 2>&1 || true

info "Updating package lists..."
with_retry sudo apt-get update -qq &
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

${packages.map(({ app, pkg }) => `install_pkg "${escapeShellString(app.name)}" "${pkg}"`).join('\n')}

print_summary
`;
}
