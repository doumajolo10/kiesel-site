#!/bin/sh
# Mede tamanho x qualidade (VMAF, 0-100; acima de ~93 a diferença não é visível) para escolher o CRF de cada versão.
# Uso: sh build/video-vmaf.sh   (precisa de pesquisa/video/matriz.mkv, gerada por build/video.sh)
cd "$(dirname "$0")/.."
T=pesquisa/video
M=$T/matriz.mkv
mede() { # arquivo largura altura
  v=$(ffmpeg -hide_banner -i "$1" -i "$M" -filter_complex "[1:v]scale=$2:$3:flags=lanczos[r];[0:v][r]libvmaf=n_subsample=5:n_threads=16" -f null - 2>&1 | grep -o "VMAF score: [0-9.]*" | grep -o "[0-9.]*$")
  echo "$(basename "$1") $(( $(stat -c %s "$1") / 1024 )) KB  VMAF $v"
}
for c in 36 40 44; do
  ffmpeg -hide_banner -loglevel error -y -i "$M" -an -c:v libsvtav1 -preset 5 -crf $c -g 75 -pix_fmt yuv420p "$T/t-av1-1440-$c.mp4"
  mede "$T/t-av1-1440-$c.mp4" 2560 1440
done
for c in 24 27; do
  ffmpeg -hide_banner -loglevel error -y -i "$M" -an -vf scale=1920:1080:flags=lanczos -c:v libx264 -preset slower -crf $c -g 75 -pix_fmt yuv420p "$T/t-264-1080-$c.mp4"
  mede "$T/t-264-1080-$c.mp4" 1920 1080
done
for c in 38 42; do
  ffmpeg -hide_banner -loglevel error -y -i "$M" -an -vf scale=1280:720:flags=lanczos -c:v libsvtav1 -preset 5 -crf $c -g 75 -pix_fmt yuv420p "$T/t-av1-720-$c.mp4"
  mede "$T/t-av1-720-$c.mp4" 1280 720
done
for c in 26 28; do
  ffmpeg -hide_banner -loglevel error -y -i "$M" -an -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slower -crf $c -g 75 -pix_fmt yuv420p "$T/t-264-720-$c.mp4"
  mede "$T/t-264-720-$c.mp4" 1280 720
done
mede assets/video/heroi-1440.av1.mp4 2560 1440
