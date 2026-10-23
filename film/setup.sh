#!/bin/bash
# Fetch the third-party assets and tools needed to rebuild the film (Ubuntu).
set -e
cd "$(dirname "$0")"
sudo apt-get install -y ffmpeg fluidsynth fluid-soundfont-gm espeak-ng imagemagick
pip install kokoro-onnx soundfile mido playwright numpy
mkdir -p assets/fonts assets/geo assets/models
GF=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -sSL -o assets/fonts/Caprasimo-Regular.ttf "$GF/caprasimo/Caprasimo-Regular.ttf"
curl -sSL -o assets/fonts/OpenSans.ttf "$GF/opensans/OpenSans%5Bwdth,wght%5D.ttf"
curl -sSL -o assets/fonts/Caveat.ttf "$GF/caveat/Caveat%5Bwght%5D.ttf"
curl -sSL -o assets/fonts/Nunito.ttf "$GF/nunito/Nunito%5Bwght%5D.ttf"
NE=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
curl -sSL -o assets/geo/ne_110m_admin_0_countries.geojson "$NE/ne_110m_admin_0_countries.geojson"
curl -sSL -o assets/geo/ne_50m_admin_0_countries.geojson "$NE/ne_50m_admin_0_countries.geojson"
KO=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
curl -sSL -o assets/models/kokoro-v1.0.onnx "$KO/kokoro-v1.0.onnx"
curl -sSL -o assets/models/voices-v1.0.bin "$KO/voices-v1.0.bin"
