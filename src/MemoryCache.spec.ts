// noinspection MagicNumberJS

import MemoryCache from './MemoryCache';

// noinspection DynamicallyGeneratedCodeJS
jest.setTimeout(60000);

let memoryCache: MemoryCache<string, number>;
afterEach(() => {
  memoryCache.clear();
})

describe('MemoryCache', () => {
  describe('constructor', () => {
    it('it should create an empty memory cache successfully', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect((memoryCache.getItemCount())).toBe(0);
    });
  });
  describe('storePermanentItem', () => {
    it('should store a permanent item in cache', (done) => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 1);
      setTimeout(() => {
        expect((memoryCache.getItemCount())).toBe(1);
        done();
      }, 3000);
    });
    it('should replace an existing item in the cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 1);
      memoryCache.storePermanentItem('key', 2);
      expect(memoryCache.retrieveItemValue('key')).toBe(2);
    });
  });
  describe('storeExpiringItem', () => {
    it('should store an expiring item in cache and cache should not contain item after it has expired', (done) => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 1, 1);
      setTimeout(() => {
        expect(memoryCache.hasItem('key')).toBe(false);
        expect((memoryCache.getItemCount())).toBe(0);
        done();
      }, 3000);
    });
    it('should replace an existing item in the cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 1, 10);
      memoryCache.storeExpiringItem('key', 2, 10);
      expect(memoryCache.retrieveItemValue('key')).toBe(2);
    });
  });
  describe('getItemCount', () => {
    it('should return 0 if no items in cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect(memoryCache.getItemCount()).toBe(0);
    });
    it('should return the number of items in cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 1);
      memoryCache.storePermanentItem('key2', 2);
      expect(memoryCache.getItemCount()).toBe(2);
    });
  });
  describe('hasItem', () => {
    it('should return true if cache contains item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 1);
      expect(memoryCache.hasItem('key')).toBe(true);
    });
    it('should return false if cache does not contain item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 1);
      expect(memoryCache.hasItem('key2')).toBe(false);
    });
  });
  describe('retrieveItemValue', () => {
    it('should return the item value if cache contains item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      expect(memoryCache.retrieveItemValue('key')).toBe(2);
    });
    it('should return undefined if cache does not contain item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect(memoryCache.retrieveItemValue('key')).toBe(undefined);
    });
  });
  describe('removeItem', () => {
    it('should remove the item if cache contains item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.removeItem('key');
      expect(memoryCache.getItemCount()).toBe(0);
    });
    it('should not decrement item count if cache does not contain item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.removeItem('key2');
      expect(memoryCache.getItemCount()).toBe(1);
    });
  });
  describe('clear', () => {
    it('it should clear the cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.clear();
      expect(memoryCache.retrieveItemValue('key')).toBe(undefined);
    });
    it('it should set the item count to zero', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.clear();
      expect(memoryCache.getItemCount()).toBe(0);
    });
    it('it clears the items expiration check timer', () => {
      jest.useFakeTimers('legacy');
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 2, 1);
      memoryCache.clear();
      expect(clearInterval).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
    it('it is idempotent', () => {
      const memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.clear();
      memoryCache.clear();
    });
  });
});
