"""홈 화면 아이콘 4종 (192·512·maskable 512·apple-touch 180) 생성 — 아가 셋 얼굴 + 바베큐 불꽃.
사용: python tools/make_icons.py [출력 폴더, 기본: 저장소 루트]
필요: pip install pillow
"""
import os
import sys
from PIL import Image, ImageDraw

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
S = 2048  # 크게 그린 뒤 줄여서 계단 현상 없애기
BG = (31, 58, 46)
SKIN = (245, 204, 164)
EYE = (34, 40, 31)
HATS = [(224, 97, 43), (44, 109, 181), (47, 138, 78)]   # 가족 색 (용준네·우진네·도현네)


def baby(d, cx, cy, r, hat):
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=SKIN)
    # 모자(반원) + 꼭지
    d.pieslice([cx - r, cy - r - r * 0.1, cx + r, cy + r - r * 0.1], 180, 360, fill=hat)
    d.rectangle([cx - r, cy - r * 0.1 - r * 0.02, cx + r, cy - r * 0.1 + r * 0.14], fill=hat)
    pr = r * 0.22
    d.ellipse([cx - pr, cy - r * 1.08 - pr, cx + pr, cy - r * 1.08 + pr], fill=hat)
    er = r * 0.12
    for dx in (-0.36, 0.36):
        ex = cx + dx * r; ey = cy + r * 0.25
        d.ellipse([ex - er, ey - er, ex + er, ey + er], fill=EYE)
    d.arc([cx - r * 0.26, cy + r * 0.28, cx + r * 0.26, cy + r * 0.64], 20, 160, fill=EYE, width=int(r * 0.07))
    for dx in (-0.62, 0.62):  # 볼터치
        bx = cx + dx * r; by = cy + r * 0.5
        d.ellipse([bx - r * 0.14, by - r * 0.08, bx + r * 0.14, by + r * 0.08], fill=(242, 156, 156))


def flame(d, cx, cy, s):
    d.polygon([(cx, cy - s * 1.2), (cx + s * 0.62, cy - s * 0.1), (cx + s * 0.42, cy + s * 0.5), (cx - s * 0.42, cy + s * 0.5), (cx - s * 0.62, cy - s * 0.1)], fill=(242, 182, 48))
    d.ellipse([cx - s * 0.62, cy - s * 0.45, cx + s * 0.62, cy + s * 0.55], fill=(242, 182, 48))
    d.ellipse([cx - s * 0.32, cy - s * 0.05, cx + s * 0.32, cy + s * 0.5], fill=(224, 97, 43))


def make(size, pad, name):
    """pad = 가장자리 여백 비율. maskable 은 안드로이드가 원·물방울로 잘라도 얼굴이 남게 크게(0.3)."""
    im = Image.new('RGB', (S, S), BG)
    d = ImageDraw.Draw(im)
    cx, cy, sc = S / 2, S / 2, 1 - pad
    r = S * 0.15 * sc
    # 그릴 받침
    d.rounded_rectangle([cx - S * 0.36 * sc, cy + S * 0.2 * sc, cx + S * 0.36 * sc, cy + S * 0.27 * sc], radius=int(S * 0.03 * sc), fill=(44, 80, 64))
    flame(d, cx, cy + S * 0.06 * sc, S * 0.11 * sc)
    baby(d, cx - S * 0.25 * sc, cy + S * 0.02 * sc, r * 0.9, HATS[0])
    baby(d, cx + S * 0.25 * sc, cy + S * 0.02 * sc, r * 0.9, HATS[1])
    baby(d, cx, cy - S * 0.2 * sc, r, HATS[2])
    im.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name))


make(192, 0.1, 'icon-192.png')
make(512, 0.1, 'icon-512.png')
make(512, 0.3, 'icon-maskable-512.png')
make(180, 0.12, 'apple-touch-icon.png')
print('icons ->', os.path.abspath(OUT))
