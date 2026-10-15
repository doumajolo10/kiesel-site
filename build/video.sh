#!/bin/sh
# Vídeo aéreo da capa (drone DJI 4K, 100 Mbps, enviado pela Kiesel em video/DJI_0524.MP4, fora do git).
# Trecho: volta em torno da igreja matriz, 70 s a 94 s do original. Loop sem emenda: o último segundo
# se funde (crossfade) no primeiro, então o fim encaixa no começo.
# Saída em assets/video/: AV1 (navegadores novos) + H.264 (Safari antigo e o resto), tamanho grande e de celular,
# e o quadro inicial em WEBP (aparece antes do vídeo e para quem economiza dados).
# Uso: sh build/video.sh
set -e
cd "$(dirname "$0")/.."
SRC=video/DJI_0524.MP4
OUT=assets/video
TMP=pesquisa/video
mkdir -p "$OUT" "$TMP"
INI=70; DUR=24; XF=1

# 1) matriz 2560x1440 quase sem perda (CRF 8), já com o loop fundido; vira a referência para medir a qualidade
if [ ! -s "$TMP/matriz.mkv" ]; then
# corpo = INI+XF até INI+DUR; ponte = INI até INI+XF (o trecho logo antes do corpo). O fim do corpo se funde na ponte,
# e a ponte termina exatamente onde o corpo começa: no loop, não há salto.
ffmpeg -hide_banner -loglevel error -y \
  -ss $((INI+XF)) -t $((DUR-XF)) -i "$SRC" -ss $INI -t $XF -i "$SRC" -filter_complex "\
[0:v]scale=2560:1440:flags=lanczos,setsar=1,format=yuv420p,fps=25,setpts=PTS-STARTPTS[corpo];\
[1:v]scale=2560:1440:flags=lanczos,setsar=1,format=yuv420p,fps=25,setpts=PTS-STARTPTS[ponte];\
[corpo][ponte]xfade=transition=fade:duration=$XF:offset=$((DUR-XF-XF))[v]" \
  -map "[v]" -an -c:v libx264 -preset slow -crf 8 -pix_fmt yuv420p "$TMP/matriz.mkv"
fi

COR="-color_primaries bt709 -color_trc bt709 -colorspace bt709"
# 2) grande (computador): AV1 1440p; HEVC 1080p para Mac/Safari. CRFs escolhidos por VMAF (~95, sem diferença visível): build/video-vmaf*.sh
ffmpeg -hide_banner -loglevel error -y -i "$TMP/matriz.mkv" -an -c:v libsvtav1 -preset 4 -crf 42 -g 75 -pix_fmt yuv420p $COR -movflags +faststart "$OUT/heroi-1440.av1.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$TMP/matriz.mkv" -an -vf scale=1920:1080:flags=lanczos -c:v libx265 -preset slow -crf 28 -x265-params log-level=error:keyint=75 -tag:v hvc1 -pix_fmt yuv420p $COR -movflags +faststart "$OUT/heroi-1080.hevc.mp4"
# 3) celular: AV1 e HEVC 720p; H.264 720p para navegador antigo
ffmpeg -hide_banner -loglevel error -y -i "$TMP/matriz.mkv" -an -vf scale=1280:720:flags=lanczos -c:v libsvtav1 -preset 4 -crf 42 -g 75 -pix_fmt yuv420p $COR -movflags +faststart "$OUT/heroi-720.av1.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$TMP/matriz.mkv" -an -vf scale=1280:720:flags=lanczos -c:v libx265 -preset slow -crf 29 -x265-params log-level=error:keyint=75 -tag:v hvc1 -pix_fmt yuv420p $COR -movflags +faststart "$OUT/heroi-720.hevc.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$TMP/matriz.mkv" -an -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slower -crf 27 -profile:v high -level 4.0 -g 75 -pix_fmt yuv420p $COR -movflags +faststart "$OUT/heroi-720.h264.mp4"
# 4) quadro inicial
ffmpeg -hide_banner -loglevel error -y -i "$TMP/matriz.mkv" -frames:v 1 -vf scale=1920:1080:flags=lanczos -c:v libwebp -quality 82 "$OUT/heroi-poster.webp"
ffmpeg -hide_banner -loglevel error -y -i "$TMP/matriz.mkv" -frames:v 1 -vf scale=960:540:flags=lanczos -c:v libwebp -quality 78 "$OUT/heroi-poster-p.webp"
ls -la "$OUT"
