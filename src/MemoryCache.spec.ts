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
      expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(0);
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
      expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(1);
    });

    it('should not store item in the cache if cache is full', () => {
      memoryCache = new MemoryCache<string, number>(1, 1);
      memoryCache.storeExpiringItem('key', 1, 10);
      memoryCache.storeExpiringItem('key', 2, 10);
      expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(1);
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

  describe('getValues', () => {
    it('should return an empty array if cache is empty', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect(memoryCache.getValues()).toEqual([]);
    });

    it('should return an array of values in cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 1);
      memoryCache.storePermanentItem('key2', 2);
      memoryCache.removeItem('key2');
      expect(memoryCache.getValues()).toEqual([1]);
    });
  });

  describe('getItems', () => {
    it('should return an empty array if cache is empty', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect(memoryCache.getItems()).toEqual([]);
    });

    it('should return an array of items in cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 1);
      memoryCache.storePermanentItem('key2', 2);
      memoryCache.removeItem('key2');
      expect(memoryCache.getItems()).toEqual([['key', 1]]);
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

  describe('setItemTimeToLiveUntil', () => {
    it('should take an absolute value at which the item should expire', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 2, 10);

      const timeToLiveUntil = Date.now() + 10000;
      memoryCache.setItemTimeToLiveUntil('key', timeToLiveUntil);
      const newExpirationTimestamp = memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key');
      expect(newExpirationTimestamp).toBe(timeToLiveUntil);
    });

    it('should make an item permanent', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 2, 10);

      memoryCache.setItemTimeToLiveUntil('key', undefined);
      const newExpirationTimestamp = memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key');
      expect(newExpirationTimestamp).toBe(undefined);
    });
  });

  describe('setItemTimeToLiveRemaining', () => {
    it('should change a permanent item to temporary', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);

      const timeToLiveInSecs = 10;
      const calculatedExpirationTimestmap = Date.now() + timeToLiveInSecs * 1000;
      memoryCache.setItemTimeToLiveRemaining('key', timeToLiveInSecs);
      const newExpirationTimestamp = memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key');
      expect(newExpirationTimestamp).toBeCloseTo(calculatedExpirationTimestmap, -2);
    });

    it('should make an item permanent', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);

      memoryCache.setItemTimeToLiveRemaining('key', undefined);
      const newExpirationTimestamp = memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key');
      expect(newExpirationTimestamp).toBe(undefined);
    });
  });

  describe('getItemExpirationTimestampInMillisSinceEpoch', () => {
    it('should return the item expiration timestamp if cache contains item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 2, 60);
      expect(memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key')).toBeGreaterThan(Date.now());
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
      expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(0);
    });

    it('should not decrement item count if cache does not contain item with given key', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.removeItem('key2');
      expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(1);
    });
  });

  describe('exportItemsToJson', () => {
    it('should return an empty JSON object if cache is empty', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect(memoryCache.exportItemsToJson()).toEqual('{}');
    });

    it('should return a JSON object with cache items', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      expect(memoryCache.exportItemsToJson()).toEqual('{}');
      memoryCache.storePermanentItem('key', 1);
      memoryCache.storePermanentItem('key2', 2);

      expect(JSON.parse(memoryCache.exportItemsToJson())).toEqual({
        key: { value: 1 },
        key2: { value: 2 },
      });
    });
  });

  describe('importPermanentItemsFrom', () => {
    it('should add items from JSON to the cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);

      const itemsObject = {
        key: { value: 1, expirationTimestampInMillis: 1 },
        key2: { value: 2, expirationTimestampInMillis: 2 },
      };

      memoryCache.importItemsFrom(JSON.stringify(itemsObject));
      expect(memoryCache.getItemCount()).toBe(2);
      expect(memoryCache.retrieveItemValue('key')).toBe(1);
      expect(memoryCache.retrieveItemValue('key2')).toBe(2);
      expect(memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key')).toBe(1);
      expect(memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key2')).toBe(2);
    });
  });

  describe('clear', () => {
    it('it should clear the cache', () => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storePermanentItem('key', 2);
      memoryCache.clear();
      expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(0);
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
        expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(1);
        done();
      }, 3000);
    });

    it('should not delete non-expired item from cache', (done) => {
      memoryCache = new MemoryCache<string, number>(1, 10);
      memoryCache.storeExpiringItem('key', 1, 60);
      setTimeout(() => {
        expect(memoryCache.getItemCount()).toBe(1);
        expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(1);
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
        expect((memoryCache as any).itemKeyToValueWrapperMap.size).toBe(0);
        done();
      }, 5000);
    });
  });
});
