# Render frames [a, b) of the film to an H.264 segment by driving Chromium frame-by-frame.
import sys, asyncio, os, base64, subprocess, json, time
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); FPS = 25
async def main(a, b, out):
    ff = subprocess.Popen(["ffmpeg", "-y", "-v", "error", "-f", "image2pipe", "-framerate", str(FPS), "-c:v", "mjpeg", "-i", "-",
                           "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", "-r", str(FPS), out], stdin=subprocess.PIPE)
    async with async_playwright() as p:
        br = await p.chromium.launch(executable_path=os.environ.get("CHROMIUM") or None, args=["--allow-file-access-from-files", "--disable-gpu"])
        pg = await br.new_page(viewport={"width": 1920, "height": 1080})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("file://" + HERE + "/film.html"); await pg.wait_for_function("window.READY === true")
        cdp = await pg.context.new_cdp_session(pg); t0 = time.time()
        for f in range(a, b):
            await pg.evaluate(f"render({f / FPS})")
            r = await cdp.send("Page.captureScreenshot", {"format": "jpeg", "quality": 94, "optimizeForSpeed": True})
            ff.stdin.write(base64.b64decode(r["data"]))
            if (f - a) % 250 == 0: print(f"[{a}-{b}] frame {f} {time.time() - t0:.0f}s", flush=True)
        if errs: print("PAGE ERRORS:", errs[:5])
        await br.close()
    ff.stdin.close(); ff.wait()
if __name__ == "__main__":
    asyncio.run(main(int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]))
