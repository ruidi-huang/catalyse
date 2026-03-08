# Hackathon Starter Cleanup Design

## Goal

Strip the stock `create-next-app` boilerplate and leave a clean, demo-oriented Next.js starting point for the BioRender hackathon app.

## Current State

The app still contains the default Next.js landing page, starter metadata, font setup, theme variables, and unused SVG assets from the template. That creates noise and slows down first-pass demo implementation.

## Approved Direction

Use a clean demo shell instead of a completely blank page.

- Replace the default home page with a minimal single-page scaffold that matches the BioRender demo shape.
- Remove Next.js and Vercel branding, links, and stock imagery.
- Simplify global CSS to a small reset and a neutral visual base.
- Replace template metadata with project-specific metadata.
- Delete unused public starter assets and the default favicon so the repo starts clean.

## UI Direction

Keep the interface intentionally minimal and utilitarian:

- light background
- dark text
- restrained surface styling
- strong spacing and hierarchy
- no decorative marketing content

The page should feel ready for wiring in hackathon functionality immediately, not polished as a final product.

## File Changes

- Modify `app/page.tsx`
- Modify `app/layout.tsx`
- Modify `app/globals.css`
- Delete `public/file.svg`
- Delete `public/globe.svg`
- Delete `public/next.svg`
- Delete `public/vercel.svg`
- Delete `public/window.svg`
- Delete `app/favicon.ico`

## Verification

- Run `npm run lint`
- Run `npm run build`

## Notes

Avoid touching `package.json` and `package-lock.json` because they already contain user changes unrelated to this cleanup.
