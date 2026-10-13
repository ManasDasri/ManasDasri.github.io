// Run against the static export served on port 3100:
// playwright-cli run-code --filename=scripts/check-browser.js
async (page) => {
  const base = 'http://127.0.0.1:3100';
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  const cache = new Map();
  await page.route('https://api.github.com/**', async (route) => {
    const url = route.request().url();
    if (!cache.has(url)) cache.set(url, route.fetch().then(async (r) => ({ status: r.status(), contentType: 'application/json', body: await r.text() })));
    await route.fulfill(await cache.get(url));
  });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && /hydration|Minified React|did not match/i.test(message.text())) errors.push(message.text());
  });
  await page.addInitScript(() => {
    window.dockFrames = [];
    const sample = () => {
      const dock = document.querySelector('.dock');
      if (dock && getComputedStyle(dock).position === 'fixed') {
        const rect = dock.getBoundingClientRect();
        window.dockFrames.push({ x: rect.x, y: rect.y, w: rect.width, h: rect.height });
      }
      if (window.dockFrames.length < 100) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  const noOverflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${page.url()}`);
  const stableDock = async () => {
    await page.waitForFunction(() => window.dockFrames.length >= 8);
    const frames = await page.evaluate(() => window.dockFrames);
    assert(frames.every((r) => Math.abs(r.x - 20) < 1 && r.h > r.w), `Dock moved before hydration: ${JSON.stringify(frames.slice(0, 8))}`);
  };
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(base);
  await page.getByRole('button', { name: 'More', exact: true }).click();
  await page.keyboard.press('Escape');
  await stableDock();
  const name = page.getByRole('heading', { name: 'Manas Dasari', exact: true });
  await page.evaluate(() => document.fonts.ready);
  const before = await name.boundingBox();
  await name.hover();
  const titleFrames = await name.evaluate(async (el) => {
    const frames = [];
    for (let i = 0; i < 24; i++) {
      await new Promise(requestAnimationFrame);
      const r = el.getBoundingClientRect(), s = getComputedStyle(el);
      frames.push({ x: r.x, y: r.y, w: r.width, h: r.height, opacity: s.opacity, color: s.color, text: el.textContent.trim(), animation: s.animationName });
    }
    return frames;
  });
  await page.mouse.move(1400, 850);
  const after = await name.boundingBox();
  assert(titleFrames.every((f) => f.text === 'Manas Dasari' && f.opacity === '1' && f.animation === 'none' && f.color !== 'rgba(0, 0, 0, 0)'), 'Name blinked or restarted an animation');
  assert(Math.abs(before.y - after.y) < 1 && Math.abs(before.height - after.height) < 1, 'Name shifted on hover');
  await page.screenshot({ path: 'output/playwright/desktop.png', fullPage: true });

  await page.getByRole('link', { name: 'Explore project', exact: true }).first().click();
  await page.waitForURL(`${base}/projects/sprout/`);
  await stableDock();
  await page.getByRole('link', { name: '← all projects' }).click();
  await page.waitForURL(`${base}/#building`);
  await stableDock();
  await page.goBack();
  await stableDock();
  await page.goForward();
  await stableDock();

  const routes = ['/projects/sprout/', '/projects/flow/', '/projects/atmos/', '/projects/velora/', '/projects/analogue-risk/', '/writing/building-sprout/', '/writing/contributing-to-open-source/', '/writing/starting-ai-ml-from-zero-again/', '/404.html'];
  for (const route of routes) {
    const response = await page.goto(base + route);
    assert(response.status() === 200, `Missing export: ${route}`);
    assert(await page.locator('h1').count() === 1, `Expected one page title: ${route}`);
    await page.getByRole('button', { name: 'More', exact: true }).click();
    await page.keyboard.press('Escape');
    await noOverflow();
  }

  // Commands must navigate from detail pages, not silently do nothing.
  await page.goto(base + '/projects/flow/');
  await page.getByRole('button', { name: 'More', exact: true }).click();
  await page.getByRole('combobox').fill('Go to Projects');
  await page.getByRole('option', { name: 'Go to Projects', exact: true }).click();
  await page.waitForURL(`${base}/#building`);
  await page.getByRole('button', { name: 'More', exact: true }).click();
  await page.getByRole('combobox').fill('Terminal: help');
  await page.getByRole('option', { name: 'Terminal: help', exact: true }).click();
  await page.locator('#terminal').getByText('whoami, contact, clear', { exact: true }).waitFor();

  for (const width of [320, 390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base);
    await page.getByRole('button', { name: 'More', exact: true }).click();
    await page.keyboard.press('Escape');
    await noOverflow();
    if (width < 1280) {
      assert(await page.locator('.dock-item:visible').count() === 5, 'Mobile dock should have five labeled destinations');
      const hero = await page.locator('#top').boundingBox();
      if (width < 640) assert(hero.height <= 220, 'Mobile hero is too tall');
    }
    if (width === 390) {
      await page.screenshot({ path: 'output/playwright/mobile.png' });
      await page.locator('#building').scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'output/playwright/mobile-projects.png' });
      await page.goto(base + '/projects/flow/');
      await noOverflow();
      assert(await page.locator('img[src="/projects/flow-room.png"]').evaluate((img) => img.complete && img.naturalWidth > 0), 'Project screenshot did not load');
    }
  }
  const context = await page.context().browser().newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const plain = await context.newPage();
  await plain.goto(base);
  const rect = await plain.locator('.dock').boundingBox();
  assert(Math.abs(rect.x - 20) < 1 && rect.height > rect.width, 'Desktop dock depends on JavaScript');
  assert(await plain.getByRole('heading', { name: 'Sprout', exact: true }).isVisible(), 'Project content hidden without JavaScript');
  await context.close();

  const reduced = await page.context().browser().newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } });
  const quiet = await reduced.newPage();
  quiet.on('pageerror', (error) => errors.push(error.message));
  await quiet.goto(base);
  await quiet.getByRole('button', { name: 'Resume animation', exact: true }).waitFor();
  const stats = await quiet.locator('#top').textContent();
  await quiet.getByRole('heading', { name: 'Manas Dasari' }).hover();
  assert((await quiet.locator('#top').textContent()) === stats, 'Life animates despite reduced-motion preference');
  await reduced.close();
  assert(errors.length === 0, `Browser errors: ${errors.join('\n')}`);
  return { passed: true, routes: routes.length + 1, widths: [320, 390, 768, 1280, 1440], checks: ['hydration', 'dock first paint and history', 'name hover', 'project and writing routes', 'command palette', 'terminal', 'overflow', 'no JavaScript', 'reduced motion'] };
}
