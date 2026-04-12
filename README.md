# <img src="public/favicon.svg" width="28" height="28" alt="Labbit" /> Labbit

A self-hosted homepage portal for your homelab services.

## Features

- Drag-and-drop sections and widgets
- Visual icon picker (5000+ icons)
- Custom icon uploads
- Labels with color coding
- Theme customization (colors, card styles)
- Dark/light mode
- Edit mode with right-click context menus

## Docker

```yaml
services:
  labbit:
    image: n48ll/labbit:latest
    ports:
      - 3000:3000
    volumes:
      - ./data/boards:/app/data/boards
      - ./data/icons:/app/data/icons
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
```

## Development

```bash
npm install
npm run dev
```

```bash
pnpm install
pnpm dev
```

Open [localhost:3000](http://localhost:3000)

## Tech

♥ Nuxt 4 &middot; NuxtUI v4 &middot; Pinia &middot; Tailwind CSS v4

## License

[MIT](LICENSE)
