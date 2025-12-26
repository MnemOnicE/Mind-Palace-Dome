from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the app
    page.goto("http://localhost:8080")

    # 1. Verify "Ritual Mode" Alert
    # We need to handle the dialog (alert)
    dialog_message = ""
    def handle_dialog(dialog):
        nonlocal dialog_message
        dialog_message = dialog.message
        dialog.accept()

    page.on("dialog", handle_dialog)

    # Click Ritual Mode
    page.get_by_role("button", name="Ritual Mode").click()

    # Check if the alert message was correct
    assert "Ritual Mode is currently under construction" in dialog_message
    print("✅ Ritual Mode alert verified.")

    # 2. Verify CSS Styles
    # Check if body background is correct (from CSS)
    # The CSS sets background-color: #121212
    bg_color = page.evaluate("window.getComputedStyle(document.body).backgroundColor")
    assert bg_color == "rgb(18, 18, 18)"
    print("✅ CSS Body Background verified.")

    # 3. Verify Settings Modal
    page.get_by_role("button", name="⚙️ Settings").click()
    expect(page.locator("#settings-modal")).to_be_visible()

    # Take a screenshot of the settings modal
    page.screenshot(path="verification/settings_modal.png")
    print("📸 Screenshot taken: verification/settings_modal.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
