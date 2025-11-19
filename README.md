# 🧟 Zombie Crowd Shooter: Titan Evolution

![CI](https://github.com/<USER>/<REPO>/actions/workflows/ci-cd.yml/badge.svg)

A fast-paced 3D browser game where you command a growing squad through waves of zombies, merging units to create powerful Titans and evolving your strategy as you progress through increasingly challenging levels.

![Game Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)

## 🎮 Game Overview

**Zombie Crowd Shooter: Titan Evolution** is an action-packed crowd evolution game built with Three.js. Lead your squad through zombie-infested territory, collect weapons, merge your units into powerful Titans, and survive as long as possible while racking up distance and coins.

### Key Features

- **🚶‍♂️ Crowd Mechanics**: Start with a small squad and grow it by collecting weapon boxes
- **⚔️ Titan Merge System**: Merge units to create powerful Titans with enhanced combat abilities
- **🧟 Dynamic Enemy Waves**: Face increasingly difficult zombie hordes that scale with your progress
- **📊 Level Progression**: Advance through checkpoints with new challenges and rewards
- **💎 Upgrade System**: Enhance your starting damage and unit count between runs
- **⏸️ Pause Functionality**: Pause anytime to take a breather or strategize
- **🏆 Leaderboard**: Compete for the best distance with Firebase integration
- **🎨 Polished UI/UX**: Modern, responsive interface with smooth animations

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shooting_game_demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

The optimized build will be created in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 🎯 How to Play

1. **Start**: Click "START RUN" from the main menu
2. **Movement**: Your squad automatically moves forward
3. **Collect**: Pick up weapon boxes to add units to your squad
4. **Merge**: When your squad reaches certain thresholds, units automatically merge into Titans
5. **Survive**: Fight through zombie waves and try to cover maximum distance
6. **Upgrade**: Use collected coins to upgrade damage and starting units
7. **Compete**: Beat your high score and climb the leaderboard!

### Controls

- **Pause**: Click the "⏸ PAUSE" button or press ESC (if implemented)
- **Resume**: Click "RESUME" from the pause menu
- **Quit**: Return to main menu from the pause screen

## 🛠️ Technology Stack

### Core Technologies
- **[Three.js](https://threejs.org/)** - 3D graphics rendering
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[GSAP](https://greensock.com/gsap/)** - Animation library
- **[Firebase](https://firebase.google.com/)** - Backend services (leaderboard)

### Styling
- **[TailwindCSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **PostCSS** - CSS processing

## 📁 Project Structure

```
shooting_game_demo/
├── src/
│   ├── core/              # Core game systems
│   │   ├── GameApp.js     # Main game application
│   │   ├── LevelManager.js # Level progression logic
│   │   └── ...
│   ├── entities/          # Game entities
│   │   ├── Enemy.js       # Enemy/Zombie logic
│   │   ├── WeaponBox.js   # Collectible weapon boxes
│   │   └── ...
│   ├── systems/           # Game systems
│   │   ├── SquadSystem.js # Squad management & Titan merging
│   │   └── ...
│   ├── ui/                # UI components
│   └── main.js            # Entry point
├── public/                # Static assets
├── dist/                  # Production build output
├── index.html             # HTML template
├── style.css              # Global styles
└── package.json           # Project dependencies
```

## 🎨 Key Systems

### Squad System
Manages player units including:
- Unit spawning and positioning
- Squad power calculation
- Titan merge mechanics (consolidating multiple units into powerful Titans)
- Unit health and damage

### Level Manager
Handles:
- Distance tracking
- Level progression and checkpoints
- Difficulty scaling
- Visual feedback for level transitions

### Enemy System
Controls:
- Zombie spawning patterns
- Enemy behavior and AI
- Health and damage scaling
- Wave difficulty progression

## 🔧 Configuration

### Firebase Setup
To enable leaderboard functionality:
1. Create a Firebase project
2. Add your Firebase config to the appropriate file
3. Set up Firestore database with appropriate security rules

### Upgrade Tuning
Modify upgrade costs and effects in the upgrade system files to balance gameplay.

## 🐛 Known Issues

See the issues section for current bugs and planned features.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 Development Notes

- Built with Entity-Component-System (ECS) inspired architecture
- Optimized for browser performance with efficient rendering
- Mobile-responsive design (touch controls may need implementation)
- Continuous integration of visual polish and gameplay balance

## 📄 License

This project is part of a demo/portfolio showcase.

## 👨‍💻 Author

**Tony's Shooting Game Demo**

---

**Enjoy the game and happy merging!** 🎮✨
