# Assets

Drop real images in here using these exact filenames and the site will pick them up automatically — no code changes needed. Until a file exists at the given path, the site falls back to a placeholder photo automatically.

## Talent photos → assets/talent/
- name-one.jpg
- name-two.jpg
- name-three.jpg
Recommended: portrait orientation, roughly 4:5 ratio (e.g. 1200x1500px), JPG.

## Flyers → assets/flyers/
- event-01.jpg through event-06.jpg
Recommended: 3:4 ratio (e.g. 1200x1600px), JPG.

Rename the files in index.html to match your real talent names when ready — the alt text and filenames are just placeholders.

## Bios & mix embeds
Each talent card's "Bio" and "Listen to mix" links expand the same panel — bio copy, then the mix player, then an optional note about the mix.

- **Bio text**: edit the `<p class="talent-card__bio-text">` inside each card in `index.html`.
- **Mix embed**: edit the `MIX_EMBEDS` object at the top of `js/main.js` — set `type` to `'soundcloud'` or `'mixcloud'` and `url` to the track/set URL. Leave `url` empty and the panel shows a "Mix embed coming soon" placeholder instead of breaking.
- **Mix note (optional)**: edit the `<p class="talent-card__player-caption">` inside each card in `index.html`, right under the player — same as the bio text. It's just a line of text (venue, event, tracklist, anything worth saying); delete the whole `<p>` for a card if you don't want one there.
