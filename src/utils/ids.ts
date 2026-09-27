let fallbackSequence = 0;

// Local demo IDs must also work on HTTP LAN previews, where randomUUID is absent.
// These are record identifiers, not authentication tokens.
export function createId(prefix: string): string {
  const crypto = globalThis.crypto;
  if (typeof crypto?.randomUUID === 'function') return `${prefix}-${crypto.randomUUID()}`;

  const entropy = typeof crypto?.getRandomValues === 'function'
    ? Array.from(crypto.getRandomValues(new Uint32Array(2)), (value) => value.toString(36)).join('')
    : Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now().toString(36)}-${(++fallbackSequence).toString(36)}-${entropy}`;
}
