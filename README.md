# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.


## V6 polish fixes

- Replaced frame-to-frame exploded-pose interpolation with deterministic pose updates to stop the wristwatch parts from wobbling, drifting, or visually tearing during explode scrubbing. Mechanism animation is now layered on top of the stable exploded pose.
- Increased initial presentation camera distance and widened the zoom range so objects no longer open overly zoomed-in.
- Component trees now recursively open on object selection. The Ballpoint Pen now exposes its cartridge, return spring, click cam, writing tip, and tungsten-carbide ball directly in the component hierarchy, so these options do not need to be manually discovered.
- Added explicit CSS for the landing object icons and forced the layer-card icon container to use true geometric centering.
