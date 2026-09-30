
# Creator Intelligence Studio

Creator Intelligence Studio is a private, evidence-led production workspace for a solo YouTube creator. The public GitHub Pages frontend stores no credentials. Protected requests pass through a Cloudflare Worker to a Google Apps Script backend, which uses Google Sheets as the workflow database.

## Workflow

1. Create a project from a topic, URL, article, or notes.
2. Add and classify research sources.
3. Record findings and link them to evidence.
4. Review claims, verification states, and contradictions.
5. Generate a research brief and choose a story angle.
6. Write evidence-linked script sections.
7. Build the visual plan and editing blueprint.
8. Prepare titles, thumbnails, metadata, chapters, and Shorts ideas.
9. Move the project through its production stages.

Saved sources, claims, angles, script sections, visuals, edit beats, and publishing packages can be loaded back into their workspaces by project.

## Architecture

```text
GitHub Pages frontend
        |
        | HTTPS requests with a session-only admin token
        v
Cloudflare Worker CORS bridge
        |
        v
Google Apps Script API
        |
        v
Google Sheets database
```

The admin token is entered at runtime and kept in `sessionStorage`, so it is cleared when the browser session ends. It must never be committed to this repository. Any future AI provider key must be stored only as a Cloudflare Worker secret or Google Apps Script property. The browser should call a narrow backend action and must never receive the provider key.

## Local checks

The project has no build step. With Node.js installed, run:

```text
npm test
```

The checks validate JavaScript syntax, unique HTML IDs, form-label targets, DOM references, required result panels, common secret formats, request timeouts, and responsive layout rules.

Local previews can show the backend as offline because the production CORS bridge may allow only the deployed GitHub Pages origin. Check the public Worker health endpoint or the deployed site when validating the live connection.

## Deployment

- Frontend: GitHub Pages from the repository's configured publishing branch.
- CORS bridge: Cloudflare Worker `creator-intelligence-cors-c03d`.
- Backend: Google Apps Script web app.
- Database: Google Sheets.

Before publishing a release, confirm the Worker health check, authenticate from the deployed frontend, complete one end-to-end demo project, and verify the saved rows in Google Sheets.
