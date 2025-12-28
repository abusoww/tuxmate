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

**TuxMate** is a web-based Linux application installer that generates
distro-specific shell scripts, that aims to be the simplest way to bulk-install
applications on a fresh Linux system.

Maybe you've just installed a fresh Linux distro. Perhaps you're setting up
a new machine or can't remember all the package names for your favorite apps?


## 📦 Supported Distributions

- Ubuntu / Debian (apt)
- Arch Linux (pacman + AUR via yay)
- Fedora (dnf)
- openSUSE (zypper)
- Nix (nix-env)
- Flatpak
- Snap

## ✨ Features 🌟

### **Application Catalog**  
150+ applications across 15 categories: browsers, communication, dev tools, terminals, media, creative software, gaming, office, VPN/network, security, and more.

### **Smart Script Generation**  
- Detects already-installed packages
- Handles AUR packages automatically on Arch
- Enables RPM Fusion when needed on Fedora
- Parallel installation for Flatpak
- Network retry with exponential backoff
- Progress bars with ETA
- Colored output and summary reports

### **Availability Awareness**  
Shows which apps are available for your selected distro, with instructions for unavailable packages.




## �📸 Screenshots 🖼️

![](src/screenshots/1.png)
![](src/screenshots/2.png)
![](src/screenshots/3.png)




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


## 🛠️ Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- GSAP


## 🚀 Usage
you can use the Arrow Keys or `h` `j` `k` `l` to navigate, `Enter` to select, `Esc` to go back, `Space` to toggle selection.
1. Select your distribution from the dropdown
2. Browse categories and select applications
3. Copy the generated command or download the full install script
4. Run the script on your Linux machine

## 🤝 Contribution

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.



## 🎯 Roadmap

### Completed
- [x] Multi-distro support (Ubuntu, Debian, Arch, Fedora, openSUSE)
- [x] Nix, Flatpak & Snap universal package support
- [x] 150+ applications across 15 categories
- [x] Smart script generation with error handling
- [x] AUR helper integration (yay) for Arch
- [x] Keyboard navigation (Vim keys + Arrows)
- [x] Dark / Light theme toggle
- [x] Copy command & Download script
- [x] Package availability indicators
- [x] Custom domain

### Planned

- [ ] Search & filter applications
- [ ] Winget support (Windows)
- [ ] Homebrew support (macOS)
- [ ] Dockerfile for containerized deployment
- [ ] Save custom presets / profiles
- [ ] Share configurations via URL
- [ ] More distros (Gentoo, Void, Alpine)
- [ ] PWA support for offline use
- [ ] Companion CLI tool
- [ ] Expand application catalog (200+)
- [ ] Dotfiles integration

<div align="right">

## 📜 License
Licensed under the [GPL-3.0 License](LICENSE) <br>
Free software — you can redistribute and modify it under the terms of the GNU General Public License.

<p align="center">
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/footers/gray0_ctp_on_line.svg?sanitize=true" />
</p>
