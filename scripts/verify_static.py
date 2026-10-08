from pathlib import Path
import re
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
html = (root / "dist" / "index.html").read_text(encoding="utf-8")
refs = re.findall(r'(?:src|href)="([^"#][^"]*)"', html)
local_refs = [
    value.split("?", 1)[0]
    for value in refs
    if not re.match(r"^(?:https?:|mailto:|tel:|data:)", value)
]
missing = [value for value in local_refs if not (root / "dist" / value).exists()]

assert not missing, f"Missing local assets: {missing}"
assert html.count("<h1") == 1, "The page must contain exactly one h1"
assert "orphelinarbre@gmail.com" in html, "Contact email missing"
assert "+229 01 97 46 12 66" in html, "Primary contact number missing"
sitemap = root / "dist" / "sitemap.xml"
if sitemap.exists():
    ET.parse(sitemap)

print(
    {
        "html_bytes": len(html.encode("utf-8")),
        "local_refs": len(local_refs),
        "missing": missing,
        "h1_count": html.count("<h1"),
        "sitemap": "valid" if sitemap.exists() else "not configured",
    }
)
