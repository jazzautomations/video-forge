#!/usr/bin/env python3
"""Find bundled implementations or upstream registry entries without loading their sources."""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ALIASES = {
    'personagem': 'character wave hello jumping', 'personagens': 'character wave hello jumping',
    'legenda': 'caption captions text', 'legendas': 'caption captions text',
    'censura': 'redact blur', 'censurar': 'redact blur', 'narracao': 'tts audio',
    'tela': 'screen browser cursor', 'gravar': 'record capture screen',
    'grafico': 'chart graph count', '3d': '3d camera scene blender',
}

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('query', nargs='?', default='')
    ap.add_argument('--engine', choices=['remotion', 'hyperframes', 'ffmpeg', 'blender', 'capture', 'audio'])
    ap.add_argument('--local', action='store_true', help='Only source bundled with this skill')
    ap.add_argument('--limit', type=int, default=12)
    args = ap.parse_args()
    tokens = re.findall(r'[\w]+', args.query.lower())
    expanded = set(tokens)
    for token in tokens:
        expanded.update(ALIASES.get(token, '').split())
    rows = json.loads((ROOT / 'library/catalog.json').read_text())['items']
    matches = []
    for row in rows:
        if args.engine and row['engine'] != args.engine:
            continue
        if args.local and row.get('upstream'):
            continue
        hay = ' '.join([row['id'], row.get('kind', ''), *row.get('tags', [])]).lower()
        score = sum(5 if token in tokens else 1 for token in expanded if token in hay)
        if tokens and not score:
            continue
        matches.append((score, not row.get('upstream', False), row))
    matches.sort(key=lambda x: (-x[0], -x[1], x[2]['id']))
    print(json.dumps({'query': args.query, 'total': len(matches), 'results': [x[2] for x in matches[:max(0, args.limit)]]}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
