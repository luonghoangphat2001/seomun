# Assets Convention

## Directory split

- `public/icons`: raw static icon files requested by URL.
- `public/images`: large raster assets such as banners, covers, empty states.
- `src/assets/icons`: typed icon references used by application code.
- `src/assets/images`: typed image references used by application code.

## Icons

- Prefer `lucide-react` for functional UI icons.
- Keep feature menu and action icons as React components, not image files.
- Add custom SVG files only when the icon is brand-specific or unavailable in Lucide.
- When using a custom SVG, place the file under `public/icons` and export its path from `src/assets/icons/index.ts`.

## Images

- Use `webp` by default for raster images.
- Put app-wide shared images under `public/images`.
- Feature-specific images can live under `public/images/<feature-name>`.
- Export shared image paths from `src/assets/images/index.ts` so imports stay consistent.

## Rules

- Do not hardcode asset URLs directly inside page components.
- Do not store business configuration inside `src/assets`.
- Use semantic names such as `authCover`, `emptyState`, `logoMark`.
