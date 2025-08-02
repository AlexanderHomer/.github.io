let cachedPages = null;

async function getPages() {
  if (!cachedPages) {
    try {
      const resp = await fetch('/pages.json');
      cachedPages = await resp.json();
    } catch (e) {
      cachedPages = [];
    }
  }
  return cachedPages;
}

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

async function searchSite(query) {
  const results = [];
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const pages = await getPages();
  for (const url of pages) {
    try {
      const pageUrl = '/' + url;
      const resp = await fetch(pageUrl);
      const text = await resp.text();
      const plain = text.replace(/<[^>]*>/g, ' ');
      const lower = plain.toLowerCase();
      const matches = terms.every(t => lower.includes(t));
      if (matches) {
        const idx = lower.indexOf(terms[0]);
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : pageUrl;
        const start = Math.max(0, idx - 40);
        const end = Math.min(plain.length, idx + terms[0].length + 40);
        let snippet = plain.slice(start, end).replace(/\s+/g, ' ').trim();
        for (const term of terms) {
          const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
          snippet = snippet.replace(regex, '<b>$1</b>');
        }
        const fragment = encodeURIComponent(plain.substr(idx, terms[0].length));
        results.push({ url: pageUrl, title, snippet, fragment });
      }
    } catch (e) {
      // ignore errors fetching individual pages
    }
  }
  return results;
}

document.addEventListener('DOMContentLoaded', async () => {
  const query = getQuery();
  const input = document.querySelector('input[name="q"]');
  if (input) input.value = query;
  if (!query) return;
  const list = document.getElementById('results');
  list.innerHTML = '<li>Searching...</li>';
  const matches = await searchSite(query);
  list.innerHTML = '';
  if (matches.length === 0) {
    list.innerHTML = '<li>No results found.</li>';
  } else {
    for (const page of matches) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `${page.url}#:~:text=${page.fragment}`;
      a.textContent = page.title;
      const snippet = document.createElement('span');
      snippet.innerHTML = ` - ${page.snippet}`;
      li.appendChild(a);
      li.appendChild(snippet);
      list.appendChild(li);
    }
  }
});
