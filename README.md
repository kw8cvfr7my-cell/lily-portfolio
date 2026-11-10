# lily-portfolio

lily-portfolio

## AI Explorer Island

An interactive, recruiter-first portfolio presenting Lily Yang as an **AI Marketing Builder**. It connects verified experience with clearly labelled projects in progress and future ideas.

**Owner:** Lily Yang (杨莉)  
**Status:** MVP published on GitHub Pages  
**Live site:** [AI Explorer Island](https://yllld8848lilyang.github.io/lily-portfolio/)  
**Repository:** [yllld8848Lilyang/lily-portfolio](https://github.com/yllld8848Lilyang/lily-portfolio)

## Project direction

Visitors should understand Lily's positioning, strongest evidence, and current work quickly, then explore the island for more detail. The experience combines user insight, AI product thinking, growth marketing, and product operations. Exploration supports the story; it does not hide the evidence.

All material is labelled as completed experience, an in-progress independent project, or a future concept. Unverified figures and confidential company material are excluded until cleared.

## Documentation

- [Project overview](docs/PROJECT_OVERVIEW.md)
- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Information architecture](docs/INFORMATION_ARCHITECTURE.md)
- [Portfolio content plan](docs/CONTENT_PLAN.md)
- [Content strategy](docs/CONTENT_STRATEGY.md)
- [Technical architecture](docs/TECHNICAL_ARCHITECTURE.md)
- [Development roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Preparation checklist](docs/PREPARATION_CHECKLIST.md)
- [Design system](docs/DESIGN_SYSTEM.md)
- [Content assets](docs/CONTENT_ASSETS/README.md)
- [Claude Code prompts](docs/PROMPTS/CLAUDE_CODE_PROMPTS.md)
- [Cursor prompts](docs/PROMPTS/CURSOR_PROMPTS.md)

## Status labels

- **Completed experience**: supported by the supplied CV or other evidence; personal contribution and public-use permission still need confirmation where marked.
- **In progress**: work underway; not described as launched or complete.
- **Concept**: a proposed direction without a verified implementation.
- **Needs confirmation**: source documents disagree or do not provide enough evidence.

## Inspiration

The interactive island interface is based on [island-portfolio](https://github.com/panggungunvibe/island-portfolio). This project uses its bundled template workflow; it does not reuse the original author's personal content.

## Publish with GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys `dist/` from the `main` branch. GitHub Pages is configured to use **GitHub Actions**. The build uses the `/lily-portfolio/` project-site path.
