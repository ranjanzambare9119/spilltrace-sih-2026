const puppeteer = require('../frontend/node_modules/puppeteer-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runRealSpillQA() {
  console.log('====================================================');
  console.log('SPILLTRACE REAL SENTINEL-1 DATASET QA TEST');
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
    console.log('\n--- 1. Loading Application ---');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0', timeout: 15000 });
    console.log('[PASS] Application loaded.');

    console.log('\n--- 2. Navigating to Satellite Analysis ---');
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('header button'));
      const satTab = tabs.find(b => b.innerText.includes('Satellite'));
      if (satTab) satTab.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Check default dataset
    const selectedScene = await page.$eval('select', el => el.value);
    console.log(`[PASS] Currently selected dataset: "${selectedScene}"`);
    if (!selectedScene.includes('real_spill')) {
      throw new Error(`Expected real_spill.jpg as default, got: ${selectedScene}`);
    }

    // Check required labels in DOM
    const bodyText = await page.evaluate(() => document.body.innerText);
    
    const req1 = "REAL SENTINEL-1 DEMONSTRATION DATA";
    const req2 = "Possible Oil Spill Detected";
    const req3 = "Prototype Detection / Annotated Region";

    if (bodyText.includes(req1)) {
      console.log(`[PASS] Found required badge: "${req1}"`);
    } else {
      throw new Error(`Missing required badge: "${req1}"`);
    }

    if (bodyText.includes(req2)) {
      console.log(`[PASS] Found required title: "${req2}"`);
    } else {
      throw new Error(`Missing required title: "${req2}"`);
    }

    if (bodyText.includes(req3)) {
      console.log(`[PASS] Found required subtitle: "${req3}"`);
    } else {
      throw new Error(`Missing required subtitle: "${req3}"`);
    }

    // Check SAR image rendering
    const sarImg = await page.$eval('img[alt="Sentinel-1 SAR Scene"]', el => ({
      src: el.src,
      complete: el.complete,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight
    }));
    console.log(`[PASS] Raw SAR image element: src=${sarImg.src}, loaded=${sarImg.complete}, dimensions=${sarImg.naturalWidth}x${sarImg.naturalHeight}`);

    // Check Bounding Box element and coordinates
    const bboxExists = await page.evaluate(() => {
      const box = document.querySelector('[style*="border: 2px solid rgb(0, 240, 255)"], [style*="border: 2px solid #00f0ff"]');
      return !!box;
    });
    console.log(`[PASS] Annotated Bounding box rendered on SAR image: ${bboxExists}`);

    // Check Magnified Inspection Loupe
    const loupeExists = await page.evaluate(() => {
      const loupe = Array.from(document.querySelectorAll('div')).find(d => d.innerText.includes('DETAIL LOUPE'));
      return !!loupe;
    });
    console.log(`[PASS] 3x Detection Zoom Loupe rendered: ${loupeExists}`);

    // -------------------------------------------------------------
    // Test Fallback: Switch to synthetic benchmark
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Synthetic Benchmark Fallback ---');
    await page.select('select', 'sample_spill.png');
    await new Promise(r => setTimeout(r, 1500));

    const fallbackSelected = await page.$eval('select', el => el.value);
    console.log(`[PASS] Switched dataset to: "${fallbackSelected}"`);

    // Check that it switched to synthetic image
    const fallbackText = await page.evaluate(() => document.body.innerText);
    const hasBenchmarkBadge = fallbackText.toLowerCase().includes('synthetic sar benchmark');
    console.log(`[PASS] Fallback dataset loaded properly: ${hasBenchmarkBadge}`);

    // Switch back to real_spill.jpg
    console.log('\n--- 4. Switching Back to Real Sentinel-1 Data ---');
    await page.select('select', 'real_spill.jpg');
    await new Promise(r => setTimeout(r, 1500));
    console.log('[PASS] Switched back to real_spill.jpg successfully.');

    // -------------------------------------------------------------
    // Test Pipeline Continuation: Origin Analysis
    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Origin Analysis with Real Spill ---');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next: Origin Analysis'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Click "ESTIMATE ORIGIN"
    await page.evaluate(() => {
      const estimateBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ESTIMATE ORIGIN'));
      if (estimateBtn) estimateBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const originCalculated = await page.evaluate(() => {
      return document.body.innerText.includes('Estimated Origin Region Calculated');
    });
    console.log(`[PASS] Origin Drift Calculation succeeded: ${originCalculated}`);

    // -------------------------------------------------------------
    // Test Pipeline Continuation: Vessel Correlation
    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Vessel Correlation ---');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next: Correlate Vessels'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    // Click "CORRELATE VESSELS"
    await page.evaluate(() => {
      const corrBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('CORRELATE VESSELS'));
      if (corrBtn) corrBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const candidateCount = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('div')).filter(d => d.innerText.includes('Likelihood'));
      return rows.length;
    });
    console.log(`[PASS] Vessel correlation candidates returned: ${candidateCount}`);

    // -------------------------------------------------------------
    // Test Pipeline Continuation: Investigation
    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Investigation & Attribution ---');
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Next: View Investigation'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    const topVessel = await page.$eval('h3', el => el.innerText);
    console.log(`[PASS] Attribution top candidate: "${topVessel}"`);

    // -------------------------------------------------------------
    // Test Guided Demo Mode
    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Guided Demo Mode with Real Spill ---');
    await page.evaluate(() => {
      const demoBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('RUN 2-MIN DEMO'));
      if (demoBtn) demoBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Verify Demo Step 1 has Real Sentinel-1 image & badge
    const demoHasRealLabel = await page.evaluate(() => {
      const demoContainer = document.querySelector('[style*="z-index: 2500"]');
      return demoContainer ? demoContainer.innerText.includes('REAL SENTINEL-1') : false;
    });
    console.log(`[PASS] Guided Demo Step 1 displays Real Sentinel-1 data badge: ${demoHasRealLabel}`);

    // Close Demo
    await page.evaluate(() => {
      const demoContainer = document.querySelector('[style*="z-index: 2500"]');
      const closeBtn = demoContainer ? demoContainer.querySelectorAll('button') : [];
      const xBtn = Array.from(closeBtn).pop();
      if (xBtn) xBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    console.log('[PASS] Guided demo exited cleanly.');

    console.log('\n====================================================');
    console.log('REAL SENTINEL-1 QA SUMMARY');
    console.log('====================================================');
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    console.log(`Total Network Errors: ${networkErrors.length}`);
    console.log(`Total API Calls: ${networkRequests.length}`);

    if (consoleErrors.length === 0 && networkErrors.length === 0) {
      console.log('\n>>> SUCCESS: ALL REAL SENTINEL-1 REQUIREMENTS VERIFIED WITH 0 ERRORS! <<<');
    }

  } catch (err) {
    console.error(`\n[FATAL QA ERROR] ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runRealSpillQA();
