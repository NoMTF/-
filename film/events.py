import asyncio, json, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get("CHROMIUM") or None, args=["--allow-file-access-from-files"])
        pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        await pg.goto("file://" + HERE + "/film.html"); await pg.wait_for_function("window.READY === true")
        ev = await pg.evaluate("getEvents()")
        json.dump(ev, open("events.json", "w"), indent=0); await b.close()
        from collections import Counter; print(len(ev), Counter(e["type"] for e in ev))
asyncio.run(main())
