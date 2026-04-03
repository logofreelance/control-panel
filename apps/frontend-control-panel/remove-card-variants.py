import os
import re

directory = 'src'

replacements = [
    (r'\bvariant=[\'"](default|surface|ghost|premium)[\'"]', ''),
    (r'\bsize=[\'"](sm|md|lg)[\'"]', '')
]

changed_count = 0

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            # Only target <Card... > or <Badge... > optionally? No, Card only.
            # It's safer to only strip variant/size inside <Card.
            card_pattern = re.compile(r'(<Card\b[^>]*>)')
            
            def replace_card(match):
                tag = match.group(0)
                for old, new in replacements:
                    tag = re.sub(old, new, tag)
                return tag
            
            new_content = card_pattern.sub(replace_card, new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_count += 1

print(f"Finished updating Card variants in {changed_count} files.")
