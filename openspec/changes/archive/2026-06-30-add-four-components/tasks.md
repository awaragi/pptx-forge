## 1. Theme Tokens

- [x] 1.1 Add `theme.shape.darkStat` stanza to `src/theme.js` with `bgColor: 'tx1'`, `valueColor: 'accent1'`, `labelColor: 'bg1'`, `sourceColor: 'accent6'`
- [x] 1.2 Add `theme.shape.teamCard` stanza to `src/theme.js` with `avatarBgColor: 'accent6'`, `avatarTextColor: 'bg1'`

## 2. calloutQuote Component

- [x] 2.1 Add `calloutQuote(slide, box, { label, quote }, opts, name)` to `makeComponents` in `src/components.js`
- [x] 2.2 Render card background (`roundRect`) and left accent bar (`fillRect`, width ~0.06in) using `calloutBanner` tokens
- [x] 2.3 Render optional `label` text (small, bold, uppercase) and `quote` text (body size); skip label element when not provided

## 3. darkStat Component

- [x] 3.1 Add `darkStat(slide, box, { value, label, source }, opts, name)` to `makeComponents` in `src/components.js`
- [x] 3.2 Render dark-filled `roundRect` background using `theme.shape.darkStat.bgColor`
- [x] 3.3 Render large `value` text (`h2` size, bold, `valueColor`) and `label` text below it (`small` size, `labelColor`)
- [x] 3.4 Render optional `source` text at bottom (`caption` size, `sourceColor`); skip when not provided

## 4. challengeCard Component

- [x] 4.1 Add `challengeCard(slide, box, { title, body }, opts, name)` to `makeComponents` in `src/components.js`
- [x] 4.2 Render card background (`roundRect`) using `theme.shape.card` tokens
- [x] 4.3 Render left accent bar (`fillRect`, width ~0.06in, full card height) using `theme.shape.card.accentColor` (or `opts.accentColor`)
- [x] 4.4 Render `title` (bold, `cardTitle` size) and `body` text with appropriate left inset to clear the accent bar

## 5. teamCard Component

- [x] 5.1 Add `teamCard(slide, box, { name, role, bio }, opts, name)` to `makeComponents` in `src/components.js`
- [x] 5.2 Render centered avatar `circle` using `theme.shape.teamCard.avatarBgColor`
- [x] 5.3 Render `name` text (`h4` size, bold, `titleColor`) below avatar
- [x] 5.4 Render `role` text (`small` size, `accent1`) below name
- [x] 5.5 Render optional `bio` text (`xsmall` size, `bodyColor`); skip when not provided

## 6. Export

- [x] 6.1 Verify all four functions are returned from `makeComponents` so callers can destructure them
