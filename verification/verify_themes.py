
from playwright.sync_api import sync_playwright

def verify_themes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app
        page.goto("http://localhost:8080")

        # Open Settings
        page.click("#btn-settings")

        # Wait for modal
        page.wait_for_selector("#settings-modal", state="visible")

        # Select Light Theme
        page.select_option("#set-theme", "light")

        # Close Settings
        page.click("#close-settings")

        # Take Screenshot of Light Theme
        page.screenshot(path="verification/light_theme.png")
        print("Captured Light Theme")

        # Open Settings again
        page.click("#btn-settings")

        # Select Matrix Theme
        page.select_option("#set-theme", "matrix")

        # Close Settings
        page.click("#close-settings")

        # Take Screenshot of Matrix Theme
        page.screenshot(path="verification/matrix_theme.png")
        print("Captured Matrix Theme")

        # Open Settings again
        page.click("#btn-settings")

        # Select Cyberpunk Theme
        page.select_option("#set-theme", "cyberpunk")

        # Close Settings
        page.click("#close-settings")

        # Take Screenshot of Cyberpunk Theme
        page.screenshot(path="verification/cyberpunk_theme.png")
        print("Captured Cyberpunk Theme")

        browser.close()

if __name__ == "__main__":
    verify_themes()
