import re

filepath = 'src/features-internal/feature-dashboard-main/components/MainDashboardView.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Container -> div
content = re.sub(r'<Container([^>]*)>', r'<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">', content)
content = content.replace('</Container>', '</div>')

# Section -> section
content = re.sub(r'<Section([^>]*)>', r'<section\1>', content)
content = content.replace('</Section>', '</section>')

# Grid -> div
content = re.sub(r'<Grid([^>]*)>', r'<div className="grid"\1>', content)
content = content.replace('</Grid>', '</div>')

# Stack -> div
def replace_stack(m):
    props = m.group(1)
    classes = 'flex'
    
    if 'direction="row"' in props or "direction={'row'}" in props or 'direction=\'row\'' in props:
        classes += ' flex-row'
    else:
        classes += ' flex-col'
        
    if 'align="center"' in props: classes += ' items-center'
    if 'justify="center"' in props: classes += ' justify-center'
    if 'justify="between"' in props: classes += ' justify-between'
    
    gap_m = re.search(r'gap={(\d+)}', props)
    if gap_m:
        classes += f" gap-{gap_m.group(1)}"
        
    cls_m = re.search(r'className="([^"]+)"', props)
    if cls_m:
        classes += f" {cls_m.group(1)}"
        
    # Strip the captured className, gap, align, justify explicitly
    props_cleaned = re.sub(r'className="[^"]*"', '', props)
    props_cleaned = re.sub(r'gap={\d+}', '', props_cleaned)
    props_cleaned = re.sub(r'align="[^"]*"', '', props_cleaned)
    props_cleaned = re.sub(r'justify="[^"]*"', '', props_cleaned)
    props_cleaned = re.sub(r'direction="[^"]*"', '', props_cleaned)
        
    return f'<div className="{classes.strip()}"{props_cleaned}>'

content = re.sub(r'<Stack([^>]*)>', replace_stack, content)
content = content.replace('</Stack>', '</div>')

# Heading
# We can match `<Heading> contents </Heading>` using regex across lines?
# React code is tricky. Let's just use `div` for Heading and add standard classes.
# But `level` is important.
def replace_heading(m):
    props = m.group(1)
    content_inside = m.group(2)
    level_m = re.search(r'level={(\d)}', props)
    lvl = level_m.group(1) if level_m else "2"
    
    props_cleaned = re.sub(r'level={\d}', '', props)
    return f'<h{lvl}{props_cleaned}>{content_inside}</h{lvl}>'

content = re.sub(r'<Heading([^>]*)>((?:(?!</Heading>).)*?)</Heading>', replace_heading, content, flags=re.DOTALL)


# Text -> p
content = re.sub(r'<Text([^>]*)\/>', r'<p\1></p>', content)
content = re.sub(r'<Text([^>]*)>', r'<p\1>', content)
content = content.replace('</Text>', '</p>')
# Also remove import
for comp in ['Container', 'Section', 'Grid', 'Stack', 'Heading', 'Text']:
    content = re.sub(rf'\b{comp},\s*', '', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("MainDashboardView refactored.")
