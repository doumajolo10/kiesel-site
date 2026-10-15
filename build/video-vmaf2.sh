#!/bin/sh
# Teste do HEVC (iPhone/Safari) com VMAF. Uso: sh build/video-vmaf2.sh
cd "$(dirname "$0")/.."
T=pesquisa/video
M=$T/matriz.mkv
mede() { v=$(ffmpeg -hide_banner -i "$1" -i "$M" -filter_complex "[1:v]scale=$2:$3:flags=lanczos[r];[0:v][r]libvmaf=n_subsample=5:n_threads=16" -f null - 2>&1 | grep -o "VMAF score: [0-9.]*" | grep -o "[0-9.]*$"); echo "$(basename "$1") $(( $(stat -c %s "$1") / 1024 )) KB  VMAF $v"; }
for c in 25 28; do
  ffmpeg -hide_banner -loglevel error -y -i "$M" -an -vf scale=1920:1080:flags=lanczos -c:v libx265 -preset slow -crf $c -x265-params log-level=error:keyint=75 -tag:v hvc1 -pix_fmt yuv420p "$T/t-265-1080-$c.mp4"
  mede "$T/t-265-1080-$c.mp4" 1920 1080
done
for c in 27 30; do
  ffmpeg -hide_banner -loglevel error -y -i "$M" -an -vf scale=1280:720:flags=lanczos -c:v libx265 -preset slow -crf $c -x265-params log-level=error:keyint=75 -tag:v hvc1 -pix_fmt yuv420p "$T/t-265-720-$c.mp4"
  mede "$T/t-265-720-$c.mp4" 1280 720
done
