from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    # Capture ALL console messages
    console_msgs = []
    page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}"))
    # Capture page errors
    page_errors = []
    page.on("pageerror", lambda err: page_errors.append(str(err)))
    
    page.goto("file:///c:/Users/jcastro/Documents/01-Apps%20en%20Github/Memorias%20de%20Incendio/index.html")
    page.wait_for_load_state("load")
    time.sleep(5)  # Wait for CDN scripts to load
    
    # Fill minimum required fields for Step 1
    page.fill("#razonSocial", "Empresa Test S.R.L.")
    page.fill("#propietario", "Juan Pérez")
    page.fill("#domicilio", "Av. Test 123, CABA")
    page.select_option("#destinoUso", "Local Comercial")
    page.select_option("#tipoObra", "Existente")
    page.fill("#cantPlantas", "1")
    page.fill("#m2Cubiertos", "200")
    page.fill("#tecNombre", "Ing. Test")
    page.fill("#tecMatricula", "12345")
    page.fill("#tecTitulo", "Ingeniero")
    
    # Try to navigate to step 6 (click Next multiple times)
    for i in range(5):
        next_btn = page.locator(f"button:has-text('Siguiente')")
        if next_btn.count() > 0:
            next_btn.first.click()
            time.sleep(0.5)
    
    time.sleep(1)
    
    # Try clicking download button directly
    download_btn = page.locator("button:has-text('Descargar Memoria')")
    if download_btn.count() > 0:
        print(f"Found download button, clicking...")
        download_btn.first.click()
        time.sleep(5)
    else:
        # Maybe we're not on step 6 yet, try using JS
        print("Download button not found, trying JS navigation...")
        page.evaluate("goToStep(6)")
        time.sleep(2)
        page.evaluate("generateDocx().catch(e => window.__docxError = e.message + ' | ' + e.stack)")
        time.sleep(5)
    
    # Print all console messages
    print("\n=== CONSOLE MESSAGES ===")
    for msg in console_msgs:
        print(msg)
    
    print("\n=== PAGE ERRORS ===")
    for err in page_errors:
        print(err)
    
    # Check for our custom error variable
    try:
        docx_error = page.evaluate("window.__docxError || 'no error captured'")
        print(f"\n=== DOCX ERROR ===\n{docx_error}")
    except:
        pass
    
    browser.close()
