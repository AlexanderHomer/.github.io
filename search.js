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

function getQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('q') || '';
}

async function searchSite(query) {
  const results = [];
  const lower = query.toLowerCase();
  for (const url of pages) {
    try {
      const resp = await fetch(url);
      const text = await resp.text();
      if (text.toLowerCase().includes(lower)) {
        const titleMatch = text.match(/<title>(.*?)<\/title>/i);
        const title = titleMatch ? titleMatch[1] : url;
        results.push({ url, title });
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
      a.href = page.url;
      a.textContent = page.title;
      li.appendChild(a);
      list.appendChild(li);
    }
  }
});
