#!/bin/bash
# Rebuild ../The_Life_of_Richard_Scolyer.mp4 from source. Run ./setup.sh once first.
set -e
cd "$(dirname "$0")"
WORKERS=${WORKERS:-4}
python3 tts.py bm_george 1.15 vo          # narration, one wav per line
python3 timeline.py                       # timings -> timeline.json / timeline.js
python3 geo.py                            # map outlines -> geo.js
python3 music.py                          # score -> music/*.wav
python3 events.py                         # sound-effect cues from the animation
python3 mix.py                            # narration + ducked score + effects -> mix_raw.wav
# video: render frame ranges in parallel, then join
mkdir -p seg; rm -f seg/part*.mp4 seg/list.txt
N=$(python3 -c "import json,math;print(math.ceil(json.load(open('timeline.json'))['total']*25))")
for i in $(seq 0 $((WORKERS-1))); do
  a=$((N*i/WORKERS)); b=$((N*(i+1)/WORKERS))
  python3 render.py $a $b seg/part$i.mp4 > seg/log$i.txt 2>&1 &
  echo "file 'part$i.mp4'" >> seg/list.txt
done
wait
ffmpeg -y -v error -f concat -safe 0 -i seg/list.txt -c copy video_only.mp4
M=$(ffmpeg -hide_banner -i mix_raw.wav -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
LN=$(echo "$M" | python3 -c "import json,sys;d=json.load(sys.stdin);print(f\"measured_I={d['input_i']}:measured_TP={d['input_tp']}:measured_LRA={d['input_lra']}:measured_thresh={d['input_thresh']}:offset={d['target_offset']}\")")
ffmpeg -y -v error -i video_only.mp4 -i mix_raw.wav -map 0:v -map 1:a -c:v copy \
  -af "loudnorm=I=-16:TP=-1.5:LRA=11:$LN:linear=true,aresample=48000" -c:a aac -b:a 192k -shortest -movflags +faststart \
  ../The_Life_of_Richard_Scolyer.mp4
echo "done: ../The_Life_of_Richard_Scolyer.mp4"
