# ColorPicker Chrome Extension

A Chrome extension for picking colors from webpages and copying them to the clipboard.

## Shared components

This app uses shared UI components from the [Chrome Extension Component Library](https://github.com/larsliin/ChromeExtensionComponentLibrary/blob/main/docs/components/index.md).

## Install

Use Node.js 24 LTS (recommended) and run:

```bash
npm install
```

The shared library is downloaded automatically from the pinned `v0.1.0` GitHub
Release. No library checkout, sibling `packages/` directory, or GitHub login is
needed. Commit `package.json` and `package-lock.json` together when updating its
release URL. Use `npm ci` for an exact lockfile install.

## Build

```bash
npm run build:extension
```

The build output is generated in `dist-extension/`.
