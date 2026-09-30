"""Regenerate src/data/table2-citations.ts from src/assets/tables/table2.png.

The main results table ships as an image, so its citations cannot be links on
their own; CitedTable.astro overlays anchors on top of it. Those coordinates
are measured here rather than eyeballed. Run from web/ after re-rendering the
table, then check the boxes with --preview.

    python tools/measure_table_citations.py
    python tools/measure_table_citations.py --preview   # writes hits_check.png
"""

import sys
import numpy as np
from PIL import Image, ImageDraw

IMAGE = "src/assets/tables/table2.png"
OUT = "src/data/table2-citations.ts"

# Rows in the order they appear in the Method column, top to bottom. Rows that
# carry no citation - the header, the section labels, and our own two systems -
# are simply absent: the scan below skips any band that is not listed here.
CITED = [
    ("DIPPER (2023)", "krishna2023paraphrasing"),
    ("TinyStyler (2024)", "horvitz2024tinystyler"),
    ("Zero-shot TST (2022)", "reif2022recipe"),
    ("5-shot FC (2022)", "suzgun2022promptrerank"),
    ("Aug. zero-shot (2022)", "reif2022recipe"),
    ("Planner TST (2025)", "zhang2025decoupled"),
    ("ForgePrint Teacher", None),
    ("Zero-shot TST (2022)", "reif2022recipe"),
    ("5-shot FC (2022)", "suzgun2022promptrerank"),
    ("Aug. zero-shot (2022)", "reif2022recipe"),
    ("Planner TST (2025)", "zhang2025decoupled"),
    ("AuthorMist-T (2025)", "david2025authormist"),
    ("Style-reward RL (2019)", "gong2019rl"),
    ("ForgePrint-4B", None),
]

a = np.array(Image.open(IMAGE).convert("L"))
H, W = a.shape

# Text bands in the Method column. The first two are the column headers.
dark_rows = (a[:, int(W * 0.015) : int(W * 0.26)] < 128).sum(axis=1) > 0
bands, start = [], None
for y, d in enumerate(dark_rows):
    if d and start is None:
        start = y
    elif not d and start is not None:
        if y - start >= 8:
            bands.append((start, y))
        start = None
bands = bands[2:]  # drop the two header rows

if len(bands) != len(CITED):
    sys.exit(f"expected {len(CITED)} method rows, found {len(bands)} - CITED is stale")

hits = []
for (y0, y1), (label, key) in zip(bands, CITED):
    if key is None:
        continue
    dark_cols = (a[y0:y1, :] < 128).any(axis=0)
    xs = np.where(dark_cols)[0]
    left = xs[0]
    right, gap = left, 0
    for x in range(left, int(W * 0.30)):
        if dark_cols[x]:
            right, gap = x, 0
        else:
            gap += 1
            if gap > 28:  # the run of white before the numeric columns
                break
    pad = 5
    hits.append(
        dict(
            key=key,
            label=label,
            top=round(100 * (y0 - pad) / H, 3),
            left=round(100 * (left - pad) / W, 3),
            width=round(100 * (right - left + 2 * pad) / W, 3),
            height=round(100 * (y1 - y0 + 2 * pad) / H, 3),
        )
    )

body = ",\n  ".join(
    '{{ key: "{key}", label: "{label}", top: {top}, left: {left}, '
    "width: {width}, height: {height} }}".format(**h)
    for h in hits
)
with open(OUT, "w", encoding="utf-8") as f:
    f.write(
        "// Clickable regions over the method names in "
        + IMAGE.split("/")[-1]
        + ".\n// Percentages of the image. Regenerate with "
        "tools/measure_table_citations.py.\nexport interface Hit {\n  key: string;\n"
        "  label: string;\n  top: number;\n  left: number;\n  width: number;\n"
        "  height: number;\n}\n\nexport const mainTableCitations: Hit[] = [\n  "
        + body
        + ",\n];\n"
    )
print(f"wrote {OUT} with {len(hits)} regions")

if "--preview" in sys.argv:
    im = Image.open(IMAGE).convert("RGB")
    d = ImageDraw.Draw(im, "RGBA")
    for h in hits:
        d.rectangle(
            [
                W * h["left"] / 100,
                H * h["top"] / 100,
                W * (h["left"] + h["width"]) / 100,
                H * (h["top"] + h["height"]) / 100,
            ],
            fill=(37, 99, 235, 60),
            outline=(37, 99, 235, 220),
            width=2,
        )
    im.save("hits_check.png")
    print("wrote hits_check.png")
