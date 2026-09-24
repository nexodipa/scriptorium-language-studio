const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const live = process.argv.includes('--live');
const base = 'https://nexodipa.github.io/scriptorium-language-studio/';
const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const failures = [];
  const links = new Set();
  const page = await browser.newPage();
  page.on('pageerror', e => failures.push(e.message));
  page.on('response', r => { if(r.status() >= 400) failures.push(`${r.status()} ${r.url()}`); });
  try {
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      for (const file of files) {
        await page.goto(live ? base + file : pathToFileURL(path.join(root,file)).href);
        await page.evaluate(async () => {
          document.querySelectorAll('img').forEach(i => i.loading = 'eager');
          await Promise.all([...document.images].map(i => i.decode().catch(()=>{})));
          await document.fonts.ready;
        });
        const issues = await page.evaluate(() => {
          const result = [];
          if(document.documentElement.scrollWidth > innerWidth+1) result.push('horizontal overflow');
          for(const i of document.images) if(!i.naturalWidth) result.push(`broken image ${i.src}`);
          const ids = [...document.querySelectorAll('[id]')].map(e=>e.id);
          if(new Set(ids).size !== ids.length) result.push('duplicate IDs');
          for(const el of document.querySelectorAll('[aria-labelledby],[aria-controls]')) {
            for(const attr of ['aria-labelledby','aria-controls']) for(const id of (el.getAttribute(attr)||'').split(/\s+/).filter(Boolean)) if(!document.getElementById(id)) result.push(`missing ARIA target ${id}`);
          }
          return result;
        });
        failures.push(...issues.map(i => `${file} ${width}: ${i}`));
        if(live) for(const href of await page.locator('a[href]').evaluateAll(items=>items.map(a=>a.href))) {
          if(href.startsWith(base)) links.add(href.split('#')[0]);
        }
      }
    }
    await page.goto(live ? base : pathToFileURL(path.join(root,'index.html')).href);
    await page.setViewportSize({width:390,height:900});
    const menu=page.locator('#menu-button');
    await menu.click();
    assert.equal(await menu.getAttribute('aria-expanded'),'true');
    await page.keyboard.press('Escape');
    assert.equal(await menu.getAttribute('aria-expanded'),'false');
    await page.locator('[name=name]').focus();
    await page.keyboard.press('Escape');
    assert(await page.locator('[name=name]').evaluate(e=>e===document.activeElement));
    const nojs = await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:900}});
    await nojs.goto(live ? base : pathToFileURL(path.join(root,'index.html')).href);
    assert.equal(await nojs.locator('.reveal').first().evaluate(e=>getComputedStyle(e).opacity),'1');
    await nojs.close();
    await page.goto(live ? base + '#contact' : pathToFileURL(path.join(root,'index.html')).href + '#contact');
    await page.locator('[data-language-link]').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.equal(new URL(page.url()).hash,'#contact');
    await page.locator('[name=name]').fill('Test');
    await page.locator('[name=contact]').fill('test@example.com');
    await page.locator('[name=service]').selectOption({index:1});
    await page.locator('[name=message]').fill('Test project');
    await page.locator('[name=privacyRead]').check();
    assert(new URL(await page.locator('#whatsapp-request-link').getAttribute('href')).searchParams.get('text').startsWith('Hello Scriptorium'));
    await page.locator('.brand').click();
    assert(new URL(page.url()).pathname.endsWith('en.html'));
    const folder=path.join(root,'qa','languages'); fs.mkdirSync(folder,{recursive:true});
    await page.screenshot({path:path.join(folder, live ? 'english-live.png' : 'english-local.png')});
    await page.locator('[data-language-link]').click();
    assert.equal(await page.locator('html').getAttribute('lang'),'es');
    for(const url of links) {
      const response = await page.request.get(url);
      if(!response.ok()) failures.push(`link ${response.status()} ${url}`);
    }
    assert.deepEqual(failures,[]);
    console.log(`PASS ${live?'LIVE':'LOCAL'}: ${files.length*5} page/viewport checks, all images, IDs, ARIA references, menu and no-JS content.`);
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
