// Filename convention for --images output, shared so bin/forge.js and tests
// stay in sync: <slug>[_<timestamp>]-NN.png, matching the same timestamp
// string --snapshot already computes for the .pptx filename.
export function imageFilename(slug, timestamp, index) {
  const base = timestamp ? `${slug}_${timestamp}` : slug;
  const nn = String(index).padStart(2, '0');
  return `${base}-${nn}.png`;
}
