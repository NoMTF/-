# Render selected timestamps to PNG for visual checking: preview.py out_dir t1 t2 ...
import sys, asyncio, os
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
async def main():
    out = sys.argv[1]; ts = [float(x) for x in sys.argv[2:]]
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get("CHROMIUM") or None, args=["--allow-file-access-from-files"])
        pg = await b.new_page(viewport={"width": 1920, "height": 1080})
        msgs = []
        pg.on("console", lambda m: msgs.append(m.text)); pg.on("pageerror", lambda e: msgs.append("ERR " + str(e)))
        await pg.goto("file://" + HERE + "/film.html"); await pg.wait_for_function("window.READY === true")
        for t in ts:
            await pg.evaluate(f"render({t})")
            await pg.screenshot(path=f"{out}/t{t:07.2f}.png")
        for m in msgs: print(m)
        await b.close()
asyncio.run(main())
