export type ItemValueWrapper<V> = {
  itemValue: V;
  expirationTimestampInMillisSinceEpoch: number | undefined;
};

export default class MemoryCache<K, V> {
  private static readonly EXPIRATION_PROCESSING_ITEM_BATCH_SIZE = 100000;
  private readonly itemKeyToItemValueWrapperMap = new Map<K, ItemValueWrapper<V>>();
  private timer: NodeJS.Timer | null;
  private itemCount = 0;

  constructor(
    private readonly itemsExpirationCheckIntervalInSecs: number,
    private readonly maxItemCount: number
  ) {
    this.timer = setInterval(this.deleteExpiredItems, itemsExpirationCheckIntervalInSecs * 1000);
  }

  storePermanentItem(itemKey: K, itemValue: V): void {
    this.storeExpiringItem(itemKey, itemValue, 0);
  }

  storeExpiringItem(itemKey: K, itemValue: V, timeToLiveInSecs: number): void {
    if (this.timer === null) {
      throw new Error('Cache is destroyed. Cannot store items anymore.')
    }

    if (this.itemCount < this.maxItemCount) {
      this.itemKeyToItemValueWrapperMap.set(itemKey, {
        itemValue,
        expirationTimestampInMillisSinceEpoch: timeToLiveInSecs
          ? Date.now() + timeToLiveInSecs * 1000
          : undefined,
      });
      this.itemCount++;
    }
  }

  getItemCount(): number {
    return this.itemCount;
  }

  hasItem(itemKey: K): boolean {
    return this.itemKeyToItemValueWrapperMap.has(itemKey);
  }

  retrieveItemValue(itemKey: K): V | undefined {
    return this.itemKeyToItemValueWrapperMap.get(itemKey)?.itemValue;
  }

  removeItem(itemKey: K): void {
    if (this.hasItem(itemKey)) {
      this.itemKeyToItemValueWrapperMap.delete(itemKey);
      this.itemCount--;
    }
  }

  clear(): void {
    this.itemKeyToItemValueWrapperMap.clear();
    this.itemCount = 0;
  }

  destroy(): void {
    if (this.timer) {
      this.clear();
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private readonly deleteExpiredItems = (): void => {
    const currentTimestampInMillisSinceEpoch = Date.now();
    const iterator = this.itemKeyToItemValueWrapperMap.entries();
    this.deleteExpiredItemsFromBatch(iterator, currentTimestampInMillisSinceEpoch);
  };

  private deleteExpiredItemsFromBatch(
    iterator: IterableIterator<[K, ItemValueWrapper<V>]>,
    currentTimestampInMillisSinceEpoch: number
  ): void {
    for (let i = 0; i < MemoryCache.EXPIRATION_PROCESSING_ITEM_BATCH_SIZE; i++) {
      const iteratorResult = iterator.next();

      if (iteratorResult.done) {
        return;
      }

      const [itemKey, valueWrapper] = iteratorResult.value;

      if (
        valueWrapper.expirationTimestampInMillisSinceEpoch &&
        valueWrapper.expirationTimestampInMillisSinceEpoch < currentTimestampInMillisSinceEpoch
      ) {
        this.itemKeyToItemValueWrapperMap.delete(itemKey);
        this.itemCount--;
      }
    }

    setImmediate(() => this.deleteExpiredItemsFromBatch(iterator, currentTimestampInMillisSinceEpoch));
  }
}
