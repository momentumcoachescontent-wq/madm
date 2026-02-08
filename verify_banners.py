from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto("http://127.0.0.1:8787/recursos-gratuitos")

        # Wait for the AI banner to be visible
        page.wait_for_selector(".ai-banner")

        # Take a screenshot of the resources list which contains both banners
        # or take full page screenshot
        page.screenshot(path="verification_banners.png", full_page=True)

        # Also take specific screenshots of the banners for better detail
        ai_banner = page.locator(".ai-banner")
        ai_banner.screenshot(path="verification_ai_banner.png")

        page.wait_for_selector(".umbral-banner", state="visible")
        umbral_banner = page.locator(".umbral-banner")
        umbral_banner.screenshot(path="verification_umbral_banner.png")

        browser.close()

if __name__ == "__main__":
    run()
