# The site's icon: "md" in a blocky pixel font on a near-black tile. Drawn once on a 16×16
# grid, then written as SVG and scaled up pixel for pixel to the PNG and ICO sizes, so every
# size stays crisp. Run from the repo root: python3 scripts/icon.py
from PIL import Image

INK, TILE, PIXEL = (7, 11, 20), '#070B14', '#ECE4D6'
GLYPHS = {
    'm': ['##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#'],
    'd': ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
}
N = 16
cells = set()
# both letters sit on one baseline: the m is five rows tall, the d seven
x = 2
for ch in 'md':
    rows = GLYPHS[ch]
    top = 11 - len(rows) + 1
    for r, line in enumerate(rows):
        for c, v in enumerate(line):
            if v == '#': cells.add((x + c, top + r))
    x += len(rows[0]) + 1

svg = ['<svg width="64" height="64" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">',
       '  <!-- "md" in pixels on the site\'s dark tile (scripts/icon.py) -->',
       f'  <rect width="16" height="16" rx="2" fill="{TILE}"/>',
       f'  <g fill="{PIXEL}">']
svg += [f'    <rect x="{cx}" y="{cy}" width="1" height="1"/>' for cx, cy in sorted(cells)]
svg += ['  </g>', '</svg>']
open('app/icon1.svg', 'w').write('\n'.join(svg) + '\n')

def png(size):
    k = size // N  # whole pixels per cell; any remainder becomes an even border
    im = Image.new('RGB', (N, N), INK)
    for c in cells: im.putpixel(c, tuple(int(PIXEL[i:i + 2], 16) for i in (1, 3, 5)))
    big = im.resize((N * k, N * k), Image.NEAREST)
    out = Image.new('RGB', (size, size), INK)
    out.paste(big, ((size - N * k) // 2, (size - N * k) // 2))
    return out

png(192).save('app/icon2.png')
png(180).save('app/apple-icon.png')
png(192).save('public/icon-192.png')
png(512).save('public/icon-512.png')
# each size drawn pixel for pixel rather than shrunk from the largest
png(48).save('app/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)], append_images=[png(16), png(32)])
