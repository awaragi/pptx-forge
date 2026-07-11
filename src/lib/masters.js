// Slide master registration — default master factory, by-title merge, and pptx registration.
// Import into lib.js; do not import directly in slide files.
// pptx.defineSlideMaster() is called only here — no other src/lib/ module registers masters.

// Default export is a factory function, (theme) => SlideMasterProps[], called once per
// compile by createLib. Ships exactly one trivial entry — proof that registration and
// masterName resolution work end-to-end, not an opinionated chrome implementation.
export default function masters(theme) {
  return [
    { title: 'BLANK', objects: [] },
  ];
}

// Merges two already-generated plain SlideMasterProps[] arrays by title. An override
// entry whose title matches a default replaces that default entry wholesale; a new
// title is appended. Independent of theme.js's deepMerge, which treats arrays as
// opaque values to be wholesale-replaced and cannot express by-title merging.
export function mergeMastersByTitle(defaults, overrides) {
  const merged = [...defaults];
  for (const override of overrides) {
    const idx = merged.findIndex((entry) => entry.title === override.title);
    if (idx === -1) {
      merged.push(override);
    } else {
      merged[idx] = override;
    }
  }
  return merged;
}

// Registers the already-merged plain array on pptx, unmodified. Never invokes a
// factory function and never references theme — both already happened by this point.
export function applyMasters(pptx, masterDefinitions) {
  for (const entry of masterDefinitions) {
    pptx.defineSlideMaster(entry);
  }
}
