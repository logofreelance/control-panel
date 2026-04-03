# AI UI Style Guide & Rules

This guide contains the mandatory styling rules for all AI agents when revising styles or creating new UI components in this project.

## 🚫 Strictly Prohibited

- **No Letter Spacing**: Never use `tracking-wider`, `tracking-widest`, or any other letter-spacing utilities.
- **No Rings**: Do not use `ring-x` for functional reasons.
- **No Sharp Shadows**: Avoid sharp or heavy shadows. Use soft, diffused shadows (e.g., `shadow-sm`, `shadow-md` with subtle opacity) to maintain a premium glassmorphic feel.
- **No Manual Styling on Shadcn Components**: It is strictly PROHIBITED to add custom styles or override existing ones using `className` on any Shadcn component (e.g., `<Button className="font-bold" />` is forbidden). You must rely exclusively on the component's internal styles and predefined variants.
- **No Manual Styling Outside Shadcn**: Prohibited from giving styles to components outside of the Shadcn framework (e.g., `<div className="..." />` for layouts that a `Card` or shadcn component should handle). All styles must be encapsulated within Shadcn components.

## ✅ Styling Standards

- **Mandatory Shadcn/UI**: You MUST use Shadcn components for all UI elements. If a required component is not yet available in the project, you MUST install it first using the appropriate CLI commands.
- **Typography Weight**: For bold text, always use `font-semibold` as the primary reference for importance. Avoid `font-bold` or `font-black` unless absolutely necessary for extreme emphasis.
- **Aesthetic**: Maintain a minimalist, glassmorphic design language (`bg-white/80`, `backdrop-blur-xl`).

---

_Note: These rules are enforced to ensure visual consistency across the entire control panel._
