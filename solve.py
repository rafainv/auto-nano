import asyncio
import time
from playwright.async_api import async_playwright
from playwright_captcha import CaptchaType, ClickSolver, FrameworkType

async def solve_captcha():
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        page = await browser.new_page()
        
        framework = FrameworkType.PLAYWRIGHT
        
        # Create solver before navigating to the page
        async with ClickSolver(framework=framework, page=page) as solver:
            # Navigate to your target page
            await page.goto('https://clifford.io/demo/cloudflare-turnstile')
            
            # Solve the captcha
            await solver.solve_captcha(
                captcha_container=page,
                captcha_type=CaptchaType.CLOUDFLARE_TURNSTILE
            )
        
        await asyncio.sleep(5)
        await page.screenshot(path='screen.png')

asyncio.run(solve_captcha())
