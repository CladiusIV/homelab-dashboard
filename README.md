# Homelab Dashboard

Static, configuration-driven service directory. It keeps the existing dark dashboard design and deploys as plain static files through Cloudflare Pages / Workers static hosting.

## Structure

```text
.
├── index.html
├── assets/
│   ├── app.js
│   └── styles.css
├── config/
│   └── services.json
└── README.md
```

## Configure services

Edit `config/services.json`.

Each machine has:
- `id`: stable machine identifier
- `name`: displayed machine name
- `description`: optional helper text
- `host`: optional LAN address shown in the machine heading
- `services`: services assigned to that machine

Each service supports:
- `id`, `name`, `description`
- `category` and `icon`
- `protocol` and `port` (descriptive configuration fields)
- `url`: the actual URL the browser should open; set to `null` until it is reachable from the browser
- `internalUrl`: optional private origin metadata; not rendered as a clickable link
- `access`: `public` or `private` (informational only; it does not enforce authorization)
- `enabled`: set to `false` to hide the service
- `note`: optional setup note

**Important:** `url` is the browser destination. The dashboard is hosted outside your LAN, so a private `192.168.x.x` address is only reachable when the viewer has network access to that LAN (for example, through a VPN). Do not put a private origin in `url` if you do not want the browser to attempt to open it. For the radio, the public URL is intentionally `null` until the public listener hostname is configured. `internalUrl` records the current LAN origin for future tunnel configuration.

The `access` field is only a label. Actual protection must be implemented separately using Cloudflare Access, application authentication, or VPN controls.

Projects use the same `url` and `enabled` fields.

## Local preview

Because the page loads `config/services.json` with `fetch`, serve the project over HTTP instead of opening `index.html` directly with `file://`.

From the repository root:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

Commit and push the complete directory structure. No build step or dependencies are required. Configure the static deployment output directory to the repository root (`.`), with a no-op build command such as `exit 0`.

## Current configuration notes

- Ubuntu Server host: `192.168.0.143`
- Cockpit: HTTPS port `9099`
- Prometheus: HTTP port `9090`
- Grafana: HTTP port `3000`
- Crafty Controller: HTTPS port `8443`
- Homarr: HTTP port `7575`
- Radio listener: internal HTTP origin port `3001`; public URL pending
- ComfyUI: separate PC; port `8188` is a provisional default and host address is not yet configured
- Minecraft and Navidrome are retained as entries, but their host/URL details are not yet configured
