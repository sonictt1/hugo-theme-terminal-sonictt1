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

  async function fetchCardData(name, id){
    if (!name && !id) return null;
    const key = id ? `id:${id}` : `name:${name}`;
    if (cache.has(key)) return cache.get(key);
    const url = id ? ('https://api.scryfall.com/cards/' + id) : ('https://api.scryfall.com/cards/named?exact=' + encodeURIComponent(name));
    try {
      const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!resp.ok) { cache.set(key, null); return null; }
      const json = await resp.json();
      cache.set(key, json);
      return json;
    } catch (e) {
      cache.set(key, null);
      return null;
    }
  }

  async function fetchCardImage(name, id){
    const json = await fetchCardData(name, id);
    if (!json) return null;
    let img = null;
    if (json.image_uris && json.image_uris.normal) img = json.image_uris.normal;
    else if (json.image_uris && json.image_uris.large) img = json.image_uris.large;
    else if (json.card_faces && json.card_faces[0] && json.card_faces[0].image_uris && json.card_faces[0].image_uris.normal) img = json.card_faces[0].image_uris.normal;
    else if (json.card_faces && json.card_faces[0] && json.card_faces[0].image_uris && json.card_faces[0].image_uris.large) img = json.card_faces[0].image_uris.large;
    return img;
  }

  let hoverHandle = null;

  document.addEventListener('mouseover', (e) => {
    const link = e.target.closest ? e.target.closest('.deck-card-link') : null;
    if (!link) return;
    // don't show hover tooltip for commander links
    if (link.closest && (link.closest('.deck-commander') || link.closest('.commander-cell') || link.closest('.commander-name'))) return;
    // delay slightly to avoid flashes
    hoverHandle = setTimeout(async () => {
      const name = link.dataset.card;
      const id = link.dataset.scryId || null;
      const img = await fetchCardImage(name, id);
      if (!img) return;
      showTooltip(link, '<img src="' + img + '" alt="' + ((name||'').replace(/\"/g,'&quot;')) + '">');
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

  // Populate commander art images and sort deck tables by mana cost (client-side)
  document.addEventListener('DOMContentLoaded', async () => {
    // Commander art images
    const imgs = document.querySelectorAll('img.commander-art');
    imgs.forEach(async (img) => {
      const name = img.dataset.card || null;
      const id = img.dataset.scryId || null;
      try {
        const src = await fetchCardImage(name, id);
        if (src) img.src = src;
        else img.style.display = 'none';
      } catch (e) {
        img.style.display = 'none';
      }
    });

    // Sort deck table rows by mana cost and populate mana columns
    const tables = document.querySelectorAll('table.deck-table:not(.deck-commander):not(.deck-sideboard)');
    tables.forEach(async (table) => {
      const tbody = table.querySelector('tbody');
      if (!tbody) return;
      
      const rows = Array.from(tbody.querySelectorAll('tbody > tr'));
      const rowsWithCost = await Promise.all(rows.map(async (row) => {
        const link = row.querySelector('.deck-card-link');
        const manaCellTd = row.querySelector('.mana-cell');
        if (!link) return { row, cmc: 999 };
        const name = link.dataset.card || '';
        const id = link.dataset.scryId || null;
        const data = await fetchCardData(name, id);
        const cmc = (data && typeof data.cmc === 'number') ? data.cmc : 999;
        
        // Populate mana cell if it exists and doesn't have "N/A"
        if (manaCellTd && manaCellTd.textContent.trim() === '') {
          if (data && data.mana_cost) {
            const manaSymbols = data.mana_cost.match(/\{[^}]+\}/g) || [];
            manaCellTd.innerHTML = '';
            manaSymbols.forEach(symbol => {
              const match = symbol.match(/\{([^}]+)\}/);
              if (match) {
                const cost = match[1].toUpperCase();
                const span = document.createElement('span');
                span.className = `mana mana-${cost}`;
                span.textContent = cost;
                manaCellTd.appendChild(span);
              }
            });
          }
        }
        
        return { row, cmc };
      }));

      // Sort by mana cost (ascending)
      rowsWithCost.sort((a, b) => a.cmc - b.cmc);

      // Re-append rows in sorted order
      rowsWithCost.forEach(item => {
        tbody.appendChild(item.row);
      });
    });
  });

  // Handle anchor aliases for deck (#list, #decklist → #deck)
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#list' || hash === '#decklist') {
      window.location.hash = '#deck';
    }
  });
  
  // On initial load, if hash is #list or #decklist, redirect to #deck
  const initialHash = window.location.hash.toLowerCase();
  if (initialHash === '#list' || initialHash === '#decklist') {
    window.location.hash = '#deck';
  }
})();

