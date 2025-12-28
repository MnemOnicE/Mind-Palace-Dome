from playwright.sync_api import sync_playwright

def verify_architect_mode():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # 1. Load the app
        # Since this is a simple static site, we might need a server or just open file
        # But app.js uses modules, so we need a server.
        # Assuming we start a server on port 8000
        page.goto("http://localhost:8000")

        # 2. Verify Room Select exists
        page.wait_for_selector("#room-select")
        print("✅ Room select found")

        # 3. Create a new Room
        # We need to handle the prompt dialog
        page.on("dialog", lambda dialog: dialog.accept("The Kitchen"))

        page.click("#btn-new-room")
        print("✅ Clicked New Room")

        # Wait for render
        page.wait_for_timeout(1000)

        # Check if title changed
        title = page.text_content("#current-room-name")
        if "The Kitchen" in title:
            print("✅ Room switched to The Kitchen")
        else:
            print(f"❌ Failed to switch room. Title: {title}")

        # 4. Add an Item
        page.click("#btn-add-item")
        print("✅ Clicked Add Item")

        # Fill Modal
        page.fill("#edit-concept", "The Fridge")
        page.fill("#edit-url", "https://placehold.co/100")
        page.click("#btn-save-edit")
        print("✅ Saved new item")

        page.wait_for_timeout(1000)

        # 5. Verify Item Rendered
        items = page.query_selector_all(".loci-item")
        found = False
        for item in items:
            text = item.text_content()
            if "The Fridge" in text:
                found = True
                break

        if found:
            print("✅ Item The Fridge found in DOM")
        else:
            print("❌ Item not found")

        # Screenshot
        page.screenshot(path="verification/architect_mode.png")
        print("📸 Screenshot saved")

        browser.close()

if __name__ == "__main__":
    verify_architect_mode()
