const MemoryCache = require('../src/cache');

describe('MemoryCache', () => {
  let cache;
  beforeEach(() => { cache = new MemoryCache(); });

  test('set et get une valeur', () => {
    cache.set('foo', 'bar');
    expect(cache.get('foo')).toBe('bar');
  });

  test('retourne null pour une clé inexistante', () => {
    expect(cache.get('inexistant')).toBeNull();
  });

  test('expire une entrée après le TTL', async () => {
    cache.set('tmp', 'valeur', 0.01); // TTL = 10ms
    await new Promise(r => setTimeout(r, 50));
    expect(cache.get('tmp')).toBeNull();
  });

  test('supprime une clé', () => {
    cache.set('del', 'val');
    cache.delete('del');
    expect(cache.get('del')).toBeNull();
  });

  test('dump exporte le cache', () => {
    cache.set('a', 1); cache.set('b', 2);
    const dump = cache.dump();
    expect(Object.keys(dump)).toHaveLength(2);
  });
});
