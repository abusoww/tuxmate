<!-- markdownlint-disable MD041 -->

<div align="center">
  <h1><a href="https://tuxmate.abusov.com/"><img alt="TuxMate" src="TUXMATE.png" width=600/></a></h1>

![Linux](https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black)
![Website](https://img.shields.io/website?url=https://tuxmate.abusov.com&style=for-the-badge)
![Maintained](https://img.shields.io/badge/Maintained-Yes-green?style=for-the-badge)
[![GitHub issues](https://img.shields.io/github/issues/abusoww/tuxmate?color=red&style=for-the-badge)](https://github.com/abusoww/tuxmate/issues)
[![GitHub stars](https://img.shields.io/github/stars/abusoww/tuxmate?color=green&style=for-the-badge)](https://github.com/abusoww/tuxmate/stargazers)
[![GitHub license](https://img.shields.io/github/license/abusoww/tuxmate?color=yellow&style=for-the-badge)](https://github.com/abusoww/tuxmate/blob/main/LICENSE)

</div>

## 🐧 The only Mate you need for setup

**TuxMate** is a simple web tool that generates install scripts for any Linux distro. Pick your apps, copy the command, done.

Fresh install? New machine? Can't remember every package name? We've all been there.


## 📦 Supported Package Managers

- Ubuntu / Debian (apt)
- Arch Linux (pacman + AUR)
- Fedora (dnf)
- openSUSE (zypper)
- Nix (declarative config)
- Flatpak
- Snap
- Homebrew (macOS + Linux)

## ✨ Features

### **Application Catalog**  
180+ applications across 15 categories: browsers, communication, dev tools, terminals, media, creative software, gaming, office, VPN/network, security, and more.

### **Smart Script Generation**  
- Detects already-installed packages
- Handles AUR packages automatically on Arch
- **Nix Unfree Detection**: Warns compliant configuration for unfree packages (Discord, Spotify, etc.)
- Homebrew formula/cask separation for macOS
- Parallel installation for Flatpak
- Network retry with exponential backoff
- Progress bars with ETA
- Colored output and summary reports





## 📸 Screenshots

![1](src/screenshots/1.png)
![2](src/screenshots/2.png)
![3](src/screenshots/3.png)




<details>
<summary><h2>💻 Development</h2></summary>

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

</details>


<details>
<summary><h2>🗂️ Project Structure</h2></summary>

```
src/
├── app/                    # Next.js app router
│   ├── page.tsx            # Main page component
│   ├── layout.tsx          # Root layout with meta tags
│   ├── globals.css         # Tailwind styles
│   ├── error.tsx           # Error boundary
│   └── favicon.ico         # Site favicon
├── components/
│   ├── app/                # App cards & categories
│   ├── command/            # Command footer & AUR settings
│   ├── common/             # Tooltips, loading states
│   ├── distro/             # Distribution selector
│   ├── header/             # Header links & info
│   ├── search/             # Search overlay
│   └── ui/                 # Theme toggle
├── hooks/                  # React hooks
│   ├── useLinuxInit.ts     # Main app state management
│   ├── useKeyboardNavigation.ts
│   ├── useTheme.tsx
│   ├── useTooltip.ts
│   └── useDelayedTooltip.ts
├── lib/
│   ├── apps/               # JSON application files by category
│   ├── data.ts             # Categories, distros, and app unifier
│   ├── aur.ts              # AUR package detection
│   ├── analytics.ts        # Umami tracking
│   ├── utils.ts            # Utility functions
│   ├── generateInstallScript.ts
│   └── scripts/            # Per-distro script generators
└── __tests__/              # Vitest unit tests
```

</details>


<details>
<summary><h2>🐳 Docker Deployment</h2></summary>

### Quick Start with Docker

```bash
# Build the Docker image
docker build -t tuxmate:latest .

# Run the container
docker run -p 3000:3000 tuxmate:latest
```

### Using Pre-built Images

Pre-built Docker images are automatically published to GitHub Container Registry:

```bash
# Pull and run the latest image
docker pull ghcr.io/abusoww/tuxmate:latest
docker run -p 3000:3000 ghcr.io/abusoww/tuxmate:latest

# Or use a specific version
docker pull ghcr.io/abusoww/tuxmate:v1.0.0
docker run -p 3000:3000 ghcr.io/abusoww/tuxmate:v1.0.0
```

### Using Docker Compose (Recommended)

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

Open [http://localhost:3000](http://localhost:3000)

### Configuration

The Docker container exposes port 3000 by default. You can customize the port mapping:

```bash
docker run -p 8080:3000 tuxmate:latest
```

### Environment Variables

The following environment variables are configured by default:

- `NODE_ENV=production` - Run in production mode
- `PORT=3000` - Application port
- `NEXT_TELEMETRY_DISABLED=1` - Disable Next.js anonymous telemetry

You can override these when running the container:

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NEXT_TELEMETRY_DISABLED=1 \
  tuxmate:latest
```

</details>


<details>
<summary><h2>🛠️ Tech Stack</h2></summary>

- [Next.js](https://nextjs.org/) 16 (App Router)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Framer Motion](https://www.framer.com/motion/)
- [GSAP](https://gsap.com/)
- [Vitest](https://vitest.dev/) (testing)
- [Lucide React](https://lucide.dev/) (icons)

</details>

### ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` `↓` `←` `→` / `h` `j` `k` `l` | Navigate apps |
| `Space` | Toggle app selection |
| `Esc` | Clear focus |
| `/` | Focus search |
| `y` | Copy command |
| `d` | Download script |
| `t` | Toggle theme |
| `c` | Clear all selections |
| `Tab` | Toggle preview drawer |

## 🤝 Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.



## 🎯 Roadmap

### Completed
- [x] Multi-distro support (Ubuntu, Debian, Arch, Fedora, openSUSE)
- [x] Nix, Flatpak & Snap universal package support
- [x] 180+ applications across 15 categories
- [x] Smart script generation with error handling
- [x] Dark / Light theme toggle with smooth animations
- [x] Copy command & Download script
- [x] Custom domain
- [x] Docker support
- [x] CI/CD shortcuts & workflow
- [x] Search & filter applications (Real-time)
- [x] AUR Helper selection (yay/paru) + Auto-detection
- [x] Keyboard navigation (Vim keys, Arrows, Space, Esc, Enter)
- [x] Package availability indicators (including AUR badges)
- [x] Homebrew support (macOS + Linux)
- [x] PWA support for offline use
- [x] Nix configuration.nix download with unfree package detection




### Planned

- [ ] Winget support (Windows)
- [ ] Custom presets / profiles
- [ ] Share configurations via URL
- [ ] More distros (FreeBSD, Gentoo, Void, Alpine)
- [ ] i18n / Multi-language support
- [ ] Companion CLI tool
- [ ] Expand application catalog (200+)
- [ ] Dotfiles integration
- [ ] Declarative NixOS options support (programs.*) [Issue #36]


<details>
<summary><h4>🔗 Related Projects</h4></summary>
	
- **[LinuxToys](https://github.com/psygreg/linuxtoys)** – User-friendly collection of tools for Linux with an intuitive interface
- **[Nixite](https://github.com/aspizu/nixite)** – Generates bash scripts to install Linux software, inspired by Ninite
- **[tuxmate-cli](https://github.com/Gururagavendra/tuxmate-cli)** – CLI companion for tuxmate, uses tuxmate's package database

</details>


<details>
<summary><h4>💳 Monetary Contributions</h4></summary>

No tips jar here. I’m happy just knowing you’re using Linux.

If you want to earn some real life karma points, consider donating to the following organizations:

* [KDE e.V.](https://kde.org/community/donations/)
* [Gnome Foundation](https://www.gnome.org/donate/)
* [Arch Linux](https://archlinux.org/donate/)
* [The Tor Project](https://donate.torproject.org/)

Comments, suggestions, bug reports and contributions are welcome.

</details>


<div align="right">

## 📜 License
Licensed under the [GPL-3.0 License](LICENSE) <br>
Free software — you can redistribute and modify it under the terms of the GNU General Public License.

<p align="center">
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/footers/gray0_ctp_on_line.svg?sanitize=true" />
</p>
