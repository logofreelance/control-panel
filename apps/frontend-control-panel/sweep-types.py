import os
import re

directory = 'src'

replacements = [
    (r'variant=[\'"]success[\'"]', 'variant="secondary"'),
    (r'variant=[\'"]warning[\'"]', 'variant="secondary"'),
    (r'variant=[\'"]md[\'"]', 'size="default"'),
    (r'variant=[\'"]icon-md[\'"]', 'size="icon"'),
    (r'size=[\'"]icon-md[\'"]', 'size="icon"'),
    (r'size=[\'"]md[\'"]', 'size="default"'),
    (r'<Card[^>]*variant=[\'"](surface|default|ghost)[\'"]', lambda m: m.group(0).replace(f'variant=\"{m.group(1)}\"', '')),
    (r'<Input[^>]*variant=[\'"][a-z]*[\'"]', lambda m: re.sub(r'variant=[\'"][a-z]*[\'"]', '', m.group(0))),
    (r'<Avatar[^>]*variant=[\'"][a-z]*[\'"]', lambda m: re.sub(r'variant=[\'"][a-z]*[\'"]', '', m.group(0))),
    (r'<DropdownMenuContent[^>]*variant=[\'"][a-z]*[\'"]', lambda m: re.sub(r'variant=[\'"][a-z]*[\'"]', '', m.group(0))),
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
                if callable(new):
                    new_content = re.sub(old, new, new_content)
                else:
                    new_content = re.sub(old, new, new_content)

            # Fix ConfirmDialog variants: ConfirmDialog expects dangerously specific ones
            new_content = re.sub(r'(<ConfirmDialog[^>]*?)variant=[\'"]destructive[\'"]', r'\1variant="danger"', new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed_count += 1

print(f"Finished sweeping typings in {changed_count} files.")
