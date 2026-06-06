# Script to fix analytics
# Replaces r.by_date.map with (r.by_date || []).map

import re
import sys

path = "src/app/pages/admin/AdminAnalytics.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old = "r.by_date.map((d)"
new = "(r.by_date || []).map((d)"
count = content.count(old)
content = content.replace(old, new)


with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Replaced {count} occurrences")
