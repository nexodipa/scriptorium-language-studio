const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const {pathToFileURL,fileURLToPath} = require('url');
const {chromium} = require('playwright');
const locales = {...require('../locales/pages.json'),...require('../locales/extended.json')};
const root = path.resolve(__dirname,'..');
const live = process.argv.includes('--live');
const base = 'https://nexodipa.github.io/scriptorium-language-studio/';
const url = file => live ? base+file : pathToFileURL(path.join(root,file)).href;
(async()=>{
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const context = await browser.newContext({viewport:{width:390,height:900}});
  const page = await context.newPage();
  const failures=[];
  page.on('pageerror',error=>failures.push(error.message));
  const out=path.join(root,'qa','multilingual-20260925'); fs.mkdirSync(out,{recursive:true});
  try {
    await page.goto(url('index.html')+'#contact');
    for(const [code,data] of Object.entries(locales)) {
      await page.locator('#site-language').selectOption(code);
      await page.waitForURL(`**/${code}.html#contact`);
      assert.equal(await page.locator('html').getAttribute('lang'),code);
      assert.equal(await page.locator('html').getAttribute('dir'),data.dir);
      assert.equal(await page.locator('#site-language').inputValue(),code);
      assert.equal(await page.locator('#site-language option').count(),12);
      await page.locator('#menu-button').click();
      assert.equal(await page.locator('#menu-button').getAttribute('aria-label'),data.messages[8]);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#menu-button').getAttribute('aria-label'),data.messages[7]);
      const blocked=await page.locator('#whatsapp-request-link').evaluate(el=>!el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true})));
      assert(blocked,`${code}: invalid form allowed`);
      await page.locator('[name=name]').fill('QA');
      await page.locator('[name=contact]').fill('qa@example.com');
      await page.locator('[name=service]').selectOption({index:1});
      await page.locator('[name=message]').fill('<b>QA & "text"</b>');
      await page.locator('[name=privacyRead]').check();
      const message=new URL(await page.locator('#whatsapp-request-link').getAttribute('href')).searchParams.get('text');
      assert(message.startsWith(data.messages[0]),`${code}: wrong message language`);
      assert(message.includes(data.form[0]+': QA'));
      assert(message.includes('<b>QA & "text"</b>'));
      await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.copiedText=text;}}});});
      await page.locator('#copy-request').click();
      assert.equal(await page.locator('#form-note').textContent(),data.messages[4]);
      assert.equal(await page.evaluate(()=>window.copiedText),message);
      for(const href of await page.locator('a[href]').evaluateAll(items=>items.map(a=>a.href))) {
        const u=new URL(href);
        if(u.protocol==='file:') assert(fs.existsSync(fileURLToPath(u)),`${code}: missing file ${href}`);
      }
      for(const width of [390,1440]) {
        await page.setViewportSize({width,height:900});
        await page.goto(url(code+'.html'));
        await page.evaluate(()=>document.fonts.ready);
        await page.screenshot({path:path.join(out,`${code}-${width}${live?'-live':''}.png`)});
        const overlaps=await page.evaluate(()=>{
          const items=[...document.querySelectorAll('.site-header > *')].filter(e=>getComputedStyle(e).display!=='none').map(e=>({name:e.className,r:e.getBoundingClientRect()}));
          return items.flatMap((a,i)=>items.slice(i+1).filter(b=>Math.min(a.r.right,b.r.right)-Math.max(a.r.left,b.r.left)>2&&Math.min(a.r.bottom,b.r.bottom)-Math.max(a.r.top,b.r.top)>2).map(b=>`${a.name}/${b.name}`));
        });
        assert.deepEqual(overlaps,[],`${code}: header overlap at ${width}`);
      }
      await page.setViewportSize({width:390,height:900});
      await page.goto(url(code+'.html')+'#contact');
    }
    await page.locator('#site-language').selectOption('es');
    await page.waitForURL('**/index.html#contact');
    await page.locator('#site-language').selectOption('en');
    await page.waitForURL('**/en.html#contact');
    assert.equal(await page.locator('html').getAttribute('lang'),'en');
    assert.deepEqual(failures,[]);
    console.log(`PASS ${live?'LIVE':'LOCAL'}: 12-language navigation, 10 localized forms, menu labels, validation, clipboard, RTL and 20 header layout checks.`);
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
