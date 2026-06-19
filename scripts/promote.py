#!/usr/bin/env python
"""Promote cleaned copies to the real filenames.

For each pair (original, `<stem>1`): move the watermarked original into
`_watermarked_backup/<relpath>` (safety / reversible), then move the clean copy
onto the original name. Result: every element image is the clean version under
its original filename; no `…1` copies remain; the watermarked versions are kept
in the backup folder.
"""
import glob, os, shutil

ROOT = "public/images/elements"
BK = "_watermarked_backup"


def copy_of(p):
    s, e = os.path.splitext(p)
    return s + "1" + e


def is_copy(p):
    d = os.path.dirname(p)
    s, e = os.path.splitext(os.path.basename(p))
    return s.endswith("1") and os.path.exists(os.path.join(d, s[:-1] + e))


origs = []
for f in glob.glob(os.path.join(ROOT, "**", "*.jpg"), recursive=True):
    f = f.replace("\\", "/")
    if is_copy(f):
        continue
    origs.append(f)

promoted, missing = 0, 0
for f in sorted(origs):
    cp = copy_of(f)
    if not os.path.exists(cp):
        missing += 1
        print("  no copy for", f)
        continue
    rel = os.path.relpath(f, ROOT)
    bdest = os.path.join(BK, rel)
    os.makedirs(os.path.dirname(bdest), exist_ok=True)
    shutil.move(f, bdest)   # watermarked original -> backup
    shutil.move(cp, f)      # clean copy -> original filename
    promoted += 1

print(f"promoted {promoted}, missing-copy {missing}")
