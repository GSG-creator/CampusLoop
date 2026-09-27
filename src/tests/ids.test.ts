import assert from 'node:assert/strict';
import test from 'node:test';
import { createId } from '../utils/ids';

test('demo IDs remain unique in an HTTP context without randomUUID', (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'crypto', descriptor);
    else Reflect.deleteProperty(globalThis, 'crypto');
  });
  t.mock.method(Date, 'now', () => 1234567890);
  // Deterministic entropy also checks that same-tick operations have distinct IDs.
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: { getRandomValues: (values: Uint32Array) => values.fill(7) },
  });
  const ids = Array.from({ length: 100 }, () => createId('book'));
  assert.equal(new Set(ids).size, 100);
  assert.ok(ids.every((id) => id.startsWith('book-')));

  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: undefined });
  assert.notEqual(createId('msg'), createId('msg'));
});
