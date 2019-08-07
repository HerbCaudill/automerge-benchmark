## Usage

To run all benchmarks:

```
yarn start
```

It takes several minutes to run all tests. To run individual tests, just comment out the ones you
don't want to run in `index.js`.

```js
// benchmark(insertAndMap, [500, 1000, 2000, 4000, 10000])
// benchmark(mapOnly, [500, 1000, 2000, 4000, 10000])
// benchmark(insertOnly, [500, 1000, 2000, 4000, 10000])
// benchmark(insertAndMapOnce, [1000, 10000, 100000])
benchmark(insertAndMapTwice, [1000, 10000, 100000])
//benchmark(insertAndMapInBatches, [1000, 10000, 100000])

// timeContinuousInsertionBatches(100000)
// timeChunkedInsertionBatches(100)
```

## Observations

#### 1. A single big change is faster than lots of small changes
