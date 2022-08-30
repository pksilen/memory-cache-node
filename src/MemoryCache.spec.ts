// noinspection MagicNumberJS

import MemoryCache from './MemoryCache';

// noinspection DynamicallyGeneratedCodeJS
jest.setTimeout(60000);

let memoryCache: MemoryCache<string, number>;
afterEach(() => {
  memoryCache.destroy();
});

describe('MemoryCache', () => {
  describe('constructor', () => {
    it('it should create an empty memory cache successfully', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(0);
    });
  });
  describe('storePermanentItem', () => {
    it('should call storeExpiringItem with timeToLiveInSecs set to zero', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem = jest.fn();
      memoryCache.storePermanentItem('key', 1);
      expect(memoryCache.storeExpiringItem).toHaveBeenCalledWith('key', 1, 0);
    });
  });
  describe('storeExpiringItem', () => {
    it('should store an expiring item in cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 1, 10);
      expect(memoryCache.hasItem('key')).toBe(true);
      expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(1);

    });
    it('should not store item in the cache if cache is full', () => {
      memoryCache = new MemoryCache<string, number>(1, 1);
      memoryCache.storeExpiringItem('key', 1, 10);
      memoryCache.storeExpiringItem('key', 2, 10);
      expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(1);
    });
    it('should replace an existing item in the cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 1, 10);
      memoryCache.storeExpiringItem('key', 2, 10);
      expect(memoryCache.retrieveItemValue('key')).toBe(2);
    });
    it('should throw an error if cache is destroyed', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.destroy();
      expect(() => {
        memoryCache.storeExpiringItem('key', 1, 10);
      }).toThrow('Cache is destroyed. Cannot store items anymore.');
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
      memoryCache.removeItem('key2');
      expect(memoryCache.getItemCount()).toBe(1);
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
  describe('getItemExpirationTimestampInMillisSinceEpoch', () => {
    it('should return the item expiration timestamp if cache contains item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 2, 60);
      expect(memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key'))
        .toBeGreaterThan(Date.now());
    });
    it('should return undefined if cache does not contain item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect(memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key')).toBe(undefined);
    });
  });
  describe('removeItem', () => {
    it('should remove the item if cache contains item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.removeItem('key');
      expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(0);
    });
    it('should not decrement item count if cache does not contain item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.removeItem('key2');
      expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(1);
    });
  });
  describe('clear', () => {
    it('it should clear the cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.clear();
      expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(0);
    });
    it('it should set the item count to zero', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.clear();
      expect(memoryCache.getItemCount()).toBe(0);
    });
    it('it is idempotent', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.clear();
      memoryCache.clear();
    });
  });
  describe('destroy', () => {
    it('it should clear the cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.clear = jest.fn();
      memoryCache.destroy();
      expect(memoryCache.clear).toHaveBeenCalledTimes(1);
    });
    it('it clears the items expiration check timer', () => {
      jest.useFakeTimers('legacy');
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 2, 1);
      memoryCache.destroy();
      expect(clearInterval).toHaveBeenCalledTimes(1);
      jest.useRealTimers();
    });
    it('it is idempotent', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.destroy();
      memoryCache.destroy();
    });
  });
  describe('deleteExpiredItems', () => {
    it('should not delete permanent item from cache', (done) => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 1);
      setTimeout(() => {
        expect(memoryCache.getItemCount()).toBe(1);
        expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(1);
        done();
      }, 3000);
    });
    it('should not delete non-expired item from cache', (done) => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 1, 60);
      setTimeout(() => {
        expect(memoryCache.getItemCount()).toBe(1);
        expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(1);
        done();
      }, 3000);
    });
    it('should delete expired items from cache', (done) => {
      const itemCount = 250000;
      memoryCache = new MemoryCache<string, number>(1, itemCount);

      Array(itemCount)
        .fill(1)
        .forEach((_, index) => {
          memoryCache.storeExpiringItem('key' + index, 1, 1);
        });

      setTimeout(() => {
        expect(memoryCache.getItemCount()).toBe(0);
        expect((memoryCache as any).itemKeyToItemValueWrapperMap.size).toBe(0);
        done();
      }, 5000);
    });
  });
});
