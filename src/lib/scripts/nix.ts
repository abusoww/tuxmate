// Nix script - nix-env

import { generateAsciiHeader, generateSharedUtils, escapeShellString, type PackageInfo } from './shared';

export function generateNixScript(packages: PackageInfo[]): string {
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
    if output=$(with_retry nix-env -iA "nixpkgs.$attr"); then
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
with_retry nix-channel --update >/dev/null && success "Updated" || warn "Update failed"

echo
info "Installing $TOTAL packages"
echo

${packages.filter(p => p.pkg.trim()).map(({ app, pkg }) => `install_pkg "${escapeShellString(app.name)}" "${pkg.trim()}"`).join('\n')}

print_summary
echo
info "Restart your shell for new commands."
`;
}
