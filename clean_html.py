import sys
import re
import pathlib
import subprocess

substitutions = [
    (re.compile(r'<p[^>]*>', re.I), ''),
    (re.compile(r'</p>', re.I), '\n'),
    (re.compile(r'<ul[^>]*>', re.I), ''),
    (re.compile(r'</ul>', re.I), ''),
    (re.compile(r'<ol[^>]*>', re.I), ''),
    (re.compile(r'</ol>', re.I), ''),
    (re.compile(r'<li[^>]*>', re.I), '- '),
    (re.compile(r'</li>', re.I), ''),
    (re.compile(r'<strong>', re.I), '**'),
    (re.compile(r'</strong>', re.I), '**'),
    (re.compile(r'<em>', re.I), '*'),
    (re.compile(r'</em>', re.I), '*'),
    (re.compile(r'<b[^>]*>', re.I), '**'),
    (re.compile(r'</b>', re.I), '**'),
    (re.compile(r'<i[^>]*>', re.I), '*'),
    (re.compile(r'</i>', re.I), '*'),
    (re.compile(r'<br\s*/?>', re.I), '  \n'),
    (re.compile(r'<hr\s*/?>', re.I), '\n---\n'),
    (re.compile(r'<sub>', re.I), '_'),
    (re.compile(r'</sub>', re.I), '_'),
    (re.compile(r'<sup>', re.I), '^'),
    (re.compile(r'</sup>', re.I), '^'),
    (re.compile(r'<u>', re.I), ''),
    (re.compile(r'</u>', re.I), ''),
    (re.compile(r'<table[^>]*>', re.I), ''),
    (re.compile(r'</table>', re.I), ''),
    (re.compile(r'<thead[^>]*>', re.I), ''),
    (re.compile(r'</thead>', re.I), ''),
    (re.compile(r'<tbody[^>]*>', re.I), ''),
    (re.compile(r'</tbody>', re.I), ''),
    (re.compile(r'<tr[^>]*>', re.I), ''),
    (re.compile(r'</tr>', re.I), ''),
    (re.compile(r'<th[^>]*>', re.I), ''),
    (re.compile(r'</th>', re.I), ' | '),
    (re.compile(r'<td[^>]*>', re.I), ''),
    (re.compile(r'</td>', re.I), ' | '),
    (re.compile(r'<span[^>]*>', re.I), ''),
    (re.compile(r'</span>', re.I), ''),
    (re.compile(r'<div[^>]*>', re.I), ''),
    (re.compile(r'</div>', re.I), ''),
    (re.compile(r'<a name="[^"]*">', re.I), ''),
]

for i in range(6,0,-1):
    substitutions.append((re.compile(fr'<h{i}[^>]*>', re.I), '#' * i + ' '))
    substitutions.append((re.compile(fr'</h{i}>', re.I), '\n'))

link_pattern = re.compile(r'<a href="([^"]*)"[^>]*>(.*?)</a>', re.I | re.S)
img_pattern = re.compile(r'<img[^>]*src="([^"]+)"[^>]*?(?:alt="([^"]*)")?[^>]*>', re.I | re.S)
comment_pattern = re.compile(r'<!--.*?-->', re.S)

def clean_text(text):
    text = comment_pattern.sub('', text)
    text = link_pattern.sub(lambda m: f'[{m.group(2).strip()}]({m.group(1)})', text)
    text = img_pattern.sub(lambda m: f'![{(m.group(2) or '').strip()}]({m.group(1)})', text)
    for pat, repl in substitutions:
        text = pat.sub(repl, text)
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'\{[^}]*style[^}]*\}', '', text)
    return text

def process_file(path):
    data = path.read_text(encoding='utf-8')
    front = ''
    body = data
    if data.startswith('---'):
        parts = data.split('---', 2)
        if len(parts) >= 3:
            front = '---' + parts[1] + '---\n'
            body = parts[2].lstrip('\n')
    cleaned = clean_text(body)
    path.write_text(front + cleaned, encoding='utf-8')

def main():
    args = sys.argv[1:]
    if args:
        paths = [pathlib.Path(p) for p in args]
    else:
        repo_root = pathlib.Path(__file__).resolve().parent
        result = subprocess.check_output(['git', 'ls-files', '*.md'], text=True)
        paths = [repo_root / p for p in result.strip().splitlines() if p]
    for path in paths:
        process_file(path)


if __name__ == '__main__':
    main()
