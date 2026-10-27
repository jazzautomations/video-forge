"""Resolve installed source components and copy their local dependency graph."""
import re
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]

def resolve(identifier):
    # onda: registry/components/<slug>/<Comp>.tsx + schema.ts (Zod-parsed props).
    # rendercomp: src/components/<slug>/<Comp>.tsx with `export const default<Comp>Props`.
    # curvable: src/components/<slug>.tsx (single file) with `export const <Comp>Defaults`.
    if not isinstance(identifier,str) or not re.fullmatch(r'(onda|rendercomp|curvable)/[a-z0-9-]+',identifier):
        raise ValueError('component: choose an actual onda/, rendercomp/ or curvable/ slug from catalog.py')
    family,slug=identifier.split('/')
    base=ROOT/'library/vendor'/family
    if family=='curvable':
        source=base/'src/components'/f'{slug}.tsx'
        if not source.is_file():raise ValueError(f'Unknown component: {identifier}')
    else:
        folder=base/('registry/components' if family=='onda' else 'src/components')/slug
        files=sorted(folder.glob('*.tsx'))
        if len(files)!=1:raise ValueError(f'Unknown or ambiguous component: {identifier}')
        source=files[0]
    text=source.read_text()
    name=re.search(r'export const (\w+):\s*(?:React\.)?FC',text)
    if not name:raise ValueError(f'No public React component in {identifier}')
    if family=='onda':
        schema=re.search(r'export const (\w+Schema)\s*=',(source.parent/'schema.ts').read_text())
        if not schema:raise ValueError(f'Missing schema for {identifier}')
        return base,source,name[1],schema[1],True
    pat=r'export const (default\w+Props)\b' if family=='rendercomp' else r'export const (\w+Defaults)\b'
    defaults=re.search(pat,text)
    if not defaults:raise ValueError(f'Missing default props for {identifier}')
    return base,source,name[1],defaults[1],False

def copy_graph(base,source,target):
    pending=[source];seen=set();externals=set()
    while pending:
        p=pending.pop().resolve()
        if p in seen:continue
        if not p.is_relative_to(base.resolve()):raise ValueError(f'Import escapes vendor root: {p}')
        seen.add(p);dest=target/p.relative_to(base);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
        if p.suffix not in {'.ts','.tsx','.js','.jsx'}:continue
        text=re.sub(r'/\*.*?\*/','',p.read_text(),flags=re.S)
        text=re.sub(r'^\s*//.*$','',text,flags=re.M)
        imports=re.findall(r'(?:from\s+|import\s*)[\'"]([^\'"]+)[\'"]',text)
        for item in imports:
            if not item.startswith('.'):
                externals.add('/'.join(item.split('/')[:2]) if item.startswith('@') else item.split('/')[0]);continue
            rel=p.parent/item
            candidates=[rel,Path(str(rel)+'.ts'),Path(str(rel)+'.tsx'),rel/'index.ts',rel/'index.tsx']
            found=next((x for x in candidates if x.is_file()),None)
            if found is None:raise ValueError(f'Unresolved local import {item} in {p.name}')
            pending.append(found)
    shutil.copy2(base/'LICENSE',target/'LICENSE')
    return externals
