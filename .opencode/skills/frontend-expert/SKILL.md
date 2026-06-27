---
name: frontend-expert
description: Shared frontend engineering standards for Astro, React, TailwindCSS, UI/UX and API integrations. Use whenever implementing or modifying frontend code.
---

# Frontend Expert Skill

## Purpose

This skill provides the engineering standards that every agent must follow when working on frontend code.

It applies to:

- Astro
- React
- TypeScript
- TailwindCSS
- HTML
- CSS
- API integrations
- Responsive Design
- UI Components
- Layouts
- Forms
- Dashboards
- Landing Pages

---

# Core Principle

Every project already has a visual identity.

Your responsibility is **to integrate**, not redesign.

Before writing code, study the project and adapt to its existing design language.

Never generate interfaces that obviously look AI-generated.

---

# Project Analysis

Always inspect the project before making changes.

Identify:

- Folder structure
- Existing architecture
- Component organization
- Naming conventions
- Existing reusable components
- Existing layouts
- Existing utility classes
- Existing hooks
- Existing services
- Existing API layer
- Existing icons
- Existing typography
- Existing spacing system
- Existing shadows
- Existing colors
- Existing border radius
- Existing animations

Prefer extending existing solutions over creating new ones.

---

# UI Guidelines

The new UI must blend naturally with the rest of the application.

Never introduce a different design language.

Avoid:

- Random gradients
- Glassmorphism unless already used
- Huge rounded corners
- Oversized shadows
- Excessive animations
- Oversized typography
- Random color palettes
- Decorative effects without purpose

Prefer:

- Clean layouts
- Consistent spacing
- Professional typography
- Balanced whitespace
- Simple hierarchy
- Subtle shadows
- Consistent colors
- Pixel-perfect alignment

The result should feel handcrafted.

---

# TailwindCSS

Always:

- Reuse existing utility patterns
- Keep utility classes organized
- Create reusable components
- Keep responsive behavior consistent
- Use the project's spacing scale
- Follow existing breakpoint conventions

Avoid arbitrary values unless already used throughout the project.

Do not duplicate utility combinations repeatedly.

---

# Astro

Follow Astro best practices.

Prefer:

- Server rendering
- Islands architecture
- Reusable layouts
- Reusable components
- Minimal client-side JavaScript

Hydrate only components that require interactivity.

Avoid unnecessary hydration.

---

# React

Write production-ready React.

Prefer:

- Functional components
- Hooks
- Composition
- Custom hooks
- Memoization only when justified
- Strong typing

Avoid:

- Prop drilling
- Unnecessary state
- Duplicated logic
- Large monolithic components
- Unnecessary re-renders

---

# API Integrations

Support:

- REST APIs
- GraphQL APIs

Always separate concerns.

Recommended structure:

```
services/
hooks/
lib/api/
```

Presentation components should not contain networking logic.

Always handle:

- Loading states
- Empty states
- Error states
- Success states
- Retry logic when appropriate

Use optimistic updates only when beneficial.

---

# Forms

Forms must:

- Validate inputs
- Display useful validation messages
- Preserve entered data
- Disable submit while processing
- Show loading feedback
- Show success feedback
- Handle API failures gracefully

Accessibility is required.

---

# Accessibility

Every UI implementation must include:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- aria-* attributes when appropriate
- Accessible labels
- Proper contrast
- Screen reader compatibility

Accessibility is never optional.

---

# Performance

Optimize for:

- Lighthouse
- Core Web Vitals

Prefer:

- Lazy loading
- Code splitting
- Image optimization
- Minimal JavaScript
- Small bundles

Avoid unnecessary dependencies.

---

# Code Quality

Every implementation should be:

- Readable
- Modular
- Typed
- Reusable
- Maintainable
- Easy to extend

Follow SOLID principles when applicable.

Avoid hacks.

Avoid duplicated code.

---

# Before Creating Anything New

Always check if the project already contains:

- A similar component
- A similar page
- A reusable hook
- A reusable service
- A reusable utility
- Existing styles
- Existing layouts

Reuse existing code whenever possible.

Consistency is more important than originality.

---

# Design Adaptation

Match the project's existing:

- Typography
- Colors
- Borders
- Shadows
- Animations
- Card styles
- Buttons
- Inputs
- Navigation
- Tables
- Modals
- Icons

The new feature should appear as if it has always existed in the application.

---

# Expected Output

Every contribution should:

- Feel handcrafted
- Match the existing project
- Be production ready
- Require minimal refactoring
- Follow existing conventions
- Avoid unnecessary complexity

Your goal is to improve the application without changing its visual identity.