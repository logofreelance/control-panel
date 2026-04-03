import os
import re

directory = 'src'

replacements = [
    (r'variant=[\'"]primary[\'"]', 'variant="default"'),
    (r'variant=[\'"]premium[\'"]', 'variant="default"'),
    (r'variant=[\'"]danger[\'"]', 'variant="destructive"'),
    (r'variant=[\'"]slate[\'"]', 'variant="outline"'),
    (r'variant=[\'"]brand[\'"]', 'variant="default"'),
    (r'variant=[\'"]stat[\'"]', 'variant="secondary"')
]

changed_count = 0

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            for old, new in replacements:
                new_content = re.sub(old, new, new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_count += 1

print(f"Finished updating variants in {changed_count} files.")
