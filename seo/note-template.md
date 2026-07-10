# Omo Note publishing template

Use this checklist for conceptual writing published under `/notes/`. An Omo Note is editorial analysis: it is not a paper, peer-reviewed result, product announcement, or report of completed Omo research.

## Page contract

- One focused question and one original point of view.
- A visible `Omo Note` label and a plain-language status statement near the top.
- Claims about external systems linked to primary sources (official documentation, project pages, or papers).
- Omo interpretations written as interpretations: “we think,” “our working definition,” or “the useful question for Omo.”
- No invented experiments, performance numbers, users, products, collaborators, or findings.
- Useful internal links to the Notes index and closely related notes.
- A short source list with descriptive link text; no bare URLs.

## Required metadata

- Unique `<title>` and meta description.
- Canonical `https://www.omo.sh/notes/{slug}`.
- Open Graph `article` metadata and Twitter card metadata.
- `Article` JSON-LD with headline, description, date published/modified, author, publisher, main entity URL, and subject keywords.
- `BreadcrumbList` JSON-LD: Home → Notes → Current note.
- `robots` directive and Omo icon/manifest/font links matching the rest of the site.

## Suggested structure

1. Header: subject tags, H1, concise thesis, editorial-status sentence, date/read-time/topic metadata.
2. Define the question.
3. Explain why the subject is useful now.
4. Present a concrete model, framework, or set of design tests.
5. State limits and unresolved questions.
6. List primary sources.
7. Link to related notes and invite critique.

## Pre-publish checks

- Parse the HTML and every JSON-LD block.
- Confirm exactly one H1 and a descriptive title.
- Check every local link resolves.
- Check external source links return a successful or redirected HTTP response.
- Review at mobile and desktop widths, including keyboard focus and horizontal overflow.
- Add the canonical URL to `sitemap.xml` and the site feed.
