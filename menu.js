const pages = [
  'antibiogram.html',
  'cranial-nerves.html',
  'daily-routine.html',
  'facial-plastics.html',
  'facial-trauma-guide.html',
  'head-and-neck-surgery.html',
  'index.html',
  'laryngology.html',
  'levels-of-the-neck.html',
  'local-rotational-flaps.html',
  'map-of-tufts-medical-center.html',
  'medications.html',
  'monthly-routines.html',
  'on-call-guide.html',
  'or-instruments.html',
  'orders-discharges-and-dictations.html',
  'otolaryngology-national-conference-schedule.html',
  'otology.html',
  'pediatric-otolaryngology.html',
  'perioperative-aspirin-anticoagulation-guide.html',
  'radiology-levels-of-the-neck.html',
  'review-of-systems.html',
  'rhinology.html',
  'rotations.html',
  'rules-of-the-game.html',
  'templates-protocols.html',
  'tips.html',
  'weekly-routines.html',
  'yearly-routines.html'
];

async function searchSite(query) {
  const results = [];
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  for (const url of pages) {
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      const plain = text.replace(/<[^>]*>/g, ' ');
      const lower = plain.toLowerCase();
      const matches = terms.every(t => lower.includes(t));
      if (matches) {
        const idx = lower.indexOf(terms[0]);
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : url;
        const start = Math.max(0, idx - 40);
        const end = Math.min(plain.length, idx + terms[0].length + 40);
        let snippet = plain.slice(start, end).replace(/\s+/g, ' ').trim();
        for (const term of terms) {
          const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
          snippet = snippet.replace(regex, '<b>$1</b>');
        }
        const fragment = encodeURIComponent(plain.substr(idx, terms[0].length));
        results.push({ url, title, snippet, fragment });
      }
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

  const input = document.getElementById('search-input');
  const resultsDiv = document.getElementById('search-results');

  async function doSearch() {
    const q = input.value.trim();
    if (!q) {
      resultsDiv.style.display = 'none';
      resultsDiv.innerHTML = '';
      return;
    }
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = 'Searching...';
    const matches = await searchSite(q);
    if (matches.length === 0) {
      resultsDiv.innerHTML = '<div>No results found.</div>';
      return;
    }
    const ul = document.createElement('ul');
    for (const page of matches) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `${page.url}#:~:text=${page.fragment}`;
      a.textContent = page.title;
      const snippet = document.createElement('span');
      snippet.innerHTML = ` - ${page.snippet}`;
      li.appendChild(a);
      li.appendChild(snippet);
      ul.appendChild(li);
    }
    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(ul);
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        doSearch();
      }
    });
  }

  document.addEventListener('click', (e) => {
    const bar = document.getElementById('bottom-bar');
    if (!bar.contains(e.target) && !resultsDiv.contains(e.target)) {
      resultsDiv.style.display = 'none';
    }
  });
});
