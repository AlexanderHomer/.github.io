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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function searchSite(query) {
  const results = [];
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const pages = await getPages();
  for (const page of pages) {
    const text = page.content.toLowerCase();
    if (!terms.every((t) => text.includes(t))) continue;
    const pageUrl = '/' + page.url;
    const index = terms
      .map((t) => text.indexOf(t))
      .filter((i) => i !== -1)
      .sort((a, b) => a - b)[0];
    let snippet = page.content.substring(Math.max(0, index - 40), index + 60);
    snippet = escapeHtml(snippet);
    for (const term of terms) {
      const regex = new RegExp(escapeRegExp(term), 'ig');
      snippet = snippet.replace(regex, '<mark>$&</mark>');
    }
    const fragment = encodeURIComponent(terms[0]);
    results.push({ url: pageUrl, title: page.title, snippet, fragment });
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
      const snippetDiv = document.createElement('div');
      snippetDiv.innerHTML = page.snippet;
      li.appendChild(a);
      li.appendChild(snippetDiv);
      list.appendChild(li);
    }
  }
});

