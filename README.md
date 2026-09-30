# ForgePrint

Forging LLM Authorship Fingerprints with Targeted Rewriting

Haohan Yuan, Simin Chen, Xi Niu, Hanqing Guo, Depeng Xu, Haopeng Zhang

**Project page: https://haohanyuan01.github.io/ForgePrint/**

Model-attribution classifiers can identify which LLM produced a text, and on
unmodified summaries our evaluator suites are 85.9% accurate. That accuracy does
not survive deliberate rewriting: under *targeted fingerprint transfer* a
rewriter moves the classifier's verdict from the true source to a **chosen**
other model while preserving the content — 60.8% of the time across four
domains, and 70.2% on CNN/DM, against held-out classifiers the attack never
queries. Fingerprint detectability is not source authenticity.

## Repository layout

| Path | Contents |
| --- | --- |
| `web/` | Source of the project page (Astro). See [`web/README.md`](web/README.md). |
| `.github/workflows/` | Builds `web/` and deploys it to GitHub Pages. |

## Release status

Our code and evaluation suite will be released here. This will cover the
evaluator checkpoints, the frozen evaluation protocol, the scoring scripts, and
the per-evaluator predictions, so the reported results can be audited and
recomputed without regenerating model outputs.

The trained rewriter is available on request under the terms of the Ethics
Statement in the paper.

## Citation

```bibtex
@misc{yuan2026forgeprint,
  title         = {Forging LLM Authorship Fingerprints with Targeted Rewriting},
  author        = {Yuan, Haohan and Chen, Simin and Niu, Xi and Guo, Hanqing and Xu, Depeng and Zhang, Haopeng},
  year          = {2026},
  eprint        = {ARXIV_ID},
  archivePrefix = {arXiv},
  primaryClass  = {cs.CL}
}
```
