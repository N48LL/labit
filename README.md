# <img src="public/favicon.svg" width="28" height="28" alt="Labbit" /> Labbit

Simple self-hosted portal for your homelab. Easy to set up, easy to manage.

## Features

- Drag-and-drop sections and widgets
- Service health checks with response times
- Clock widget
- Multiple boards
- Custom title, logo and favicon
- Themes, dark/light mode
- Edit everything from the UI, no config files
- 5000+ icons, plus your own uploads or direct downloads from sources like selfh.st


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
    environment:
      - NUXT_PUBLIC_READ_ONLY=false
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
```

Set `NUXT_PUBLIC_READ_ONLY=true` to lock the UI and disable editing.

> [!WARNING]
> Labbit has no built-in authentication. Run it on your LAN, over a VPN, or behind an auth proxy (Authelia, Authentik, Tailscale).


## Development

```bash
npm install
npm run dev
```

```bash
pnpm install
pnpm dev
```

## Tech

♥ Nuxt 4 &middot; NuxtUI v4 &middot; Pinia &middot; Tailwind CSS v4

## License

[MIT](LICENSE)
