# Builds lib/adamGrid.json, the banner's picture: the hands from Michelangelo's The Creation
# of Adam (c. 1512, public domain), as skin brightness per cell, 0-f. The plaster and sky go to
# black so the hands stand out.
#   python3 scripts/adam-grid.py "Michelangelo_-_Creation_of_Adam_(cropped).jpg" lib/adamGrid.json preview.txt
# (the image is from Wikimedia Commons; it isn't kept in the repo)
import sys, colorsys, json
from PIL import Image, ImageFilter
src, out, preview = sys.argv[1:4]
# 5 × 8 px cells on the page, so rows = cols × (270 / 840) × (5 / 8)
COLS, ROWS = 200, 40
im = Image.open(src).convert('RGB').crop((980, 600, 1820, 870))
small = im.resize((COLS, ROWS), Image.LANCZOS)
vals = []
for y in range(ROWS):
    for x in range(COLS):
        r, g, b = [c / 255 for c in small.getpixel((x, y))]
        h, s, v = colorsys.rgb_to_hsv(r, g, b)
        skin = 0.035 < h < 0.11 and 0.24 < s < 0.62 and v > 0.4
        # skin is drawn by its brightness; plaster and sky fall to black
        k = v * min(1, (s - 0.24) / 0.12) if skin else 0
        # hand-picked: drop a cherub's arm (right) and Adam's knee (bottom left)
        if (y >= 19 and x >= 165) or (y >= 34 and x < 15):
            k = 0
        vals.append(max(0, min(255, round(k * 255))))
json.dump({
    'source': 'The Creation of Adam, Michelangelo, c. 1512 (public domain), via Wikimedia Commons: Michelangelo - Creation of Adam (cropped).jpg. Skin brightness per cell, 0-f; see scripts/adam-grid.py',
    'cols': COLS, 'rows': ROWS, 'data': ''.join('0123456789abcdef'[v * 16 // 256] for v in vals),
}, open(out, 'w'))
ramp = ' .:-=+*#%@'
with open(preview, 'w') as f:
    for y in range(ROWS):
        f.write(''.join(ramp[min(9, vals[y * COLS + x] * 10 // 256)] for x in range(COLS)) + '\n')
