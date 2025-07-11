# AGENTS.md – Accessibility Override Instructions for Codex Cloud

## 📍 Objective

Make the **ExtJS 3.4 components** compliant with **WCAG 2.2 AA accessibility standards**, using **axe-core** for automated testing and validation.

Instead of modifying the original ExtJS component source code, you must create **separate accessibility override scripts** that patch the behavior of existing components. These overrides will be loaded **after `ext-all.js`** in the example HTML files.

---

## 📁 Project Structure (Updated)

```
/extjs-3.4/
├── examples/                  # Standalone HTML examples using ExtJS components
│   ├── button/
│   │   ├── buttons.html       # Will include override.js after ext-all.js
│   └── ...
├── overrides/                # Accessibility override files (NEW)
│   ├── ButtonOverride.js     # Example override for Ext.Button
│   └── FormFieldOverride.js
├── src/                      # DO NOT MODIFY this directory anymore
├── resources/
├── ext-all-debug.js
└── test/a11y/
    └── run-a11y.ts
```

---

## ✅ Scope of Fixes

### You Must

* Meet all WCAG 2.2 AA accessibility requirements using component override scripts.
* Fix issues such as:

  * Missing accessible names
  * Improper ARIA roles
  * Keyboard navigation and focus handling
  * Semantic HTML misuse
  * Any violations detected by axe-core
* Use the original component structure but override methods like `onRender` to improve markup accessibility.

### You Must NOT

* Modify any files inside `/src/`
* Refactor or rewrite original ExtJS source code
* Change any CSS, layout, color, or visual presentation
* Alter ExtJS public APIs or introduce breaking changes

---

## 🧋 How to Apply Overrides

### 1. Create Override Files

Write overrides for accessibility fixes using the ExtJS `Ext.override()` mechanism.

Example:

```js
// overrides/ButtonOverride.js
Ext.override(Ext.Button, {
  onRender: function (ct, position) {
    this.callParent(arguments);
    this.el.dom.setAttribute('aria-label', this.text || 'Button');
  }
});
```

### 2. Inject Override in HTML Examples

In the corresponding HTML file under `examples/`, inject the override script **after** the existing `ext-all.js` script:

```html
<script src="../../ext-all.js"></script>
<script src="../../overrides/ButtonOverride.js"></script>
```

You may inject multiple overrides as needed, but only relevant ones for that example.

---

## 🧪 Accessibility Test Workflow (axe-core)

Same testing flow as before, with new override structure:

```sh
npm run axe -- button/buttons.html
```

Outputs:

```
a11y-reports/button/buttons.html.json
```

Ensure this report shows **0 error violations** after your overrides are applied.

---

## 🗓️ Workflow (Updated)

1. Identify the components that need accessibility fixes.
2. Locate their source files in `/src/` but **do not modify them**.
3. Inspect methods like `onRender` and markup template definitions.
4. Create an override in `/overrides/` that patches the necessary behavior.
5. Inject the override script(s) in the corresponding `examples/<component>/*.html` file(s).
6. Run `npm run build` if needed to recompile or re-bundle test assets.
7. Run axe-core validation with `npm run axe`.
8. Repeat until the axe report shows **0 error violations**.

---

## 🔍 Common Violations & Fixes

| Violation                               | Recommended Fix (in override)                 |
| --------------------------------------- | --------------------------------------------- |
| Button has no accessible name           | Override `onRender` and add `aria-label`      |
| Layout table interpreted as data        | Override and add `role="presentation"`        |
| `<input>` missing label                 | Inject `aria-label` or add hidden label       |
| Decorative markup exposed to AT         | Add `aria-hidden="true"`                      |
| Non-interactive element used as control | Add `role`, `tabindex`, and keyboard handlers |

---

## 📚 Commit Guidelines

Use descriptive, conventional commits like:

```bash
feat(a11y): add Button accessibility override with aria-label
```

---

## ❌ Out of Scope

* CSS changes
* Changes inside `/src/`
* Any fixes not tied to axe-core violations
* Modifying unrelated components or examples

---

## 🧲 Completion Criteria

* All relevant `examples/*.html` pass `axe-core` tests with **0 violations**
* All fixes are implemented as ExtJS `Ext.override()` scripts in `/overrides/`
* No changes are made to the original `src/` codebase
* All override scripts are correctly injected into the example HTML files

---

## 🎨 Accessibility Styling (Optional – Future Phase)

Currently, **you must not create or modify styles** for accessibility purposes.

### ❌ Styling Modifications You Must Not Make

* Do **not** change or add any CSS
* Do **not** modify layout, spacing, colors, fonts, or contrast
* Do **not** add custom classes or stylesheets
* Do **not** visually alter components in any way

All accessibility fixes must rely on:

* Semantic HTML
* ARIA attributes
* Keyboard support
* Structural markup fixes

### ✅ If Styling Becomes Necessary (Phase 2 – Optional)

If we decide to support accessibility styling in a future phase (e.g., for contrast or focus indicators), a **dedicated override stylesheet** may be created:

```
/overrides/
├── styles/
│   └── accessibility.css   # Optional future accessibility styles
```

In that case:

* You will be explicitly instructed to include `accessibility.css` after the main stylesheet in example HTML files.
* Only then will color contrast, visible focus outlines, or other visual issues be in scope.

---

## 🚀 Final Notes

* Axe-core is the **validation oracle**. Use its results to guide and verify all changes.
* Only iterate on source files inside `/src/` to understand behavior; do not modify them.
* Fixes must be implemented using overrides only.
* The goal is zero axe violations without changing component appearance.
* Limit changes to components and examples assigned to you.

---
