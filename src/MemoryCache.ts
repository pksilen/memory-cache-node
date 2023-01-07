export type ValueWrapper<V> = {
  readonly value: V;
  expirationTimestampInMillis: number | undefined;
};

export default class MemoryCache<K, V> {
  private static readonly EXPIRATION_PROCESSING_ITEM_BATCH_SIZE = 100000;
  private readonly itemKeyToValueWrapperMap = new Map<K, ValueWrapper<V>>();
  private timer: NodeJS.Timer | null;
  private itemCount = 0;

  constructor(
    private readonly itemsExpirationCheckIntervalInSecs: number,
    private readonly maxItemCount: number
  ) {
    this.timer = setInterval(this.deleteExpiredItems, itemsExpirationCheckIntervalInSecs * 1000);
  }

  storePermanentItem(key: K, value: V): void {
    this.storeExpiringItem(key, value, 0);
  }

  storeExpiringItem(key: K, value: V, timeToLiveInSecs: number): void {
    if (this.timer === null) {
      throw new Error('Cache is destroyed. Cannot store items anymore.');
    }

    if (this.itemCount < this.maxItemCount) {
      this.itemKeyToValueWrapperMap.set(key, {
        value,
        expirationTimestampInMillis: timeToLiveInSecs ? Date.now() + timeToLiveInSecs * 1000 : undefined,
      });

      this.itemCount++;
    }
  }

  getItemCount(): number {
    return this.itemCount;
  }

  hasItem(itemKey: K): boolean {
    return this.itemKeyToValueWrapperMap.has(itemKey);
  }

  getValues(): V[] {
    return Array.from(this.itemKeyToValueWrapperMap.values()).map((valueWrapper) => valueWrapper.value);
  }

  getItems(): [K, V][] {
    return Array.from(this.itemKeyToValueWrapperMap.entries()).map(([key, valueWrapper]) => [
      key,
      valueWrapper.value,
    ]);
  }

  retrieveItemValue(itemKey: K): V | undefined {
    return this.itemKeyToValueWrapperMap.get(itemKey)?.value;
  }

  setItemTimeToLiveUntil(itemKey: K, timeToLiveUntilInMillisSinceEpoch: number): void {
    const valueWrapper = this.itemKeyToValueWrapperMap.get(itemKey);

    if (valueWrapper !== undefined) {
      valueWrapper.expirationTimestampInMillis = timeToLiveUntilInMillisSinceEpoch;
    }
  }

  setItemTimeToLiveRemaining(itemKey: K, timeToLiveInSecs: number): void {
    const valueWrapper = this.itemKeyToValueWrapperMap.get(itemKey);

    if (valueWrapper !== undefined) {
      valueWrapper.expirationTimestampInMillis = Date.now() + timeToLiveInSecs * 1000;
    }
  }

  getItemExpirationTimestampInMillisSinceEpoch(itemKey: K): number | undefined {
    return this.itemKeyToValueWrapperMap.get(itemKey)?.expirationTimestampInMillis;
  }

  removeItem(itemKey: K): void {
    if (this.hasItem(itemKey)) {
      this.itemKeyToValueWrapperMap.delete(itemKey);
      this.itemCount--;
    }
  }

  clear(): void {
    this.itemKeyToValueWrapperMap.clear();
    this.itemCount = 0;
  }

  destroy(): void {
    if (this.timer) {
      this.clear();
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  exportItemsToJson(): string {
    const itemsObject = Array.from(this.itemKeyToValueWrapperMap.entries()).reduce(
      (itemsObject, [key, valueWrapper]) => ({
        ...itemsObject,
        [key as any]: valueWrapper,
      }),
      {}
    );

    return JSON.stringify(itemsObject);
  }

  importItemsFrom(json: string): void {
    Object.entries(JSON.parse(json)).forEach(
      ([key, { value, expirationTimestampInMillis }]: [string, any]) => {
        if (this.timer === null) {
          throw new Error('Cache is destroyed. Cannot store items anymore.');
        }

        if (this.itemCount < this.maxItemCount) {
          this.itemKeyToValueWrapperMap.set(key as any, {
            value,
            expirationTimestampInMillis,
          });

          this.itemCount++;
        }
      }
    );
  }

  private readonly deleteExpiredItems = (): void => {
    const currentTimestampInMillisSinceEpoch = Date.now();
    const iterator = this.itemKeyToValueWrapperMap.entries();
    this.deleteExpiredItemsFromBatch(iterator, currentTimestampInMillisSinceEpoch);
  };

  private deleteExpiredItemsFromBatch(
    iterator: IterableIterator<[K, ValueWrapper<V>]>,
    currentTimestampInMillisSinceEpoch: number
  ): void {
    for (let i = 0; i < MemoryCache.EXPIRATION_PROCESSING_ITEM_BATCH_SIZE; i++) {
      const iteratorResult = iterator.next();

      if (iteratorResult.done) {
        return;
      }

      const [itemKey, valueWrapper] = iteratorResult.value;

      if (
        valueWrapper.expirationTimestampInMillis &&
        valueWrapper.expirationTimestampInMillis < currentTimestampInMillisSinceEpoch
      ) {
        this.itemKeyToValueWrapperMap.delete(itemKey);
        this.itemCount--;
      }
    }

    setImmediate(() => this.deleteExpiredItemsFromBatch(iterator, currentTimestampInMillisSinceEpoch));
  }
}
