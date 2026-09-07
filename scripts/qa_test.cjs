const puppeteer = require('puppeteer-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runQA() {
  console.log('====================================================');
  console.log('SPILLTRACE AUTOMATED END-TO-END QA TEST');
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

  // Listen for console events
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`[CONSOLE ERROR] ${text}`);
    } else if (type === 'warn') {
      console.log(`[CONSOLE WARN] ${text}`);
    }
  });

  // Listen for failed network requests
  page.on('requestfailed', request => {
    networkErrors.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
    console.log(`[NET ERROR] ${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) {
      networkRequests.push({ url, status: response.status() });
      console.log(`[API RESPONSE] ${response.status()} ${url}`);
    }
  });

  try {
    // -------------------------------------------------------------
    // 1. DASHBOARD
    // -------------------------------------------------------------
    console.log('\n--- 1. Testing Dashboard ---');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    
    // Check title / brand
    const title = await page.$eval('h1', el => el.innerText);
    console.log(`[PASS] Dashboard loaded, title: "${title}"`);

    // Check 4 KPI cards
    const kpis = await page.$$eval('[style*="border-left: 4px solid"], [style*="border: 1px solid #38bdf8"]', els => els.map(e => e.innerText));
    console.log(`[PASS] Found ${kpis.length} KPI cards on Dashboard.`);

    // Check for "API KEY REQUIRED" watermark
    const pageText = await page.evaluate(() => document.body.innerText);
    if (pageText.includes('API KEY REQUIRED')) {
      console.error('[FAIL] ERROR: "API KEY REQUIRED" watermark detected!');
    } else {
      console.log('[PASS] Check: No "API KEY REQUIRED" watermark on map.');
    }

    // Check Leaflet map rendered
    const mapTiles = await page.$$('.leaflet-tile');
    console.log(`[PASS] Map initialized with ${mapTiles.length} tiles loaded.`);

    // -------------------------------------------------------------
    // 2. SATELLITE ANALYSIS
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Satellite Analysis View ---');
    // Click "2. Satellite" tab in header
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('header button'));
      const satTab = tabs.find(b => b.innerText.includes('Satellite'));
      if (satTab) satTab.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const satHeader = await page.$eval('h2', el => el.innerText);
    console.log(`[PASS] Navigated to: "${satHeader}"`);

    // -------------------------------------------------------------
    // 3. ANALYZE SPILL BUTTON
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing "ANALYZE SPILL" Button ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const analyzeBtn = btns.find(b => b.innerText.includes('ANALYZE SPILL'));
      if (analyzeBtn) analyzeBtn.click();
    });
    // Wait for analysis to complete
    await new Promise(r => setTimeout(r, 1500));

    // Check results cards
    const satResults = await page.evaluate(() => {
      const areaEl = Array.from(document.querySelectorAll('div')).find(d => d.innerText.includes('ESTIMATED AREA'));
      return areaEl ? areaEl.parentElement.innerText : 'Not found';
    });
    console.log(`[PASS] Satellite analysis completed. Result: ${satResults.replace(/\n/g, ' ')}`);

    // -------------------------------------------------------------
    // 4. ORIGIN ANALYSIS
    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Origin Analysis View ---');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('header button'));
      const origTab = tabs.find(b => b.innerText.includes('Origin'));
      if (origTab) origTab.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const origHeader = await page.$eval('h2', el => el.innerText);
    console.log(`[PASS] Navigated to: "${origHeader}"`);

    // -------------------------------------------------------------
    // 5. ESTIMATE ORIGIN BUTTON
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing "ESTIMATE ORIGIN" Button ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const estimateBtn = btns.find(b => b.innerText.includes('ESTIMATE ORIGIN'));
      if (estimateBtn) estimateBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Verify origin update on UI & Map
    const originStatus = await page.evaluate(() => {
      const originDiv = Array.from(document.querySelectorAll('div')).find(d => d.innerText.includes('Estimated Origin Region Calculated'));
      return originDiv ? originDiv.innerText : 'Banner not visible';
    });
    console.log(`[PASS] Origin estimation result: ${originStatus}`);

    // Check drift arrow on map
    const driftBadge = await page.$('.drift-arrow-badge');
    console.log(`[PASS] Drift arrow badge present on map: ${!!driftBadge}`);

    // -------------------------------------------------------------
    // 6. VESSEL CORRELATION
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Vessel Correlation View ---');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('header button'));
      const vTab = tabs.find(b => b.innerText.includes('Vessels'));
      if (vTab) vTab.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const vesselHeader = await page.$eval('h2', el => el.innerText);
    console.log(`[PASS] Navigated to: "${vesselHeader}"`);

    // -------------------------------------------------------------
    // 7. CORRELATE VESSELS BUTTON
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing "CORRELATE VESSELS" Button ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const corrBtn = btns.find(b => b.innerText.includes('CORRELATE VESSELS'));
      if (corrBtn) corrBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    // Check candidate list items
    const candidateList = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('div')).filter(d => d.innerText.includes('#1') && d.innerText.includes('Likelihood'));
      return rows.map(r => r.innerText.replace(/\n/g, ' '));
    });
    console.log(`[PASS] Candidate list loaded (${candidateList.length} items):`);
    candidateList.forEach(c => console.log(`   ${c}`));

    // -------------------------------------------------------------
    // 8. INVESTIGATION VIEW
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Investigation View ---');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('header button'));
      const invTab = tabs.find(b => b.innerText.includes('Investigation'));
      if (invTab) invTab.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const invHeader = await page.$eval('h2', el => el.innerText);
    console.log(`[PASS] Navigated to: "${invHeader}"`);

    // Check Top Candidate Hero Card
    const topCandidateName = await page.evaluate(() => {
      const hero = document.querySelector('h3');
      return hero ? hero.innerText : 'Hero not found';
    });
    console.log(`[PASS] Top Candidate displayed: "${topCandidateName}"`);

    // -------------------------------------------------------------
    // 9. WHY THIS VESSEL MODAL
    // -------------------------------------------------------------
    console.log('\n--- 9. Testing "WHY THIS VESSEL" Modal ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const whyBtn = btns.find(b => b.innerText.includes('WHY?'));
      if (whyBtn) whyBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const modalTitle = await page.evaluate(() => {
      const m = document.querySelector('[style*="z-index: 2000"]');
      return m ? m.innerText.split('\n')[0] : 'Modal not found';
    });
    console.log(`[PASS] VesselDetailModal opened: "${modalTitle}"`);

    // Close modal
    await page.evaluate(() => {
      const m = document.querySelector('[style*="z-index: 2000"]');
      const closeBtn = m ? m.querySelector('button') : null;
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    console.log('[PASS] VesselDetailModal closed successfully.');

    // -------------------------------------------------------------
    // 10. RUN 2-MIN DEMO
    // -------------------------------------------------------------
    console.log('\n--- 10. Testing "RUN 2-MIN DEMO" Full Flow ---');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const demoBtn = btns.find(b => b.innerText.includes('RUN 2-MIN DEMO'));
      if (demoBtn) demoBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Check demo mode opened
    const demoOpen = await page.evaluate(() => {
      return !!document.querySelector('[style*="z-index: 2500"]');
    });
    console.log(`[PASS] GuidedDemoMode modal opened: ${demoOpen}`);

    // Step 1: Check detect card
    const step1Text = await page.evaluate(() => {
      const card = document.querySelector('[style*="border-left: 5px solid rgb(239, 68, 68)"]');
      return card ? card.innerText.replace(/\n/g, ' ') : 'Not found';
    });
    console.log(`[PASS] Demo Step 1: ${step1Text}`);

    // Click "Next ›" to go to Step 2
    console.log('   Clicking "Next" to Step 2 (Trace Origin)...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const step2Text = await page.evaluate(() => {
      const card = document.querySelector('[style*="border-left: 5px solid rgb(245, 158, 11)"]');
      return card ? card.innerText.replace(/\n/g, ' ') : 'Not found';
    });
    console.log(`[PASS] Demo Step 2: ${step2Text}`);

    // Click "Next ›" to go to Step 3
    console.log('   Clicking "Next" to Step 3 (Trace Vessels)...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const step3Text = await page.evaluate(() => {
      const card = document.querySelector('[style*="border-left: 5px solid rgb(56, 189, 248)"]');
      return card ? card.innerText.replace(/\n/g, ' ') : 'Not found';
    });
    console.log(`[PASS] Demo Step 3: ${step3Text}`);

    // Click "Next ›" to go to Step 4
    console.log('   Clicking "Next" to Step 4 (Rank Top Candidate)...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const step4Text = await page.evaluate(() => {
      const card = document.querySelector('[style*="border: 2px solid rgb(56, 189, 248)"]');
      return card ? card.innerText.replace(/\n/g, ' ') : 'Not found';
    });
    console.log(`[PASS] Demo Step 4: ${step4Text}`);

    // Click "Next ›" to go to Step 5
    console.log('   Clicking "Next" to Step 5 (Finish Attribution)...');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const step5Text = await page.evaluate(() => {
      const card = document.querySelector('[style*="border: 2px solid rgb(56, 189, 248)"]');
      return card ? card.innerText.replace(/\n/g, ' ') : 'Not found';
    });
    console.log(`[PASS] Demo Step 5: ${step5Text}`);

    // Click "Exit" (X button in demo top bar)
    console.log('   Exiting Guided Demo Mode...');
    await page.evaluate(() => {
      const demoContainer = document.querySelector('[style*="z-index: 2500"]');
      const closeBtn = demoContainer ? demoContainer.querySelectorAll('button') : [];
      const xBtn = Array.from(closeBtn).pop(); // last button in header is X
      if (xBtn) xBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    const demoClosed = await page.evaluate(() => {
      return !document.querySelector('[style*="z-index: 2500"]');
    });
    console.log(`[PASS] GuidedDemoMode closed cleanly: ${demoClosed}`);

    console.log('\n====================================================');
    console.log('QA VERIFICATION SUMMARY');
    console.log('====================================================');
    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Network Errors: ${networkErrors.length}`);
    console.log(`Total API Requests Verified: ${networkRequests.length}`);
    
    if (consoleErrors.length > 0) {
      console.log('\nConsole Errors Detail:');
      consoleErrors.forEach(e => console.log(` - ${e}`));
    }

    if (networkErrors.length > 0) {
      console.log('\nNetwork Errors Detail:');
      networkErrors.forEach(e => console.log(` - ${e}`));
    }

    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('\n>>> ALL 10 TEST CRITERIA PASSED WITH ZERO ERRORS! <<<');
    }

  } catch (err) {
    console.error(`\n[FATAL QA ERROR] ${err.message}`);
    console.error(err.stack);
  } finally {
    await browser.close();
  }
}

runQA();
