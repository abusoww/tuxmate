# Contributing to TuxMate

Thank you for your interest in contributing! This guide ensures high-quality, error-free contributions.

---

## ⚠️ Before You Start

**Your PR will be rejected if you:**
- ❌ Submit unverified package names
- ❌ Use wrong package name casing (e.g., `firefox` vs `MozillaFirefox`)
- ❌ Put `pacman` packages in `arch` when they're AUR-only
- ❌ Use partial Flatpak IDs instead of full App IDs
- ❌ Forget `--classic` for Snap packages that require it
- ❌ Include PPAs or unofficial repos for apt packages

---

## 📦 Adding Applications

All applications are defined in [`src/lib/data.ts`](src/lib/data.ts).

### Mandatory Research Protocol

**You MUST verify every package on these official sources before submitting:**

| Source | What to Check | URL |
|--------|--------------|-----|
| **Repology** | Global package index (check first!) | `https://repology.org/project/[app-name]/versions` |
| **Arch Linux** | Official repos (`core`, `extra`) | [archlinux.org/packages](https://archlinux.org/packages/) |
| **AUR** | User repos (only if not in official!) | [aur.archlinux.org](https://aur.archlinux.org/) |
| **Ubuntu/Debian** | Main/Universe repos only, **NO PPAs** | [packages.ubuntu.com](https://packages.ubuntu.com/) / [packages.debian.org](https://packages.debian.org/) |
| **Fedora** | Official packages | [packages.fedoraproject.org](https://packages.fedoraproject.org/) |
| **OpenSUSE** | Official packages | [software.opensuse.org](https://software.opensuse.org/) |
| **NixOS** | Nix packages | [search.nixos.org](https://search.nixos.org/packages) |
| **Flathub** | Flatpak apps (get the App ID!) | [flathub.org](https://flathub.org/) |
| **Snapcraft** | Snap packages | [snapcraft.io](https://snapcraft.io/) |

---

### Entry Structure

```typescript
{
  id: 'app-id',                        // Unique, lowercase, kebab-case
  name: 'App Name',                    // Official display name  
  description: 'Short description',    // Max ~25 characters
  category: 'Category',                // Must match valid categories
  iconUrl: si('icon-slug', '#color'),  // See Icon System section
  targets: {
    ubuntu: 'exact-package-name',      // apt package (official repos ONLY)
    debian: 'exact-package-name',      // apt package (official repos ONLY)
    arch: 'exact-package-name',        // pacman OR AUR package name
    fedora: 'exact-package-name',      // dnf package
    opensuse: 'exact-package-name',    // zypper package (CASE SENSITIVE!)
    nix: 'exact-package-name',         // nix package
    flatpak: 'com.vendor.AppId',       // FULL Flatpak App ID (reverse DNS)
    snap: 'snap-name',                 // Add --classic if needed
  },
  unavailableReason?: 'Markdown install instructions'
}
```

---

### ⛔ Strict Rules (Read Carefully!)

#### Package Name Rules

| Rule | ✅ Correct | ❌ Wrong |
|------|-----------|---------|
| **Case sensitivity** | `MozillaFirefox` (openSUSE) | `firefox` |
| **Exact package name** | `firefox-esr` (Debian) | `firefox` |
| **OpenJDK versions** | `openjdk-21-jdk` (Ubuntu) | `openjdk` |
| **Arch package** | `firefox` | `firefox-bin` (when official exists) |

#### Arch Linux: `arch` vs AUR

| Situation | Field to Use | Example |
|-----------|-------------|---------|
| Package in official repos (`core`/`extra`) | `arch: 'package'` | `arch: 'firefox'` |
| Package NOT in official repos | `arch: 'package-bin'` | `arch: 'brave-bin'` |
| NEVER mix both | Use only ONE | — |

**How to check:**
1. Search [archlinux.org/packages](https://archlinux.org/packages/)
2. If found → use `arch` field
3. If NOT found → search [aur.archlinux.org](https://aur.archlinux.org/) → use `arch` field with AUR package name
4. Prefer `-bin` suffix packages in AUR (pre-built, faster install)

#### Ubuntu/Debian: Official Repos Only

| ✅ Allowed | ❌ NOT Allowed |
|-----------|---------------|
| Main repository packages | PPAs |
| Universe repository packages | Third-party repos |
| Packages on packages.ubuntu.com | Manual .deb downloads |

**If a package requires a PPA:** Leave the field empty and add install instructions to `unavailableReason`.

#### Flatpak: Full App ID Required

| ✅ Correct | ❌ Wrong |
|-----------|---------|
| `com.spotify.Client` | `spotify` |
| `org.mozilla.firefox` | `firefox` |
| `app.zen_browser.zen` | `zen-browser` |

**How to find:** Go to [flathub.org](https://flathub.org/), search the app, copy the full App ID from the app page.

#### Snap: Classic Confinement

Some snaps require `--classic` flag. Check [snapcraft.io](https://snapcraft.io/) for the app and look for "classic" confinement.

| App Type | Format |
|----------|--------|
| Regular snap | `'snap-name'` |
| Classic confinement | `'snap-name --classic'` |

---

### Empty Fields

**If a package doesn't exist in a source, leave the field empty (omit it entirely):**

```typescript
// ✅ Correct - Discord not in apt repos
targets: {
  arch: 'discord',
  flatpak: 'com.discordapp.Discord',
  snap: 'discord'
}

// ❌ Wrong - Empty strings clutter the code
targets: {
  ubuntu: '',
  debian: '',
  arch: 'discord',
  fedora: '',
  opensuse: '',
  nix: '',
  flatpak: 'com.discordapp.Discord',
  snap: 'discord'
}
```

---

### The `unavailableReason` Field

Use this to provide helpful installation alternatives when an app isn't available in most package managers.

**Format:** Markdown with clickable links

```typescript
// ✅ Good example
unavailableReason: 'Not in official repos. Use [Flatpak](https://flathub.org/apps/com.example.App) or download from [example.com](https://example.com/download).'

// ❌ Bad examples
unavailableReason: 'Not available'           // No helpful info
unavailableReason: 'Download from website'   // No link provided
```

---

### Valid Categories

Use **exactly** one of these:

```
Web Browsers • Communication • Dev: Languages • Dev: Editors • Dev: Tools
Terminal • CLI Tools • Media • Creative • Gaming • Office
VPN & Network • Security • File Sharing • System
```

---

## 🎨 Icon System

TuxMate uses the [Iconify API](https://iconify.design/) for icons.

### Helper Functions

| Function | Use Case | Example |
|----------|----------|---------|
| `si('slug', '#color')` | Brand icons | `si('firefox', '#FF7139')` |
| `lo('slug')` | Colorful logos | `lo('chrome')` |
| `mdi('slug', '#color')` | Material icons | `mdi('console', '#57F287')` |
| `dev('slug')` | Developer tools | `dev('vscode')` |
| `sk('slug')` | Skill/tech icons | `sk('react')` |
| `vs('slug')` | VS Code file icons | `vs('file-type-shell')` |

### Finding Icon Slugs

| Source | URL | Notes |
|--------|-----|-------|
| **Simple Icons** | [simpleicons.org](https://simpleicons.org/) | Use lowercase slug |
| **Material Design** | [pictogrammers.com/library/mdi](https://pictogrammers.com/library/mdi/) | Use icon name |
| **Fallback** | — | Use `mdi('application', '#color')` |

### Icon Requirements

- ✅ Must be recognizable at 24×24px
- ✅ Use [official brand colors](https://simpleicons.org)
- ✅ Monochrome icons require a color parameter
- ❌ Don't use blurry or low-quality external URLs

---

## 🔀 Pull Request Checklist

**Before submitting, verify ALL of these:**

### Package Verification
- [ ] Checked [Repology](https://repology.org/) for global package availability
- [ ] Verified **exact** package names on each distro's official package search
- [ ] Confirmed case sensitivity (especially openSUSE: `MozillaFirefox`, `MozillaThunderbird`)
- [ ] Arch packages confirmed in [official repos](https://archlinux.org/packages/) OR [AUR](https://aur.archlinux.org/)
- [ ] Ubuntu/Debian packages are in **Main/Universe only** (no PPAs)
- [ ] Flatpak uses **full App ID** from [Flathub](https://flathub.org/)
- [ ] Snap packages checked for `--classic` requirement

### Code Quality
- [ ] Tested locally with `npm run dev`
- [ ] Production build passes: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Apps added in **alphabetical order** within their category
- [ ] Icons display correctly at small sizes


---

## 📝 PR Description Template

Include this in your PR description:

```markdown
## Apps Added/Modified
- App Name 1
- App Name 2

## Verification URLs
Paste the direct links to the package pages you checked:

- **Repology**: [link]
- **Arch/AUR**: [link]
- **Ubuntu/Debian**: [link]  
- **Fedora**: [link]
- **OpenSUSE**: [link]
- **NixOS**: [link]
- **Flathub**: [link]
- **Snapcraft**: [link]

## Checklist
- [ ] All package names verified on official sources
- [ ] Tested locally with `npm run dev`
- [ ] Build passes: `npm run build`
```

---

## 💻 Development Workflow

### Setup
```bash
git clone https://github.com/abusoww/tuxmate.git
cd tuxmate
npm install
npm run dev
```

### Before Committing
```bash
npm run lint          # Check for errors
npm run lint -- --fix # Auto-fix issues
npm run build         # Verify production build
```

### Branch Naming
```
feature/add-app-name
feature/add-distro-name  
fix/description-of-fix
docs/update-readme
```

### Commit Format
```
type: short description

- Details if needed
- Fixes #123
```
Types: `feat` `fix` `docs` `style` `refactor` `test` `chore`

---

## 🐧 Adding Distributions

Distributions are defined in [`src/lib/data.ts`](src/lib/data.ts).

### Distro Structure
```typescript
{
  id: 'distro-id',
  name: 'Display Name',
  iconUrl: si('distro-slug'),
  color: '#HexColor',
  installPrefix: 'sudo pkg install -y'
}
```

### After Adding a Distro
1. Update `src/lib/generateInstallScript.ts`
2. Add the distro case in `generateInstallScript()`
3. Handle distro-specific logic (repo enabling, AUR helpers, etc.)
4. Include proper error handling and package detection

---

## ⚙️ Script Generation

The install script logic lives in [`src/lib/generateInstallScript.ts`](src/lib/generateInstallScript.ts).

### Key Features to Maintain
- Package detection for already-installed software
- AUR handling with auto-install of yay helper
- RPM Fusion auto-enabling for Fedora
- Parallel installation support for Flatpak
- Exponential backoff retry for network failures
- Progress bars with ETA and colored output

### Testing Script Changes
```bash
# Generate and test a script
npm run dev
# Select packages → Copy script → Test in VM/container

# Quick testing with Docker
docker run -it archlinux bash
docker run -it ubuntu bash
```

---

## 🐛 Reporting Issues

### Bug Reports — Include:
- Browser & OS (e.g., Firefox 120 on Arch Linux)
- Steps to reproduce (numbered list)
- Expected vs actual behavior
- Console errors (F12 → Console tab)
- Screenshots if UI-related

### Feature Requests — Include:
- Use case and why it's needed
- Proposed solution
- Alternatives considered

---

## ❓ Questions?

Open a [Discussion](https://github.com/abusoww/tuxmate/discussions) or create an [Issue](https://github.com/abusoww/tuxmate/issues).
