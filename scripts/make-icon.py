#!/usr/bin/env python3
"""Make the Apps-menu icon from the Firefox logo shipped inside the built image.

The logo is Mozilla's trademark, so it is extracted at build time rather than committed.
Output: dist/icon.png (300x300, glyph placed like the stock CrossmixOS app icons).
"""
import io
import subprocess
import sys
import zipfile
from pathlib import Path

from PIL import Image

IMAGE = "trimui-firefox-rootfs"
LOGO = "chrome/browser/content/branding/about-logo@2x.png"
root = Path(__file__).resolve().parent.parent
out = root / "dist" / "icon.png"

omni = subprocess.run(
    ["docker", "run", "--rm", "--platform", "linux/arm64", IMAGE,
     "cat", "/usr/lib/firefox-esr/browser/omni.ja"],
    check=True, capture_output=True).stdout
logo = Image.open(io.BytesIO(zipfile.ZipFile(io.BytesIO(omni)).read(LOGO))).convert("RGBA")

size = 150
logo = logo.resize((size, size), Image.LANCZOS)
icon = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
icon.alpha_composite(logo, (150 - size // 2, 108 - size // 2))
out.parent.mkdir(exist_ok=True)
icon.save(out)
print(out.relative_to(root), file=sys.stderr)
