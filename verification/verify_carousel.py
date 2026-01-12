from playwright.sync_api import sync_playwright, expect
import time

def verify_carousel():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # 1. Load the App
        # Assuming the app is running on localhost:8000 as per README/startup.sh
        # But here I need to start the server first or assume it's running?
        # The environment requires me to run a server.
        # I will start the server in the background in a separate tool call, but for this script logic:
        try:
            page.goto("http://localhost:8000")
            page.wait_for_selector("h1") # Wait for title
        except Exception as e:
            print(f"Failed to load page: {e}")
            browser.close()
            return

        print("Page loaded.")

        # 2. Check Carousel Structure
        carousel = page.locator(".carousel-container")
        expect(carousel).to_be_visible()
        print("Carousel container found.")

        # 3. Check Active Item
        active_item = page.locator(".carousel-item.active")
        expect(active_item).to_be_visible()
        print("Active item found.")

        # 4. Check Navigation (Next)
        next_btn = page.locator(".nav-btn.next")

        # Get ID of current active item
        first_id = active_item.get_attribute("data-id")

        next_btn.click()
        time.sleep(1) # Wait for transition

        # Verify new active item is different
        new_active = page.locator(".carousel-item.active")
        second_id = new_active.get_attribute("data-id")

        if first_id != second_id:
            print(f"Navigation success: ID {first_id} -> {second_id}")
        else:
            print("Navigation failed or only 1 item.")

        # 5. Check Tourism Mode
        tour_btn = page.locator("#btn-tour")
        expect(tour_btn).to_be_visible()

        tour_btn.click()
        print("Tour started.")
        time.sleep(4) # Wait for auto-advance (3s interval)

        third_active = page.locator(".carousel-item.active")
        third_id = third_active.get_attribute("data-id")

        if third_id != second_id:
            print(f"Tour auto-advance success: ID {second_id} -> {third_id}")
        else:
            print("Tour auto-advance failed or stuck.")

        # Screenshot
        page.screenshot(path="verification/carousel_verify.png")
        print("Screenshot saved to verification/carousel_verify.png")

        browser.close()

if __name__ == "__main__":
    verify_carousel()
