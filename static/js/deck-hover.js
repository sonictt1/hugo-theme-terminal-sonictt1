(function(){
  const cache = new Map();
  const tooltip = document.createElement('div');
  tooltip.id = 'deck-card-tooltip';
  tooltip.style.display = 'none';
  document.body.appendChild(tooltip);

  function showTooltip(link, html) {
    tooltip.innerHTML = html;
    tooltip.style.display = 'block';
    const rect = link.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = window.scrollX + rect.right + 8;
    let top = window.scrollY + rect.top;
    if (left + tooltipRect.width > window.scrollX + document.documentElement.clientWidth) {
      left = window.scrollX + rect.left - tooltipRect.width - 8;
      if (left < window.scrollX + 8) left = window.scrollX + 8;
    }
    if (top + tooltipRect.height > window.scrollY + document.documentElement.clientHeight) {
      top = window.scrollY + document.documentElement.clientHeight - tooltipRect.height - 8 + window.scrollY;
    }
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  }

  function hideTooltip(){
    tooltip.style.display = 'none';
    tooltip.innerHTML = '';
  }

  async function fetchCardImage(name){
    if (!name) return null;
    if (cache.has(name)) return cache.get(name);
    const url = 'https://api.scryfall.com/cards/named?exact=' + encodeURIComponent(name);
    try {
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) { cache.set(name, null); return null; }
      const json = await resp.json();
      let img = null;
      if (json.image_uris && json.image_uris.normal) img = json.image_uris.normal;
      else if (json.image_uris && json.image_uris.large) img = json.image_uris.large;
      else if (json.card_faces && json.card_faces[0] && json.card_faces[0].image_uris && json.card_faces[0].image_uris.normal) img = json.card_faces[0].image_uris.normal;
      else if (json.card_faces && json.card_faces[0] && json.card_faces[0].image_uris && json.card_faces[0].image_uris.large) img = json.card_faces[0].image_uris.large;
      cache.set(name, img);
      return img;
    } catch (e) {
      cache.set(name, null);
      return null;
    }
  }

  let hoverHandle = null;

  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest ? e.target.closest('.deck-card-link') : null;
    if (!link) return;
    // delay slightly to avoid flashes
    hoverHandle = setTimeout(async () => {
      const name = link.dataset.card;
      const img = await fetchCardImage(name);
      if (!img) return;
      showTooltip(link, '<img src="' + img + '" alt="' + (name.replace(/"/g,'&quot;')) + '">');
    }, 160);
  });

  document.addEventListener('mouseout', (e) => {
    const link = e.target.closest ? e.target.closest('.deck-card-link') : null;
    if (!link) return;
    clearTimeout(hoverHandle);
    hideTooltip();
  });

  window.addEventListener('scroll', hideTooltip);
  window.addEventListener('resize', hideTooltip);
})();
