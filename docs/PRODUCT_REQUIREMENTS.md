# Product Requirements

## Goal

Create a bilingual, recruiter-first portfolio that shows the evidence behind Lily Yang's AI Marketing Builder positioning and remains easy to use on desktop and mobile.

## Audience needs

- Recruiters need a fast summary, role-relevant evidence, CV access, and a contact path.
- Hiring managers need to understand Lily's contribution, decisions, process, and outcomes.
- Collaborators need to distinguish live work from proposed ideas and find project details.

## MVP requirements

1. English and Chinese language switch with equivalent navigation and content.
2. Landing view with positioning, concise introduction, featured work, CV action, and exploration entry.
3. Four portfolio areas in the user-facing information architecture: About Lily, Insight Forest, AI Projects, and Career Harbor. About Lily is the homepage/profile. The other three are island exploration areas.
4. Three matching scene/map entries, map/navigation counts, and readable content panels. This follows Lily's explicit grouping, where the homepage is the first module and the island has three further areas.
5. Honest empty states for sections with no confirmed material.
6. Status labels for completed experience, in-progress work, and concepts.
7. Keyboard-accessible content navigation and a non-3D fallback.
8. Responsive layouts, reduced-motion support, optional sound, and theme controls inherited from the source template where practical.
9. Static build and GitHub Pages configuration, including project-site base path.

## Content rules

- Do not publish personal contact details or internal company material without Lily's confirmation.
- Treat CV metrics as claims requiring source, period, scope, and contribution checks.
- Label synthetic examples and never present them as real users or outcomes.
- Do not imply that a concept PRD is a running prototype.
- Keep “AI Marketing Builder” as the agreed portfolio positioning; describe product-operations roles as supporting experience rather than replacing that positioning.

## Acceptance criteria

- A recruiter can find the introduction, featured case, CV, and contact route without exploring the 3D scene.
- Both languages cover the complete MVP navigation and content.
- The homepage/profile plus three exploration areas are presented as four portfolio areas; the map and scene total counts match the three explorable areas.
- Unconfirmed or empty content is not replaced with template examples.
- The site builds as static files and its deployment base path matches a GitHub Pages project site.
- Core content remains available when WebGL or motion effects are unavailable.
