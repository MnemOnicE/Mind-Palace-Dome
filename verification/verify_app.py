from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Listen to console logs
    page.on("console", lambda msg: print(f"BROWSER LOG: {msg.text}"))
    page.on("pageerror", lambda err: print(f"BROWSER ERROR: {err}"))

    page.goto("http://localhost:8000")

    # Wait for room to load
    page.wait_for_selector(".room-card")
    page.screenshot(path="verification/step1_initial.png")

    # Find a dusty card
    dusty_card = page.locator(".dusty").first
    if dusty_card.count() > 0:
        print("Found dusty card")
        # Ensure we are clicking the element that has the listener
        # In app.js: itemCard.addEventListener('click', ...)
        # itemCard has class 'loci-item room-card dusty'

        # Force click just in case of overlay issues
        dusty_card.click(force=True)

        # Wait for quiz modal
        try:
            page.wait_for_selector("#quiz-modal", state="visible", timeout=5000)
            print("Quiz Modal appeared")
            page.screenshot(path="verification/step2_quiz_modal.png")
        except Exception as e:
            print(f"Modal did not appear: {e}")
            page.screenshot(path="verification/step2_fail.png")

    else:
        print("No dusty card found")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
