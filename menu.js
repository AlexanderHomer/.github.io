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

