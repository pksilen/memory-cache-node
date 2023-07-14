📕 **Check out my new book** [Clean Code Principles And Patterns: A Software Practitioner's Handbook](https://www.amazon.com/Clean-Code-Principles-Patterns-Practitioners-ebook/dp/B0BSDJKYQJ/ref=sr_1_1?crid=21AZI8PH67EU6&keywords=clean+code+principles&qid=1674981660&sprefix=clean+code+principle%2Caps%2C167&sr=8-1)

# memory-cache-node

[![version][version-badge]][package]
[![build][build]][circleci]
[![coverage][coverage]][codecov]
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pksilen_memory-cache-node&metric=alert_status)](https://sonarcloud.io/dashboard?id=pksilen_memory-cache-node)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=pksilen_memory-cache-node&metric=bugs)](https://sonarcloud.io/dashboard?id=pksilen_memory-cache-node)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=pksilen_memory-cache-node&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=pksilen_memory-cache-node)
[![Downloads][downloads]][package]
[![MIT License][license-badge]][license]

A fast and type safe memory cache for Node.js and browser. `memory-cache-node` use Javascript Map as cache implementation which
is faster than using Javascript object that some other similar libraries use. `memory-cache-node` also uses implementation that does
not block the event loop for a long time, if the cache is very large (hundreds of thousands or millions of entries).

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [License](#license)

## Installation
```bash
npm install --save memory-cache-node
```

## Usage

### Creating a memory cache
Below example creates a memory cache for items which has string keys and number values. 
Memory cache checks expiring items every 600 seconds (i.e. every 10 minutes) 
The maximum number of items in the cache is 1 million.

```ts
import { MemoryCache } from 'memory-cache-node';

const itemsExpirationCheckIntervalInSecs = 10 * 60;
const maxItemCount = 1000000;
const memoryCache = new MemoryCache<string, number>(itemsExpirationCheckIntervalInSecs, maxItemCount);
```

### Storing items in the memory cache
Below example stores a permanent item in the memory cache with key `key1` and stores an expiring item with key 
`key2`. The latter item expires earliest after 30 minutes.

```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storePermanentItem('key1', 1);

const timeToLiveInSecs = 30 * 60;
memoryCache.storeExpiringItem('key2', 2, timeToLiveInSecs);
```

### Getting the number of items in the memory cache
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storePermanentItem('key1', 1);

const timeToLiveInSecs = 30 * 60;
memoryCache.storeExpiringItem('key2', 2, timeToLiveInSecs);
console.log(memoryCache.getItemCount()); // Logs to console: 2
```

### Checking if an item exists in the memory cache
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storePermanentItem('key1', 1);

console.log(memoryCache.hasItem('key1')); // Logs to console: true
console.log(memoryCache.hasItem('notFound')); // Logs to console: false
```

### Retrieving the value of an item in the memory cache
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storePermanentItem('key1', 1);

console.log(memoryCache.retrieveItemValue('key1')); // Logs to console: 1
console.log(memoryCache.retrieveItemValue('notFound')); // Logs to console: undefined
```

### Changing the item expiration timestamp
You can set the item expiration time for both permanent and already expiring items.

#### To an absolute expiration time
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storeExpiringItem('key1', 1, 60);

// Expire at the end of this year, instead of in 60 seconds:
const endOfThisYear = new Date(new Date().getFullYear(), 11, 31);
memoryCache.setItemTimeToLiveUntil('key1', endOfThisYear.getTime());
```

#### With a relative expiration time
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storePermanentItem('key1', 1);

memoryCache.setItemTimeToLiveRemaining('key1', 5); // expire in 5 seconds from now instead of never
```

#### Making an expiring item permanent
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storeExpiringItem('key1', 1, 60);

memoryCache.setItemTimeToLiveUntil('key1', undefined); // Never expire
```

### Getting the item expiration timestamp
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storePermanentItem('key1', 1);

console.log(memoryCache.getItemExpirationTimestampInMillisSinceEpoch('key1')); // Logs some large number to console
```

### Removing an item from the memory cache
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
memoryCache.storePermanentItem('key1', 1);
console.log(memoryCache.hasItem('key1')); // Logs to console: true
memoryCache.removeItem('key1');
console.log(memoryCache.hasItem('key1')); // Logs to console: false
```

### Clearing the memory cache
Below examples removes all items from the memory cache
```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
// Use cache here
// ...
memoryCache.clear()
```

### Destroying the memory cache
Below example destroys the memory cache and it **should not be used** after that.
It clears the memory cache and also removes the timer for checking expired items.
**NOTE! You should NEVER use a destroyed cache again!** 
If you try to use a destroyed memory cache, an exception will be thrown.
You should destroy your memory cache if it is not used in your application anymore.

```ts
import { MemoryCache } from 'memory-cache-node';

const memoryCache = new MemoryCache<string, number>(600, 1000000);
// Use cache here
// ...
memoryCache.destroy()
```

## API Documentation

* `K` is the type of the item key.
* `V` is the type of the item value.
  
```ts
class MemoryCache<K, V> {
  constructor(itemsExpirationCheckIntervalInSecs: number, maxItemCount: number);
  storePermanentItem(itemKey: K, itemValue: V): void;
  storeExpiringItem(itemKey: K, itemValue: V, timeToLiveInSecs: number): void;
  getItemCount(): number;
  hasItem(itemKey: K): boolean;
  getValues(): V[];
  getItems(): [K, V][];
  retrieveItemValue(itemKey: K): V | undefined;
  setItemTimeToLiveUntil(itemKey: K, timeToLiveUntilInMillisSinceEpoch: number | undefined): void;
  setItemTimeToLiveRemaining(itemKey: K, timeToLiveInSecs: number | undefined): void;
  getItemExpirationTimestampInMillisSinceEpoch(itemKey: K): number | undefined;
  removeItem(itemKey: K): void;
  exportItemsToJson(): string;
  
  // Use below function only with JSON output from exportItemsToJson method
  importItemsFrom(json: string): void; // Can throw if JSON is invalid
  
  clear(): void;
  destroy(): void;
}
```

## License
[MIT](https://github.com/pksilen/memory-cache-node/blob/main/LICENSE)

[license-badge]: https://img.shields.io/badge/license-MIT-green
[license]: https://github.com/pksilen/memory-cache-node/blob/main/LICENSE
[version-badge]: https://img.shields.io/npm/v/memory-cache-node.svg?style=flat-square
[package]: https://www.npmjs.com/package/memory-cache-node
[downloads]: https://img.shields.io/npm/dm/memory-cache-node
[build]: https://img.shields.io/circleci/project/github/pksilen/memory-cache-node/main.svg?style=flat-square
[circleci]: https://circleci.com/gh/pksilen/memory-cache-node/tree/main
[coverage]: https://img.shields.io/codecov/c/github/pksilen/memory-cache-node/main.svg?style=flat-square
[codecov]: https://codecov.io/gh/pksilen/memory-cache-node
