#!/usr/bin/env python3
"""Ekstrak soal checkpoint dari src/data/lessons.ts → JSON (untuk seed DB)."""
import json, re, sys

src = open('src/data/lessons.ts').read()

# Cari blok checkpoint: "id": "X-checkpoint-N", ..., "questions": [...]
# Ambil dari "id" sampai kurung tutup objek yang seimbang
results = []
pattern = re.compile(r'"id"\s*:\s*"([a-z0-9-]+-checkpoint-\d+)"')
for m in pattern.finditer(src):
    cid = m.group(1)
    # cari requiredScore setelah id
    score_m = re.search(r'"requiredScore"\s*:\s*([0-9.]+)', src[m.end():m.end()+2000])
    if not score_m:
        continue
    req = float(score_m.group(1))
    # cari "questions": [ ... ] — mulai dari posisi requiredScore
    qstart = src.find('"questions"', m.end())
    if qstart == -1 or qstart > m.end() + 4000:
        continue
    arr_start = src.find('[', qstart)
    # balance brackets
    depth = 0
    i = arr_start
    in_str = False
    while i < len(src):
        c = src[i]
        if in_str:
            if c == '\\':
                i += 2
                continue
            if c == '"':
                in_str = False
        else:
            if c == '"':
                in_str = True
            elif c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    break
        i += 1
    raw = src[arr_start:i+1]
    try:
        qs = json.loads(raw)
    except Exception as e:
        print(f'WARN {cid}: JSON parse fail {e}', file=sys.stderr)
        continue
    results.append({'checkpoint_id': cid, 'required_score': req, 'questions': qs})

print(json.dumps(results, indent=1))
print(f'// TOTAL: {len(results)} checkpoints', file=sys.stderr)
