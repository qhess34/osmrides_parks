#!/usr/bin/env python3
"""Injecte dans <dossier>/sw.js la liste des fichiers à mettre hors ligne et la version (empreinte du contenu).
Usage : python3 tools/make_sw.py _site   (appelé par .github/workflows/pages.yml)"""
import sys, os, json, hashlib
root = sys.argv[1]
files = []
for d, _, fs in os.walk(root):
    for f in fs:
        p = os.path.relpath(os.path.join(d, f), root).replace(os.sep, '/')
        if p in ('sw.js', '.nojekyll') or f.startswith('.'):
            continue
        files.append(p)
files.sort()
h = hashlib.sha1()
for p in files:
    h.update(p.encode()); h.update(open(os.path.join(root, p), 'rb').read())
ver = h.hexdigest()[:12]
sw = os.path.join(root, 'sw.js')
s = open(sw, encoding='utf-8').read()
s = s.replace("/*SW_VERSION*/'dev'", "/*SW_VERSION*/" + json.dumps(ver))
s = s.replace("/*SW_FILES*/[]", "/*SW_FILES*/" + json.dumps(['./'] + files, ensure_ascii=False))
open(sw, 'w', encoding='utf-8').write(s)
print(len(files), 'fichiers, version', ver)
