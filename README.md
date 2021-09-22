# memory-cache-node

[![version][version-badge]][package]
[![build][build]][circleci]
[![coverage][coverage]][codecov]
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=pksilen_memory-cache-node&metric=alert_status)](https://sonarcloud.io/dashboard?id=pksilen_memory-cache-node)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=pksilen_memory-cache-node&metric=bugs)](https://sonarcloud.io/dashboard?id=pksilen_memory-cache-node)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=pksilen_memory-cache-node&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=pksilen_memory-cache-node)
[![Downloads][downloads]][package]
[![MIT License][license-badge]][license]

A fast and modern memory cache for Node.js and browser. `memory-cache-node` use Javascript Map as cache implementation which
is faster than using Javascript object that some other similar libraries use. `memory-cache-node` also uses implementation that does
not block the event loop for a long time, if the cache is very large (hundreds of thousands or millions of entries).


## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [License](#license)

## <a name="installation"></a> Installation
```bash
npm install --save memory-cache-node
```

## <a name="usage"></a> Usage

## <a name="api-documentation"></a> API Documentation

```ts
class MemoryCache<K, V> {
  constructor(itemsExpirationCheckIntervalInSecs: number, maxItemCount: number);
  storePermanentItem(itemKey: K, itemValue: V): void;
  storeExpiringItem(itemKey: K, itemValue: V, timeToLiveInSecs: number): void;
  getItemCount(): number;
  hasItem(itemKey: K): boolean;
  retrieveItemValue(itemKey: K): V | undefined;
  removeItem(itemKey: K): void;
  clear(): void;
}
```

## <a name="license"></a> License
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
