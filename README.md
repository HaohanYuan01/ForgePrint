# ForgePrint project page

Project page for **Forging LLM Authorship Fingerprints with Targeted Rewriting**.

Built with [Roman Hauksson's academic project page template](https://github.com/RomanHauksson/academic-project-astro-template) (Astro + Tailwind + MDX). Content lives in a single file: `src/paper.mdx`.

## Before you publish

Search for these and fill them in:

| What | Where | Current value |
| --- | --- | --- |
| arXiv link | `src/paper.mdx`, `<Header links>` | `url: "#"` |
| arXiv ID in the BibTeX | `src/paper.mdx`, BibTeX block | `ARXIV_ID` |
| Repo name in the paper | `sections/09_statements` and the Ethics section here | paper still says `github.com/TODO/ForgePrint` |
| Publication venue | `src/paper.mdx`, `<Header>` | no `conference` prop set yet |

`public/forgeprint-paper.pdf` is a copy of `main.pdf`. Re-copy it whenever the paper changes.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + build into ./dist
```

Requires Node 24 or later.

## Deploy to GitHub Pages

1. Create a repository named `ForgePrint` under `HaohanYuan01` and push this directory to its `main` branch.
2. In the repository, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Push to `main`. `.github/workflows/astro.yml` builds and deploys automatically.

The workflow passes `--site` and `--base` from `actions/configure-pages`, so the site works at
`https://haohanyuan01.github.io/ForgePrint/` without any path configuration. If you later move it to a
`<org>.github.io` repository for a root-level URL, nothing needs to change either.

## Figures

`src/assets/figures/*.png` are rendered from the paper's `figures/pdf/*.pdf` at 220 dpi:

```bash
pdftoppm -png -r 220 -singlefile fig_teaser.pdf ../../website/src/assets/figures/fig_teaser
```

Astro converts them to AVIF with responsive sizes at build time.

## The interactive case study

`src/components/RewriteExplorer.tsx` holds the two case studies from Appendix I of the paper —
the CNN/DM Grok→Gemini success and the ArXiv Claude→Gemini failure. Every string in it is copied
verbatim from the appendix, including the per-evaluator verdicts and the highlighted spans. If the
appendix changes, update that file to match.

## Tables rendered from the paper's LaTeX

Tables 2 and 4 on the page are the paper's own tables, not re-typed. `tools/`
holds a thin wrapper that `\input`s each table source verbatim and renders it
alone: `tools/_preamble.tex` copies the macros and colours from `../preamble.tex`
(`\method`, `\blk`, `\ci`, the `ourrow` tint) and turns the float, caption and
label into no-ops, so the caption can live as selectable HTML on the page.

Run from the **paper root**, not from here:

```bash
pdflatex -output-directory=out website/tools/render_table2.tex
pdfcrop --margins 6 out/render_table2.pdf out/table2_crop.pdf
pdftoppm -png -r 300 -singlefile out/table2_crop.pdf website/src/assets/tables/table2
```

Same for `render_table4.tex` (Table 4). If a
table changes in the paper, re-run its command; nothing in `src/paper.mdx` needs
to change. `\citeyearpar` is mapped to plain years in `_preamble.tex` so no
bibliography run is needed — if you add a baseline, add its key there too.

## Header cover

`src/assets/cover-charlotte-night.png` is the header background, wired through the
`background` slot on `<Header>` in `src/paper.mdx`. A daytime alternative sits
beside it as `cover-charlotte-day.jpg` — swap the import to change it. The scrim
that keeps the white header text legible lives in `src/components/Header.astro`.

## Notes

- `src/components/TransferBars.astro` is the per-path chart in the open-to-commercial
  section. Its numbers come from Appendix G (`tables/tab_gemma_source_targeted.tex`),
  and it replaces Table 5 on the page. Bar length is the encoding — never add a
  minimum width.
- `src/components/RewriteExplorer.tsx` also contains the ArXiv Claude→Gemini
  failure case from Appendix I, currently unused. To show it, add
  `<RewriteExplorer client:visible variant="failure" />` to `src/paper.mdx`.
