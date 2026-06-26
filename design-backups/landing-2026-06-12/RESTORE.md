# Backup del diseño de la landing — 2026-06-12

Copia de seguridad del diseño de la landing page ANTES del rediseño con la skill
`design-taste-frontend`. Para volver al diseño anterior, copia estos archivos de
vuelta a su ubicación original en `src/`:

| Backup | Restaurar a |
|---|---|
| `app/page.tsx` | `src/app/page.tsx` |
| `app/layout.tsx` | `src/app/layout.tsx` |
| `app/globals.css` | `src/app/globals.css` |
| `sections/*.tsx` | `src/components/sections/` |
| `layout/*.tsx` | `src/components/layout/` |
| `components/MaintenanceBanner.tsx` | `src/components/MaintenanceBanner.tsx` |
| `components/FAB.tsx` | `src/components/ui/FAB.tsx` |

## Restaurar todo de una vez (en el servidor, desde /opt/booklysharp)

```bash
cd /opt/booklysharp
cp design-backups/landing-2026-06-12/app/page.tsx        src/app/page.tsx
cp design-backups/landing-2026-06-12/app/layout.tsx      src/app/layout.tsx
cp design-backups/landing-2026-06-12/app/globals.css     src/app/globals.css
cp design-backups/landing-2026-06-12/sections/*.tsx      src/components/sections/
cp design-backups/landing-2026-06-12/layout/*.tsx        src/components/layout/
cp design-backups/landing-2026-06-12/components/MaintenanceBanner.tsx src/components/
cp design-backups/landing-2026-06-12/components/FAB.tsx   src/components/ui/FAB.tsx
npm run build && pm2 restart ecosystem.config.js
```
