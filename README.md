# The Life of Richard Scolyer

**[The_Life_of_Richard_Scolyer.mp4](The_Life_of_Richard_Scolyer.mp4)**: a 4 min 52 s animated biography (1920×1080, 25 fps, stereo AAC) made in the style of *The Life of Fred Hollows*. It has an orange collage look, chapter title cards, a cartoon "cut-out" host character, stat graphics, and red theatre curtains at the start and end.

Professor Richard Scolyer AO (1966–2026) was a melanoma pathologist and co-medical director of Melanoma Institute Australia. He was joint 2024 Australian of the Year with Professor Georgina Long, and the world's first patient to receive immunotherapy before surgery for glioblastoma.

## Chapters
| Time | Chapter |
|---|---|
| 0:00 | Richard Scolyer (childhood in Launceston) |
| 0:27 | What is a pathologist? |
| 0:52 | Australia's cancer (melanoma) |
| 1:28 | A dream team (Georgina Long, immunotherapy) |
| 2:15 | A shocking twist (glioblastoma, 2023) |
| 2:44 | Patient zero |
| 3:18 | Australians of the Year |
| 3:42 | Changing lives |
| 4:15 | What we can learn |

## Two versions
- **In this repo:** `The_Life_of_Richard_Scolyer.mp4` (4:52) is the fully illustrated version. It contains no copyrighted photos, so it is safe to share publicly.
- **Real-photo version** (4:58, delivered separately, not stored here): Richard is shown in real news and institutional photos (ABC News, ABC *Australian Story*, AAP, AFP, Melanoma Institute Australia, The University of Sydney, family photos via Instagram). It also uses openly licensed photos of places and science images, and ends with a full credits screen. The news photos are copyrighted, so that version is meant for personal, classroom or school use. Posting it publicly may draw copyright claims.

## How it was made
I made the script, the illustrations and animation (HTML/SVG rendered frame by frame in headless Chromium), and the music (composed as MIDI and rendered with the FluidR3 GM soundfont). The narration uses a synthetic voice (Kokoro TTS).

The facts come from ABC News (8 June 2026), Melanoma Institute Australia / The University of Sydney (tribute, 13 July 2026) and Wikipedia. The quotes on screen are Richard Scolyer's own words as the ABC reported them. The openly licensed photos in `film/photos/cc/` are listed with their creators and licences in `film/photos/cc/credits.json` (CC BY / CC BY-SA / public domain). The map outlines come from Natural Earth (public domain). The fonts are Caprasimo, Open Sans, Nunito and Caveat (SIL OFL).

The source is in [`film/`](film) and builds the real-photo version. Copyrighted photos are not included: put them in `film/photos/press/` under the names that `film/scenes.js` uses (`PR('…')`). Then run `film/setup.sh` once, followed by `film/build.sh`.
