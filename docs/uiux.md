# UI/UX Theme — Telkom University x PuTI CTFd

## Brand Identity Reference

### Telkom University Official Colors

| Warna      | Hex       | Deskripsi                        |
| ---------- | --------- | -------------------------------- |
| Red        | `#ed1e28` | Semangat eksplorasi & keberanian |
| Maroon     | `#b6252a` | Identitas utama logo             |
| Dark Gray  | `#55565b` | Teknologi modern                 |
| Light Gray | `#959597` | Pendukung, modern                |

### PuTI (Direktorat Pusat Teknologi Informasi)

- Logo: gelombang merah (`#ed1e28`) — dinamis, bergerak maju
- Unsur pendukung: abu-abu — support system utama
- Maskot: Lampu IDE, visi luas, integritas (biru)

---

## Color Palette — CTFd Theme

### Bootstrap 5 Variable Mapping

| Bootstrap Var | Warna        | Hex       | Penggunaan UI                                    |
| ------------- | ------------ | --------- | ------------------------------------------------ |
| `$primary`    | Maroon Tel-U | `#b6252a` | Navbar, tombol utama, link, header, active state |
| `$info`       | Red Tel-U    | `#ed1e28` | Accent, info badge, hover state, highlight       |
| `$secondary`  | Dark Gray    | `#55565b` | Tombol sekunder, muted text, border              |
| `$light`      | Light Gray   | `#f8f9fa` | Background cards, container                      |
| `$dark`       | Near Black   | `#2d2d2d` | Dark mode background, footer                     |
| `$success`    | Hijau        | `#198754` | Solved challenge, success state                  |
| `$warning`    | Kuning       | `#ffc107` | Warning state                                    |
| `$danger`     | Dark Red     | `#dc3545` | Error, delete, danger state                      |

### CSS Custom Properties

```css
--theme-color: #b6252a; /* Primary brand color (navbar, jumbotron) */
--bs-primary: #b6252a;
--bs-info: #ed1e28;
--bs-secondary: #55565b;
```

---

## Design Tokens

### Typography

| Elemen          | Font    | Weight    |
| --------------- | ------- | --------- |
| Body            | Lato    | 400 / 700 |
| Headings        | Raleway | 500       |
| Jumbotron title | Raleway | 500       |

### Spacing

- Button padding: `0.6rem`
- Input padding: `0.6rem`
- Card border-radius: default Bootstrap 5

### Component Styling

#### Navbar

- Background: `#b6252a` (primary) via `--theme-color`
- Text: white
- Active link: `#ed1e28` accent

#### Buttons

- `.btn-primary`: bg `#b6252a`, hover darker maroon
- `.btn-info`: bg `#ed1e28`, hover brighter red

#### Challenge Cards

- Solved: green `#29c830` / `#37d63e`
- Unsolved: white (light) / `var(--bs-gray-dark)` (dark)
- Box shadow on hover

#### Jumbotron

- Background: `#b6252a` via `--theme-color`
- Text: white

#### Tables

- Hover: `rgba(0,0,0,0.05)`
- Header: `#b6252a` (primary)

---

## Dark Mode

Tetap dipertahankan dengan penyesuaian:

- Background: `#2d2d2d`
- Card: `#333`
- Text: `#e0e0e0`
- Accent tetap `#ed1e28`

---

## File Structure Theme

```
CTFd/themes/telkom-university/
├── assets/
│   ├── scss/
│   │   ├── main.scss              # Entry point, override Bootstrap vars
│   │   └── includes/
│   │       ├── components/
│   │       │   ├── _challenge.scss
│   │       │   ├── _jumbotron.scss
│   │       │   ├── _sticky-footer.scss
│   │       │   ├── _table.scss
│   │       │   └── _graphs.scss
│   │       └── utils/
│   │           ├── _fonts.scss
│   │           ├── _opacity.scss
│   │           ├── _min-height.scss
│   │           ├── _cursors.scss
│   │           └── _lolight.scss
│   ├── js/
│   └── img/
├── templates/
├── static/          # Built output
├── vite.config.js
└── package.json
```

---

## References

- [Telkom University Logo & Color](https://it.telkomuniversity.ac.id/en/color-codes-of-telkom-university-logo/)
- [Logo PuTI](https://it.telkomuniversity.ac.id/logo-puti/)
- [Maskot PuTI](https://it.telkomuniversity.ac.id/maskot-puti/)
