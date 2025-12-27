from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the app
    print("🚀 Navigating to app...")
    page.goto("http://localhost:8080")

    # 1. Verify Edit Button Exists
    print("🔍 Checking for Edit Button...")
    edit_btn = page.locator(".edit-btn").first
    expect(edit_btn).to_be_visible()
    edit_btn.click()

    # 2. Verify Edit Modal
    print("📝 Verifying Edit Modal...")
    modal = page.locator("#edit-modal")
    expect(modal).to_be_visible()

    # Take screenshot of Edit Modal
    page.screenshot(path="verification/step1_edit_modal.png")

    # Edit text
    page.fill("#edit-concept", "Playwright Concept")
    page.click("#btn-save-edit")

    # Verify update
    expect(modal).to_be_hidden()
    expect(page.locator(".loci-label").first).to_have_text("Playwright Concept")
    print("✅ Item Edited Successfully.")

    page.screenshot(path="verification/step2_edited_item.png")

    # 3. Verify Ritual Mode
    print("🕯️ Testing Ritual Mode...")
    # First, we need to ensure items are "due".
    # By default, fresh items (seeded in state_manager) have lastReviewed: 0 and dueDate: 0 (or undefined -> 0).
    # Since Date.now() > 0, they should be dusty.

    page.click("#btn-ritual")

    # Overlay should appear
    overlay = page.locator("#ritual-overlay")
    expect(overlay).to_be_visible()

    # Check Front of Card
    expect(page.locator(".ritual-prompt")).to_be_visible()
    page.screenshot(path="verification/step3_ritual_front.png")
    page.click("#ritual-reveal")

    # Check Back of Card (Grading Buttons)
    expect(page.locator(".g-good")).to_be_visible()
    page.screenshot(path="verification/step4_ritual_back.png")
    page.click(".g-good") # Mark as Good

    # Check Progress (Should move to next or finish)
    # Since we have 3 items, it should show next item.
    expect(page.locator("#ritual-step")).to_contain_text("2")
    print("✅ Ritual Mode Flow verified.")

    # Close Ritual
    page.click("#ritual-close")
    expect(overlay).to_be_hidden()

    # 4. Verify AI Settings
    print("🤖 Verifying AI Settings...")
    page.click("#btn-settings")
    page.click("button[data-tab='ai']")
    expect(page.locator("#set-gemini-key")).to_be_visible()
    print("✅ AI Settings Tab verified.")
    page.screenshot(path="verification/step5_ai_settings.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
