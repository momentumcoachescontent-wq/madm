from playwright.sync_api import Page, expect, sync_playwright

def test_share_story_page(page: Page):
    # 1. Arrange: Go to the share story page.
    page.goto("http://127.0.0.1:8787/comparte-tu-historia")

    # 2. Assert: Check for key elements.
    # Check for Hero Section title
    expect(page.get_by_role("heading", name="Comparte tu Historia")).to_be_visible()

    # Check for "Historias Recientes" heading (Specific)
    expect(page.get_by_role("heading", name="Historias Recientes")).to_be_visible()

    # Check for Form Section
    expect(page.get_by_role("heading", name="Escribe tu Historia")).to_be_visible()

    # Check for Textarea
    expect(page.locator("textarea#story_text")).to_be_visible()

    # Check for Submit Button
    expect(page.get_by_role("button", name="Enviar Historia")).to_be_visible()

    # 3. Screenshot
    page.screenshot(path="verification/share_story_page.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_share_story_page(page)
        finally:
            browser.close()
