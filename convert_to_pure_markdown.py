import subprocess
import sys
from pathlib import Path


def convert_md(file_path: Path):
    text = file_path.read_text(encoding='utf-8')
    front_matter = ''
    body = text
    if text.startswith('---'):
        parts = text.split('---', 2)
        if len(parts) >= 3:
            front_matter = '---' + parts[1] + '---\n'
            body = parts[2].lstrip('\n')
    try:
        result = subprocess.run(
            ["pandoc", "-f", "markdown", "-t", "markdown", "--markdown-headings=atx", "--wrap=preserve"],
            input=body,
            text=True,
            capture_output=True,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        print(f"Pandoc failed on {file_path}: {e}")
        return
    output = front_matter + result.stdout
    file_path.write_text(output, encoding='utf-8')
    print(f"Converted {file_path}")


def main():
    repo_root = Path(__file__).resolve().parent
    paths = subprocess.check_output(['git', 'ls-files', '*.md'], text=True)
    for rel_path in paths.strip().split('\n'):
        path = repo_root / rel_path
        convert_md(path)


if __name__ == "__main__":
    main()
