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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function fetchPage(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  const titleMatch = text.match(/<title>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : url;
  const mdMatch = text.match(
    /<textarea id="markdown-src"[^>]*>([\s\S]*?)<\/textarea>/i
  );
  const md = mdMatch ? mdMatch[1] : '';
  let html = md;
  try {
    const mdResp = await fetch('https://api.github.com/markdown', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({ text: md }),
    });
    html = await mdResp.text();
  } catch (e) {
    html = md;
  }
  return { title, html };
}

async function searchSite(query) {
  const results = [];
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const pages = await getPages();
  for (const url of pages) {
    try {
      const pageUrl = '/' + url;
      const { title, html } = await fetchPage(pageUrl);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const bodyText = doc.body.textContent.toLowerCase();
      if (!terms.every((t) => bodyText.includes(t))) continue;
      let snippetEl = null;
      for (const el of doc.querySelectorAll(
        'p, li, h1, h2, h3, h4, h5, h6'
      )) {
        const text = el.textContent.toLowerCase();
        if (terms.every((t) => text.includes(t))) {
          snippetEl = el;
          break;
        }
      }
      let snippetHtml = snippetEl ? snippetEl.innerHTML : '';
      for (const term of terms) {
        const regex = new RegExp(escapeRegExp(term), 'ig');
        snippetHtml = snippetHtml.replace(regex, '<mark>$&</mark>');
      }
      const fragment = encodeURIComponent(terms[0]);
      results.push({ url: pageUrl, title, snippet: snippetHtml, fragment });
    } catch (e) {
      // ignore errors
    }
  }
  return results;
}

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('back-button');
  if (backBtn) {
    backBtn.addEventListener('click', () => history.back());
  }

  const openInput = document.getElementById('search-input');
  const overlay = document.getElementById('search-overlay');
  const overlayInput = document.getElementById('search-overlay-input');
  const overlayResults = document.getElementById('search-overlay-results');
  const closeBtn = document.getElementById('search-close');

  function openSearch() {
    overlay.style.display = 'flex';
    overlayInput.value = '';
    overlayResults.innerHTML = '';
    overlayInput.focus();
  }

  function closeSearch() {
    overlay.style.display = 'none';
  }

  if (openInput) {
    openInput.addEventListener('focus', openSearch);
    openInput.addEventListener('click', openSearch);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSearch);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') {
      closeSearch();
    }
  });

  async function doSearch() {
    const q = overlayInput.value.trim();
    if (!q) {
      overlayResults.innerHTML = '';
      return;
    }
    overlayResults.innerHTML = 'Searching...';
    const matches = await searchSite(q);
    if (matches.length === 0) {
      overlayResults.innerHTML = '<div>No results found.</div>';
      return;
    }
    const ul = document.createElement('ul');
    for (const page of matches) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `${page.url}#:~:text=${page.fragment}`;
      a.textContent = page.title;
      const snippetDiv = document.createElement('div');
      snippetDiv.innerHTML = page.snippet;
      li.appendChild(a);
      li.appendChild(snippetDiv);
      ul.appendChild(li);
    }
    overlayResults.innerHTML = '';
    overlayResults.appendChild(ul);
  }

  if (overlayInput) {
    overlayInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        doSearch();
      }
    });
  }
});

