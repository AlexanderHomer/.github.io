#!/usr/bin/env python3
import os
import json

# Collect all markdown files and map to expected HTML output paths.
# Exclude repository-only documentation files.
SKIP_FILES = {"README.md", "search.md"}

def collect_pages(root="."):
    pages = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip hidden and Jekyll-specific directories
        dirnames[:] = [d for d in dirnames if not d.startswith(('.', '_'))]
        for filename in filenames:
            if not filename.endswith('.md') or filename in SKIP_FILES:
                continue
            rel_md = os.path.relpath(os.path.join(dirpath, filename), root)
            html_path = os.path.splitext(rel_md)[0] + '.html'
            pages.append(html_path.replace(os.sep, '/'))
    return sorted(pages)

def main():
    pages = collect_pages()
    with open('pages.json', 'w') as f:
        json.dump(pages, f, indent=2)

if __name__ == '__main__':
    main()
