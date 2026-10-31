---
title: Building a koi pond out of ASCII
date: 2026-10-31
summary: How the pond in this site's margins works: dithered water, koi drawn in characters, and the two rules that made them swim like koi instead of folding in half
tags: canvas, javascript, generative-art, design
---

This site's margins are a pond. The water is dithered pixels, the koi are made of characters, and if you click the water one of them swims over to eat. I saw an ASCII koi pond in the margins of [aetosdios.xyz](https://www.aetosdios.xyz/) and wanted one of my own, so I built it from scratch on a canvas. It is the most fun I've had on this site, and it took more tries to get right than anything else on it.

### The water

The water is drawn at a quarter of the screen's resolution, one "pixel" for every 4×4 of the real screen, then scaled up without smoothing so the blocks stay crisp. Its colour comes from a few layers of value noise drifting slowly: broad patches of light and dark, finer ripples, and long vertical streaks like reflections, shading from deep navy into teal in places.

On their own those gradients look smooth and digital. What makes them look like the reference is ordered dithering: every colour is rounded to a few levels, and a 4×4 Bayer matrix decides, pixel by pixel, whether to round up or down. Mid-tones become that checkerboard texture. Lily pads, a pale reflection that changes with the time of day in Bengaluru, and each fish's shadow are blended into the colour before it's dithered, so they get the same texture for free.

Toward the content column the water fades into the page's own background colour, so there's no line where one ends and the other begins.

### The koi

A koi is a spine: eighteen points from its nose to the tip of its tail. To draw one, every character cell near the fish finds the nearest point on that spine, and from that gets three things: how far along the body it is, which side it's on, and how far from the middle.

How far along gives the body's width there: a rounded snout, broad shoulders, a narrow tail. How far from the middle picks the character, from light ones at the edges (`: ~ =`) to dense ones down the middle (`& 0 @`), so the body looks rounded. Red patches come from noise along the body, and a few cells get the eyes. Just outside the body are the fins, drawn as faint fans of `/` and `\`, and outside those a cyan wake.

### Swimming

The first version swam terribly. The head steered toward a target and the rest of the spine was dragged behind it like a rope. When the target changed, the head turned on the spot and the body followed it straight back down itself. The fish folded in half.

Two rules fixed it, and you can switch them off here:

::demo koi-swim

The first is a **turning circle**. The head can't turn faster than its speed divided by a fraction of its length, so a long koi has to swing round in a wide arc, like a real one. The second is a **bend limit**: each joint of the spine can bend at most about six degrees from the one before, so the body curves smoothly but can never fold.

On top of those, it swims the way koi do: a few tail beats, then a long glide, with the tail's wave strongest while it's pushing. It picks a new spot in its margin every ten to twenty seconds instead of chasing the cursor, and it steers clear of the other koi so they don't swim through each other.

### Keeping it fast

The first dense version ran at 17 frames a second on a wide screen. Two changes did most of the work:

- **Drawing characters once.** Calling `fillText` thousands of times a frame is slow. Each character in each colour is now drawn once into an atlas canvas and copied with `drawImage` after that, with colours rounded to 16 levels a channel so the atlas stays small.
- **Not redoing slow things.** The water's colour changes slowly, so it's worked out every third frame and kept, while the fish and their shadows are drawn every frame. Most cells near a koi are open water, so a quick check against every third spine point skips them before the expensive search.

That brought it to 52 frames a second at 1800 pixels wide and 60 at 1280. Starting the animations only once the browser is idle after the page loads took the homepage from 40 to 82 in Lighthouse.

### The rest of the site

Once the pond worked, every page got its own scene from the same parts: a bamboo grove for projects, rain on a window for writing, library shelves for reading, and one per project, like seedlings growing for Sprout and a stream for Flow. The dock's pause button stops all of them if you'd rather read in peace.
