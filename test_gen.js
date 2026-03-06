const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleMsgs = [];
  page.on('console', msg => consoleMsgs.push(`[${msg.type()}] ${msg.text()}`));
  const pageErrors = [];
  page.on('pageerror', err => pageErrors.push(err.message));

  console.log('Loading page...');
  await page.goto('file:///c:/Users/jcastro/Documents/01-Apps%20en%20Github/Memorias%20de%20Incendio/index.html');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // Check if docx loaded
  const docxLoaded = await page.evaluate(() => typeof docx !== 'undefined');
  console.log(`docx library loaded: ${docxLoaded}`);

  const saveAsLoaded = await page.evaluate(() => typeof saveAs !== 'undefined');
  console.log(`FileSaver.js loaded: ${saveAsLoaded}`);

  if (!docxLoaded) {
    console.log('\n*** CDN LOAD FAILURE — docx is undefined ***');
    console.log('Console messages:');
    consoleMsgs.forEach(m => console.log('  ', m));
    console.log('Page errors:');
    pageErrors.forEach(e => console.log('  ', e));
    await browser.close();
    return;
  }

  // Fill minimum Step 1 fields
  await page.fill('#razonSocial', 'Empresa Test S.R.L.');
  await page.fill('#propietario', 'Juan Pérez');
  await page.fill('#domicilio', 'Av. Test 123, CABA');
  await page.selectOption('#destinoUso', 'Local Comercial');
  await page.selectOption('#tipoObra', 'Existente');
  await page.fill('#cantPlantas', '1');
  await page.fill('#m2Cubiertos', '200');
  await page.fill('#tecNombre', 'Ing. Juan Test');
  await page.fill('#tecMatricula', '12345');
  await page.selectOption('#tecTitulo', { index: 1 });
  
  console.log('Navigating to Step 6...');
  // Jump to step 6 via JS
  const navResult = await page.evaluate(() => {
    try {
      goToStep(6);
      return 'ok - step ' + currentStep;
    } catch(e) {
      return 'error: ' + e.message;
    }
  });
  console.log(`Navigation result: ${navResult}`);
  await page.waitForTimeout(1000);

  // Try generating DOCX - intercept the saveAs call
  console.log('Generating DOCX...');
  const result = await page.evaluate(async () => {
    // Mock saveAs to capture the blob
    const origSaveAs = window.saveAs;
    let savedBlob = null;
    let savedName = '';
    window.saveAs = (blob, name) => { savedBlob = blob; savedName = name; };
    
    try {
      await generateDocx();
      window.saveAs = origSaveAs;
      return { success: true, filename: savedName, blobSize: savedBlob ? savedBlob.size : 0 };
    } catch(e) {
      window.saveAs = origSaveAs;
      return { success: false, error: e.message, stack: e.stack };
    }
  });

  console.log('\n=== RESULT ===');
  console.log(JSON.stringify(result, null, 2));

  if (consoleMsgs.length) {
    console.log('\n=== Console Messages ===');
    consoleMsgs.forEach(m => console.log('  ', m));
  }
  if (pageErrors.length) {
    console.log('\n=== Page Errors ===');
    pageErrors.forEach(e => console.log('  ', e));
  }

  await browser.close();
})();
