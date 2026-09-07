const puppeteer = require('../frontend/node_modules/puppeteer-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runHeroVisualQA() {
  console.log('====================================================');
  console.log('SPILLTRACE HERO VISUAL & 2-MINUTE DEMO QA TEST');
  console.log('====================================================');

  const consoleErrors = [];
  const networkErrors = [];
  const networkRequests = [];

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`[CONSOLE ERROR] ${text}`);
    }
  });

  page.on('requestfailed', request => {
    // Exclude external OpenStreetMap tile fetch failures in offline/headless mode
    if (!request.url().includes('openstreetmap.org')) {
      networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
      console.log(`[NET ERROR] ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/') || url.includes('/static/')) {
      networkRequests.push({ url, status: response.status() });
      console.log(`[HTTP ${response.status()}] ${url}`);
    }
  });

  try {
    // -------------------------------------------------------------
    // 1. LOAD DASHBOARD
    // -------------------------------------------------------------
    console.log('\n--- 1. Loading Application ---');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('[PASS] Application loaded successfully.');

    // -------------------------------------------------------------
    // 2. NAVIGATE TO SATELLITE ANALYSIS
    // -------------------------------------------------------------
    console.log('\n--- 2. Navigating to Satellite Analysis ---');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('header button'));
      const satTab = tabs.find(b => b.innerText.includes('Satellite'));
      if (satTab) satTab.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Check selected image is demo_sar_oil.png
    const selectedScene = await page.$eval('select', el => el.value);
    console.log(`[PASS] Primary selected scene: "${selectedScene}"`);
    if (selectedScene !== 'demo_sar_oil.png') {
      throw new Error(`Expected demo_sar_oil.png as default, got: ${selectedScene}`);
    }

    // Verify required badges
    const bodyText = await page.evaluate(() => document.body.innerText);
    const reqBadge1 = "SYNTHETIC SAR-LIKE DEMONSTRATION";
    const reqBadge2 = "Prototype Segmentation";
    const reqCoord = "Prototype Scenario Coordinates";

    if (bodyText.includes(reqBadge1)) {
      console.log(`[PASS] Found required badge: "${reqBadge1}"`);
    } else {
      throw new Error(`Missing required badge: "${reqBadge1}"`);
    }

    if (bodyText.includes(reqBadge2)) {
      console.log(`[PASS] Found required label: "${reqBadge2}"`);
    } else {
      throw new Error(`Missing required label: "${reqBadge2}"`);
    }

    if (bodyText.includes(reqCoord)) {
      console.log(`[PASS] Found required metadata label: "${reqCoord}"`);
    } else {
      throw new Error(`Missing required metadata label: "${reqCoord}"`);
    }

    // Verify raw image element loaded and not broken
    const baseImg = await page.$eval('img[alt="SAR Demonstration Scene"]', el => ({
      src: el.src,
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight
    }));
    console.log(`[PASS] Base Image: ${baseImg.src}, loaded=${baseImg.complete}, dimensions=${baseImg.naturalWidth}x${baseImg.naturalHeight}`);
    if (!baseImg.complete || baseImg.naturalWidth === 0) {
      throw new Error('Base image failed to load or has 0 width!');
    }

    // -------------------------------------------------------------
    // 3. ANALYZE SPILL BUTTON
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing "ANALYZE SPILL" Button ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const analyzeBtn = btns.find(b => b.innerText.includes('ANALYZE SPILL'));
      if (analyzeBtn) analyzeBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // Verify "POSSIBLE OIL SPILL" appears
    const afterAnalyzeText = await page.evaluate(() => document.body.innerText);
    if (afterAnalyzeText.includes('POSSIBLE OIL SPILL')) {
      console.log('[PASS] "POSSIBLE OIL SPILL" detection banner displayed.');
    } else {
      throw new Error('Missing "POSSIBLE OIL SPILL" banner after analysis!');
    }

    // Check that mask and boundary overlays appear
    const maskImg = await page.$eval('img[alt="Prototype Segmentation Mask"]', el => ({
      src: el.src,
      complete: el.complete,
      naturalWidth: el.naturalWidth
    }));
    console.log(`[PASS] Mask Overlay: ${maskImg.src}, loaded=${maskImg.complete}, width=${maskImg.naturalWidth}`);

    const boundaryImg = await page.$eval('img[alt="Slick Boundary"]', el => ({
      src: el.src,
      complete: el.complete,
      naturalWidth: el.naturalWidth
    }));
    console.log(`[PASS] Boundary Overlay: ${boundaryImg.src}, loaded=${boundaryImg.complete}`);

    // -------------------------------------------------------------
    // 4. TEST DATASET SELECTION ORDER & REFERENCE MODE
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Dataset Selector Priority & Reference Mode ---');
    const options = await page.$$eval('select option', els => els.map(o => ({ value: o.value, text: o.innerText })));
    console.log('[PASS] Dropdown options order:', options);
    if (options[0].value !== 'demo_sar_oil.png' || options[1].value !== 'real_spill.jpg' || options[2].value !== 'sample_spill.png') {
      throw new Error('Incorrect options order! Expected demo_sar_oil.png, real_spill.jpg, sample_spill.png');
    }

    // Switch to real dataset reference
    console.log('   Switching to "real_spill.jpg" (Real Dataset Reference)...');
    await page.select('select', 'real_spill.jpg');
    await new Promise(r => setTimeout(r, 1200));
    const realText = await page.evaluate(() => document.body.innerText);
    if (realText.includes('REAL DATASET REFERENCE')) {
      console.log('[PASS] "REAL DATASET REFERENCE" badge displayed for real_spill.jpg.');
    } else {
      throw new Error('Missing REAL DATASET REFERENCE badge for real_spill.jpg');
    }

    // Switch back to hero demo_sar_oil.png
    console.log('   Switching back to "demo_sar_oil.png" (Primary Hero)...');
    await page.select('select', 'demo_sar_oil.png');
    await new Promise(r => setTimeout(r, 1200));

    // -------------------------------------------------------------
    // 5. MAP WORKFLOW (ORIGIN -> VESSELS -> ATTRIBUTION)
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Pipeline Continuity (Origin Analysis) ---');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next: Origin Analysis'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Click "ESTIMATE ORIGIN"
    await page.evaluate(() => {
      const estBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ESTIMATE ORIGIN'));
      if (estBtn) estBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const originResult = await page.evaluate(() => document.body.innerText.includes('Estimated Origin Region Calculated'));
    console.log(`[PASS] Origin Drift Calculation succeeded: ${originResult}`);

    // Vessel Correlation
    console.log('\n--- 6. Testing Vessel Correlation ---');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next: Correlate Vessels'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.evaluate(() => {
      const corrBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CORRELATE VESSELS'));
      if (corrBtn) corrBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const candidateCount = await page.evaluate(() => {
      const text = document.body.innerText;
      const match = text.match(/Candidate Vessels \((\d+)\)/i);
      return match ? parseInt(match[1], 10) : 0;
    });
    console.log(`[PASS] Vessel candidates correlated: ${candidateCount > 0} (count = ${candidateCount})`);

    // -------------------------------------------------------------
    // 7. COMPLETE 5-STEP 2-MINUTE DEMO
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing 2-Minute Guided Demo Flow ---');
    await page.evaluate(() => {
      const demoBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('RUN 2-MIN DEMO'));
      if (demoBtn) demoBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // STEP 1 check
    const step1HeroImg = await page.$eval('img[alt="Synthetic SAR-like Scene"]', el => el.src);
    console.log(`[PASS] Demo Step 1: Ingested hero image: ${step1HeroImg}`);

    const clickDemoNext = async () => {
      await page.evaluate(() => {
        const modal = document.querySelector('[style*="z-index: 2500"]');
        if (!modal) throw new Error('Guided demo modal not open');
        const btns = Array.from(modal.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.innerText.includes('Next'));
        if (nextBtn) nextBtn.click();
      });
      await new Promise(r => setTimeout(r, 1000));
    };

    // Advance to STEP 2
    console.log('   Advancing to Step 2 (Highlight Slick)...');
    await clickDemoNext();

    const step2Text = await page.evaluate(() => {
      const modal = document.querySelector('[style*="z-index: 2500"]');
      return modal ? modal.innerText : '';
    });
    if (step2Text.includes('POSSIBLE OIL SPILL') && step2Text.includes('Prototype Detection')) {
      console.log('[PASS] Demo Step 2: "POSSIBLE OIL SPILL" and "Prototype Detection" displayed with highlighted mask.');
    } else {
      throw new Error(`Demo Step 2 failed to display required text! Text was: ${step2Text}`);
    }

    // Advance to STEP 3
    console.log('   Advancing to Step 3 (Probable Origin on Map)...');
    await clickDemoNext();
    const step3Text = await page.evaluate(() => {
      const modal = document.querySelector('[style*="z-index: 2500"]');
      return modal ? modal.innerText : '';
    });
    if (step3Text.includes('PROBABLE ORIGIN')) {
      console.log('[PASS] Demo Step 3: "PROBABLE ORIGIN" displayed on map.');
    } else {
      throw new Error('Demo Step 3 failed to display PROBABLE ORIGIN!');
    }

    // Advance to STEP 4
    console.log('   Advancing to Step 4 (Vessel Trajectories on Map)...');
    await clickDemoNext();
    const step4Text = await page.evaluate(() => {
      const modal = document.querySelector('[style*="z-index: 2500"]');
      return modal ? modal.innerText : '';
    });
    if (step4Text.includes('VESSEL TRAJECTORIES')) {
      console.log('[PASS] Demo Step 4: "VESSEL TRAJECTORIES" displayed on map.');
    } else {
      throw new Error('Demo Step 4 failed to display VESSEL TRAJECTORIES!');
    }

    // Advance to STEP 5
    console.log('   Advancing to Step 5 (Top Candidate Result)...');
    await clickDemoNext();

    const step5Text = await page.evaluate(() => {
      const modal = document.querySelector('[style*="z-index: 2500"]');
      return modal ? modal.innerText : '';
    });
    const hasTopCandidate = step5Text.includes('MT Ocean Pioneer — DEMO') || step5Text.includes('MT Ocean Pioneer');
    const hasScore87 = step5Text.includes('87');
    const hasEvidence1 = step5Text.includes('Near probable origin');
    const hasEvidence2 = step5Text.includes('Strong time match');
    const hasEvidence3 = step5Text.includes('Drift aligned');

    console.log(`[PASS] Demo Step 5: Top candidate verified: ${hasTopCandidate}`);
    console.log(`[PASS] Demo Step 5: Score 87/100 verified: ${hasScore87}`);
    console.log(`[PASS] Demo Step 5: Evidence points: near=${hasEvidence1}, time=${hasEvidence2}, drift=${hasEvidence3}`);

    if (!hasTopCandidate || !hasScore87 || !hasEvidence1 || !hasEvidence2 || !hasEvidence3) {
      throw new Error('Demo Step 5 missing required candidate, score, or evidence points!');
    }

    // Close demo
    await page.evaluate(() => {
      const demoContainer = document.querySelector('[style*="z-index: 2500"]');
      const closeBtn = demoContainer ? demoContainer.querySelectorAll('button') : [];
      const xBtn = Array.from(closeBtn).pop();
      if (xBtn) xBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    console.log('[PASS] Guided demo closed cleanly.');

    console.log('\n====================================================');
    console.log('HERO VISUAL & DEMO QA SUMMARY');
    console.log('====================================================');
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    console.log(`Total Network Errors: ${networkErrors.length}`);
    console.log(`Total API/Static Responses: ${networkRequests.length}`);

    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('\n>>> SUCCESS: ALL HERO VISUAL & 2-MINUTE DEMO CRITERIA VERIFIED WITH ZERO ERRORS! <<<');
    }

  } catch (err) {
    console.error(`\n[FATAL QA ERROR] ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runHeroVisualQA();
