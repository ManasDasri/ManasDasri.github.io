# Draws the site's koi icon once as polygons, then writes it as SVG and rasterises it
# (supersampled) to the PNG and ICO sizes. Run from the repo root.
import math, sys
from PIL import Image, ImageDraw

BG, EDGE, BODY, PATCH, EYE = '#070B14', '#1F2C46', '#ECE4D6', '#F07A4A', '#0B0F18'
ANG = math.radians(-38)  # swimming up and to the right
C = 32

def rot(p):
    x, y = p[0] - C, p[1] - C
    return (C + x * math.cos(ANG) - y * math.sin(ANG), C + x * math.sin(ANG) + y * math.cos(ANG))

def spine(u):  # head at the top, a gentle S
    return (31 + 2.2 * math.sin(u * math.pi * 1.3), 8 + u * 42)

def width(u):
    if u < 0.22: return 7.6 * math.sin(u / 0.22 * math.pi / 2) ** 0.55
    return 7.6 * (1 - (u - 0.22) / 0.62) ** 1.05 + 0.9 if u < 0.84 else 1.2

def tangent(u):  # pointing toward the tail
    (x0, y0), (x1, y1) = spine(max(0, u - 0.01)), spine(min(1, u + 0.01))
    dx, dy = x1 - x0, y1 - y0; n = math.hypot(dx, dy)
    return (dx / n, dy / n)

def normal(u):
    tx, ty = tangent(u)
    return (-ty, tx)

def at(u, across, back):  # a point `across` from the spine and `back` toward the tail
    (sx, sy), (nx, ny), (tx, ty) = spine(u), normal(u), tangent(u)
    return (sx + nx * across + tx * back, sy + ny * across + ty * back)

def side(u0, u1, k=1.0, shift=0.0, steps=40):
    left, right = [], []
    for i in range(steps + 1):
        u = u0 + (u1 - u0) * i / steps
        (sx, sy), (nx, ny), w = spine(u), normal(u), width(u) * k
        c = shift * width(u)
        left.append((sx + nx * (c - w), sy + ny * (c - w)))
        right.append((sx + nx * (c + w), sy + ny * (c + w)))
    return left + right[::-1]

shapes = []  # (points, fill, opacity)
# tail: two lobes fanning out behind the body
shapes.append(([at(0.8, 1.6, 0), at(0.8, 7.5, 12), at(0.8, 2.2, 9), at(0.8, 0, 6.5), at(0.8, -2.2, 9), at(0.8, -7.5, 12), at(0.8, -1.6, 0)], BODY, 0.6))
# pectoral fins, swept back
for s in (-1, 1):
    b = width(0.28) * 0.85
    shapes.append(([at(0.26, s * b, -1), at(0.26, s * (b + 6), 9), at(0.26, s * (b + 0.5), 6)], BODY, 0.6))
shapes.append((side(0, 0.86), BODY, 1))
shapes.append((side(0.04, 0.3, k=0.86), PATCH, 1))  # red on the head
shapes.append((side(0.42, 0.66, k=0.7, shift=0.25), PATCH, 1))  # and along the back

# centre the drawing in the tile
_all = [rot(p) for pts, _, _ in shapes for p in pts]
OX = 32 - (min(x for x, _ in _all) + max(x for x, _ in _all)) / 2
OY = 32 - (min(y for _, y in _all) + max(y for _, y in _all)) / 2
_rot = rot
def rot(p):
    x, y = _rot(p)
    return (x + OX, y + OY)

def svg():
    out = ['<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">',
           '  <!-- a koi from above on the site\'s night-water tile: shapes only, so it renders the same everywhere (scripts/koi_icon.py) -->',
           f'  <rect width="64" height="64" rx="14" fill="{BG}"/>',
           f'  <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" fill="none" stroke="{EDGE}" stroke-width="1.5"/>']
    for pts, fill, op in shapes:
        d = ' '.join(f'{x:.2f},{y:.2f}' for x, y in map(rot, pts))
        out.append(f'  <polygon points="{d}" fill="{fill}"' + (f' fill-opacity="{op}"' if op < 1 else '') + '/>')
    for s in (-1, 1):
        (ex, ey), (nx, ny) = spine(0.09), normal(0.09)
        x, y = rot((ex + s * nx * 3.3, ey + s * ny * 3.3))
        out.append(f'  <circle cx="{x:.2f}" cy="{y:.2f}" r="1.1" fill="{EYE}"/>')
    out.append('</svg>')
    return '\n'.join(out) + '\n'

def hexrgb(h, a=1): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5)) + (round(255 * a),)

def png(size, tile=True):
    S = size * 8; k = S / 64
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im, 'RGBA')
    if tile:
        d.rounded_rectangle([0, 0, S - 1, S - 1], radius=14 * k, fill=hexrgb(BG))
        d.rounded_rectangle([1.5 * k, 1.5 * k, S - 1.5 * k, S - 1.5 * k], radius=12.5 * k, outline=hexrgb(EDGE), width=max(1, round(1.5 * k)))
    for pts, fill, op in shapes:
        layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        ImageDraw.Draw(layer).polygon([(x * k, y * k) for x, y in map(rot, pts)], fill=hexrgb(fill, op))
        im = Image.alpha_composite(im, layer)
    d = ImageDraw.Draw(im)
    for s in (-1, 1):
        (ex, ey), (nx, ny) = spine(0.09), normal(0.09)
        x, y = rot((ex + s * nx * 3.3, ey + s * ny * 3.3))
        d.ellipse([(x - 1.1) * k, (y - 1.1) * k, (x + 1.1) * k, (y + 1.1) * k], fill=hexrgb(EYE))
    return im.resize((size, size), Image.LANCZOS)

open('app/icon1.svg', 'w').write(svg())
png(192).save('app/icon2.png')
png(180).save('app/apple-icon.png')
png(192).save('public/icon-192.png')
png(512).save('public/icon-512.png')
png(48).save('app/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('written')
