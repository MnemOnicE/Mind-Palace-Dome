from playwright.sync_api import sync_playwright, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the app
    page.goto("http://localhost:8080")

    # Wait for the room to load (items present)
    page.wait_for_selector(".loci-item")

    # 1. Verify Items Loaded
    items = page.locator(".loci-item")
    count = items.count()
    assert count > 0, "Items should be rendered"
    print(f"✅ Loaded {count} items.")

    # 2. Verify Optimization (Diffing)
    # We want to ensure that a re-render (which happens every 5s) does NOT destroy the elements.
    # We can check this by setting a custom property on a DOM element and seeing if it persists.

    first_item = items.first
    page.evaluate("el => el.dataset.testProperty = 'survived'", first_item.element_handle())

    print("⏳ Waiting 6 seconds for re-render cycle...")
    time.sleep(6)

    # Check if the property is still there
    is_survived = page.evaluate("el => el.dataset.testProperty", first_item.element_handle())

    if is_survived == 'survived':
        print("✅ Optimization Verified: DOM element persisted across re-render.")
    else:
        print("❌ Optimization Failed: DOM element was replaced.")
        # Fail the test
        assert is_survived == 'survived'

    # 3. Take Screenshot of Room
    page.screenshot(path="verification/room_optimized.png")
    print("📸 Screenshot taken: verification/room_optimized.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
