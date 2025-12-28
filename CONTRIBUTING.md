# Contributing to TuxMate

Thank you for your interest in contributing! This guide covers everything you need to make meaningful contributions.

---

## 📦 Adding Applications

All applications are defined in [`src/lib/data.ts`](src/lib/data.ts).

**Entry Structure**
```typescript# Contributing to TuxMate

Thank you for your interest in contributing! This guide covers everything you need to make meaningful contributions.

---

## 📦 Adding Applications

All applications are defined in [`src/lib/data.ts`](src/lib/data.ts).

**Entry Structure**
```typescript
{
  id: 'app-id',                     // Unique lowercase identifier (kebab-case)
  name: 'App Name',                 // Display name
  description: 'Brief description', // Max ~25 characters
  category: 'Category',             // Must be existing Category type
  iconUrl: si('icon-slug'),         // Icon using helper functions
  targets: {
    ubuntu: 'package-name',         // Exact package name for apt
    debian: 'package-name',
    arch: 'package-name',           // Use AUR package names with -bin suffix
    fedora: 'package-name',
    opensuse: 'package-name',
    nix: 'package-name',
    flatpak: 'com.vendor.AppId',    // Full Flatpak ID
    snap: 'snap-name',              // Include --classic if needed
  },
  unavailableReason?: 'Markdown-formatted install instructions'
}
```

**Guidelines**
- Verify package names on actual distros or [Repology](https://repology.org/)
- Use `-bin` suffix for AUR packages when available (pre-built binaries)
- Add `--classic` for Snap apps requiring classic confinement
- Use full application IDs from [Flathub](https://flathub.org) for Flatpak
- Provide helpful markdown alternatives for unavailable apps

**Valid Categories**
```
Web Browsers • Communication • Dev: Languages • Dev: Editors • Dev: Tools
Terminal • CLI Tools • Media • Creative • Gaming • Office
VPN & Network • Security • File Sharing • System
```

---

## 🐧 Adding Distributions

Distributions are also defined in [`src/lib/data.ts`](src/lib/data.ts).

**Distro Structure**
```typescript
{
  id: 'distro-id',
  name: 'Display Name',
  iconUrl: si('distro-slug'),
  color: '#HexColor',
  installPrefix: 'sudo pkg install -y'
}
```

**After Adding a Distro**
1. Update `src/lib/generateInstallScript.ts`
2. Add the distro case in `generateInstallScript()`
3. Handle distro-specific logic (repo enabling, AUR helpers, etc.)
4. Include proper error handling and package detection

---

## 🎨 Icon System

TuxMate uses the [Iconify API](https://iconify.design/) for icons.

**Helper Functions**

| Function | Use Case | Example |
|----------|----------|---------|
| `si('slug', '#color')` | Brand icons | `si('firefox', '#FF7139')` |
| `lo('slug')` | Colorful logos | `lo('chrome')` |
| `mdi('slug', '#color')` | Material icons | `mdi('console', '#57F287')` |
| `dev('slug')` | Developer tools | `dev('vscode')` |
| `sk('slug')` | Skill/tech icons | `sk('react')` |
| `vs('slug')` | VS Code file icons | `vs('file-type-shell')` |

**Finding Icon Slugs**
- **Simple Icons**: [simpleicons.org](https://simpleicons.org/) — use lowercase slug
- **Material Design**: [pictogrammers.com](https://pictogrammers.com/library/mdi/) — use icon name
- **Fallback**: Use `mdi('application', '#color')` with appropriate color

**Requirements**
- Icons must be recognizable at 24×24px
- Use official brand colors from [Simple Icons](https://simpleicons.org)
- Monochrome icons require a color parameter

---

## ⚙️ Script Generation

The install script logic lives in [`src/lib/generateInstallScript.ts`](src/lib/generateInstallScript.ts).

**Key Features to Maintain**
- Package detection for already-installed software
- AUR handling with auto-install of yay helper
- RPM Fusion auto-enabling for Fedora
- Parallel installation support for Flatpak
- Exponential backoff retry for network failures
- Progress bars with ETA and colored output

**Testing Script Changes**
```bash
# Generate and test a script
npm run dev
# Select packages → Copy script → Test in VM/container

# Quick testing with Docker
docker run -it archlinux bash
docker run -it ubuntu bash
```

---

## 💻 Development Workflow

**Setup**
```bash
git clone https://github.com/abusoww/tuxmate.git
cd tuxmate
npm install
npm run dev
```

**Before Committing**
```bash
npm run lint          # Check for errors
npm run lint -- --fix # Auto-fix issues
npm run build         # Verify production build
```

**Code Standards**
- Use proper TypeScript types, avoid `any`
- Follow existing code style (Prettier defaults)
- Keep React components focused and reusable
- Add new apps in alphabetical order within their category

---

## 🔀 Pull Request Guidelines

**Branch Naming**
```
feature/add-app-name
feature/add-distro-name
fix/description-of-fix
docs/update-readme
```

**PR Checklist**
- [ ] Tested locally with `npm run dev`
- [ ] Production build passes: `npm run build`
- [ ] Lint passes: `npm run lint`
- [ ] Package names verified on distros or [Repology](https://repology.org/)
- [ ] Icons display correctly at small sizes
- [ ] Unavailable reasons include helpful alternatives

**Commit Format**
```
type: short description

- Details if needed
- Fixes #123
```
Types: `feat` `fix` `docs` `style` `refactor` `test` `chore`

---

## 🐛 Reporting Issues

**Bug Reports** — Include:
- Browser & OS (e.g., Firefox 120 on Arch Linux)
- Steps to reproduce (numbered list)
- Expected vs actual behavior
- Console errors (F12 → Console tab)
- Screenshots if UI-related

**Feature Requests** — Include:
- Use case and why it's needed
- Proposed solution
- Alternatives considered

---

## ❓ Questions?

Open a [Discussion](https://github.com/abusoww/tuxmate/discussions) or create an [Issue](https://github.com/abusoww/tuxmate/issues).
