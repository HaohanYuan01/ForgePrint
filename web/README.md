# ForgePrint project page

Source of <https://haohanyuan01.github.io/ForgePrint/>. This directory is the
Astro site; the repository root is reserved for the code and evaluation suite.
The deploy workflow builds from here via `BUILD_PATH: "web"` — the published URL
is derived from the repository name, so moving this directory does not change it.

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

Already set up: pushing to `main` triggers `.github/workflows/astro.yml`, which
builds `web/` and publishes it. Pages is configured with **Source: GitHub Actions**.

The workflow passes `--site` and `--base` from `actions/configure-pages`, so the site works at
`https://haohanyuan01.github.io/ForgePrint/` without any path configuration.

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
pdflatex -include-directory=<repo>/web/tools -output-directory=out <repo>/web/tools/render_table2.tex
pdfcrop --margins 6 out/render_table2.pdf out/table2_crop.pdf
pdftoppm -png -r 300 -singlefile out/table2_crop.pdf <repo>/web/src/assets/tables/table2
```

`-include-directory` is what lets the wrapper find `_preamble.tex`, so the
checkout can sit anywhere relative to the paper.

Same for `render_table4.tex` (Table 4). If a
table changes in the paper, re-run its command; nothing in `src/paper.mdx` needs
to change. `\citeyearpar` is mapped to plain years in `_preamble.tex` so no
bibliography run is needed — if you add a baseline, add its key there too.

## Header cover

`src/assets/cover-charlotte-night.png` is the header background, wired through the
`background` slot on `<Header>` in `src/paper.mdx`. A daytime alternative sits
beside it as `cover-charlotte-day.jpg` — swap the import to change it. The scrim
that keeps the white header text legible lives in `src/components/Header.astro`.

## The main table's clickable citations

`src/components/CitedTable.astro` overlays anchors on the Table 1 image so its
method names jump to the reference list, the way `\citeyearpar` does in the PDF.
The coordinates live in `src/data/table2-citations.ts` and are measured, not
eyeballed — regenerate them after re-rendering the table:

```bash
python tools/measure_table_citations.py --preview
```

`--preview` writes `hits_check.png` with the regions drawn on the table so you
can confirm they still line up. The script fails loudly if the number of rows it
finds no longer matches its `CITED` list.

## Notes

- `src/components/TransferBars.astro` is the per-path chart in the open-to-commercial
  section. Its numbers come from Appendix G (`tables/tab_gemma_source_targeted.tex`),
  and it replaces Table 5 on the page. Bar length is the encoding — never add a
  minimum width.
- `src/components/RewriteExplorer.tsx` also contains the ArXiv Claude→Gemini
  failure case from Appendix I, currently unused. To show it, add
  `<RewriteExplorer client:visible variant="failure" />` to `src/paper.mdx`.
