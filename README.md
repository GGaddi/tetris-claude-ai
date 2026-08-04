# DROP // Custom Tetris

A Tetris clone built with React + Vite, with a rules panel so you can reshape
how the game plays without touching code.

## Run it locally

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (defaults to **http://localhost:5173**).

Other scripts:

```bash
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

## Controls

| Key                | Action           |
| ------------------ | ---------------- |
| `←` / `→`          | Move             |
| `↓`                | Soft drop        |
| `Space`             | Hard drop        |
| `↑` or `X`          | Rotate clockwise |
| `Z`                 | Rotate counter-clockwise |
| `C` or `Shift`      | Hold piece       |
| `P`                 | Pause / resume   |
| `R`                 | Restart          |

## Customizable rules

Click **Rules** in-game to open the settings panel. Everything below is
adjustable there (changes apply on restart):

- Board width / height
- Starting level and lines-required-per-level
- Drop speed curve (starting speed + how aggressively it ramps up)
- Randomizer: 7-bag (standard, fair) or fully random
- Next-piece preview count
- Ghost piece on/off
- Hold piece on/off
- Lock delay
- Points awarded for single/double/triple/tetris line clears

Defaults live in `src/game/constants.js` (`DEFAULT_SETTINGS` and
`SETTINGS_LIMITS`) if you'd rather change the out-of-the-box values or the
min/max sliders allow.

## Project structure

```
src/
  game/
    constants.js     # default settings + slider limits
    tetrominoes.js    # piece shapes, colors, rotation, bag randomizer
    board.js           # board creation, collision, merging, line clears
    useTetris.js        # game engine: React hook wrapping a reducer + gravity loop
  components/
    Board.jsx          # renders the playfield grid
    PiecePreview.jsx    # mini preview used for Hold + Next queue
    StatusPanel.jsx     # score / level / lines
    SettingsPanel.jsx    # the Rules editor
  App.jsx               # layout + keyboard input
  App.css                # visual styling
```

## Notes on the engine

- Rotation uses a simple bounding-box rotation with small wall kicks
  (not full SRS, but handles standard play well).
- The 7-bag randomizer guarantees every piece appears once per shuffled
  bag of 7, matching modern Tetris guideline behavior; "fully random"
  is the classic NES-style unweighted roll.
- Gravity runs on a `setInterval` timer whose speed is derived from
  `baseDropMs * speedCurve^(level-1)`, floored at `minDropMs`.
