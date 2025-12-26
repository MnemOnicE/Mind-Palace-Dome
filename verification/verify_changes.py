from playwright.sync_api import sync_playwright, expect

def verify_changes(page):
    page.goto("http://localhost:8080")

    # 1. Verify Styles are loaded (check background color or simple element presence)
    # The 'Ritual Mode' button should exist now.
    ritual_btn = page.get_by_text("Ritual Mode")
    expect(ritual_btn).to_be_visible()

    # 2. Click Ritual Mode and check for alert
    # Playwright handles dialogs automatically or we can listener.
    # We want to verify the alert message.

    def handle_dialog(dialog):
        print(f"Dialog message: {dialog.message}")
        assert "Ritual Mode is coming soon" in dialog.message
        dialog.accept()

    page.on("dialog", handle_dialog)
    ritual_btn.click()

    # 3. Take a screenshot of the main page to verify CSS migration didn't break layout
    # We'll wait a split second for any potential layout shifts (though unlikely)
    page.wait_for_timeout(500)
    page.screenshot(path="verification/verification.png")
    print("Screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_changes(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
