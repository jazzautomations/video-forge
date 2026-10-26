# WoHackers — prova de produção

O arquivo de entrega é `out/video-forge-wohackers.mp4`: 1920×1080, 30 fps, 23,5 segundos.
O relatório de validação fica em `out/QA.md`, com contato visual e probe do arquivo real.

A demo combina:

- abertura HTML/GSAP renderizada pelo HyperFrames;
- gravação Playwright de uma página local com dados fictícios;
- zoom/pan, cursor, clique e máscara opaca em coordenadas da fonte;
- personagem SVG reutilizado do RenderComp (MIT, licença no pacote da skill);
- malha Three.js com material, iluminação e rotação calculada por frame;
- narração local Kokoro pf_dora em português;
- legendas por palavra com tempos de ASR, corrigidos pelo roteiro e remontados;
- trilha/acentos sonoros escritos em Python e montagem FFmpeg com ducking.

## Reproduzir

Instale Node 22+, FFmpeg/ffprobe e Chrome compatível. Neste diretório execute
`npm ci --ignore-scripts` e `npm run check`. O runtime Remotion está fixado em 4.0.538.
O backend gráfico que funcionou nesta máquina foi ANGLE; SwiftShader direto falhou
na criação de WebGL2. Use `--browser-executable=...` se o Chrome não for descoberto.

A abertura vem de `../../library/hyperframes/editorial/`: nesse projeto faça `npm ci
--ignore-scripts`, depois `npm run render`, e copie `renders/intro.mp4` para `public/`.
`public/screen.mp4`, `public/narration-timed.wav` e `public/bed.wav` são os inputs locais
já incluídos, com dados/roteiro de demonstração. Os fontes da página e as ações de
captura estão em `public/demo.html` e `actions.json`.

```bash
npm run render -- --gl=angle --concurrency=1
# O comando acima escreve out/forge.mp4 (imagem). Para a versão com som:
ffmpeg -i out/forge.mp4 -i public/narration-timed.wav -i public/bed.wav \
  -filter_complex '[1:a]asplit=2[v][s];[2:a][s]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=300[b];[v][b]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=7[a]' \
  -map 0:v:0 -map '[a]' -c:v copy -c:a aac -ar 48000 -b:a 192k -t 23.5 -movflags +faststart out/final.mp4
python3 ../../scripts/verify_video.py out/final.mp4 --duration 23.5 --width 1920 --height 1080 --fps 30 --require-audio
```

A captura usa contexto novo e não acessa contas reais. O arquivo bruto começa com um
frame de navegação em branco: o input público foi aparado em 0,6s antes da montagem.
Para nova gravação instale Playwright e execute `../../scripts/record-browser.mjs`.
O script salva WebM + eventos; alinhe o começo antes de posicionar o cursor reconstruído.

Para nova voz, use HyperFrames TTS ou um Kokoro local com `kokoro-onnx` e `soundfile`.
Para ASR o teste usou faster-whisper 1.2.1 com PyAV 16.1.0; a versão 19 quebrou o
argumento metadata_errors. O modelo Whisper base já estava em cache; não está no ZIP.
Narração e legendas não devem ser consideradas corretas só porque um comando passou:
ASR errou a marca e palavras em português, que foram corrigidas usando o roteiro.

A demo é prova técnica integrada e material editável. Não representa teste de todos
os componentes do catálogo, de Blender ou paridade entre modelos.
