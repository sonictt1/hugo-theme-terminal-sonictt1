Feature summary — shortcodes & examples (2026-05-14)

Purpose
-------
This file summarizes theme and site changes made on 2026-05-14 so you can copy or adapt the text into the main theme README.

Changes (what and where)
------------------------

- deck-table shortcode (parses plain-text MTG decklists and renders HTML tables)
  - File: themes/terminal/layouts/shortcodes/deck-table.html
  - Usage: inline block or via `file="static/decks/<name>.deck"`

- Deck table CSS (styles for the rendered table)
  - File: themes/terminal/assets/css/post.css (appended `.deck-table` rules)

- Example deck file
  - File: static/decks/sample.deck

- Example post demonstrating `deck-table`
  - File: content/posts/deck-table-example.md

Local examples
--------------

- Deck example page (rendered): http://localhost:1313/posts/deck-table-example/
- Raw sample deck file (served from `static/`): http://localhost:1313/decks/sample.deck

Shortcode examples (displayed on the example page):

Inline usage (block with decklist):

```html
&#123;&#123;&lt; deck-table &gt;&#125;&#125;
4 Lightning Bolt
4 Serra Angel
3 Black Lotus
23 Plains
Sideboard:
2 Pyroblast
1 Red Elemental Blast
&#123;&#123;&lt;/deck-table &gt;&#125;&#125;
```

File usage (reads `static/decks/sample.deck`):

```html
&#123;&#123;&lt; deck-table file="static/decks/sample.deck" &gt;&#125;&#125;
&#123;&#123;&lt;/deck-table &gt;&#125;&#125;
```

- scryfall-art shortcode (theme-level; build-time fetch + image selection)
  - File: themes/terminal/layouts/shortcodes/scryfall-art.html
  - Notes: supports `name`, `set`/`number` (or `set_code`/`collector_number`), `variant`, `exact`, `link`, `class`, `alt`; uses `resources.GetRemote` + `transform.Unmarshal`, includes User-Agent and Accept headers and fixes for URL encoding.

- scryfall-art example post (shortcode usage and sanitized examples)
  - File: content/posts/scryfall-art-example.md

What to add to README
---------------------

Suggested short text to include in `README.md` under "Built-in shortcodes" or "Add-ons":

"New: `deck-table` — parses plain-text Magic: The Gathering decklists (inline or file-based) and renders main deck + sideboard tables. See `themes/terminal/FEATURE_SUMMARY-2026-05-14.md` for examples and file locations. Also updated `scryfall-art` to support targeting specific printings (`set` + `number`) and improved remote fetch handling."

Notes
-----
- All changed/added files are in this repository; paths above are workspace-relative.
- If you want, I can open a PR that updates `README.md` with the suggested copy and example snippets.
