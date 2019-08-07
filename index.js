const { benchmark } = require('./benchmark')

const util = require('util')
const Automerge = require('automerge')
const uuid = require('uuid')

const record = { first: 'Herb', last: 'Caudill' }

console.clear()

benchmark(insertAndMap, [500, 1000, 2000, 4000, 10000])
benchmark(mapOnly, [500, 1000, 2000, 4000, 10000])
benchmark(insertOnly, [500, 1000, 2000, 4000, 10000])
benchmark(insertAndMapOnce, [1000, 10000, 100000])
benchmark(insertAndMapTwice, [1000, 10000, 100000])
benchmark(insertAndMapInBatches, [1000, 10000, 100000])

timeContinuousInsertionBatches(100000)
timeChunkedInsertionBatches(100)

/**
 * Creates N records one by one, adds each one's ID to a list and each record to a map of records by ID
 *
 * Results:
 * ```js
 * { N: 500, time: 1136, timePerRecord: 2.2 }
 * { N: 1000, time: 2563, timePerRecord: 2.5 }
 * { N: 2000, time: 9663, timePerRecord: 4.8 }
 * { N: 4000, time: 42801, timePerRecord: 10.7 }
 * { N: 10000, time: 303545, timePerRecord: 30.3 }
 * ```
 */
function insertAndMap(N, doc) {
  for (let i = 0; i < N; i++) {
    const id = uuid()
    const r = { id, ...record }
    doc = Automerge.change(doc, `${i}`, d => {
      d.list.push(id)
      d.map[id] = r
    })
  }
}

/**
 * Creates N records one by one, adds each to a map of records by ID
 *
 * Results:
 * ```js
 * { N: 500, time: 501, timePerRecord: 1 }
 * { N: 1000, time: 1858, timePerRecord: 1.8 }
 * { N: 2000, time: 10436, timePerRecord: 5.2 }
 * { N: 4000, time: 34048, timePerRecord: 8.5 }
 * { N: 10000, time: 291120, timePerRecord: 29.1 }
 * ```
 */
function mapOnly(N, doc) {
  for (let i = 0; i < N; i++) {
    const id = uuid()
    const r = { id, ...record }
    doc = Automerge.change(doc, `${i}`, d => {
      d.map[id] = r
    })
  }
}

/**
 * Creates N records one by one, adds each to a list
 *
 * Results:
 * ```js
 * { N: 500, time: 728, timePerRecord: 1.4 }
 * { N: 1000, time: 1645, timePerRecord: 1.6 }
 * { N: 2000, time: 5648, timePerRecord: 2.8 }
 * { N: 4000, time: 19114, timePerRecord: 4.7 }
 * { N: 10000, time: 162307, timePerRecord: 16.2 }
 * ```
 */
function insertOnly(N, doc) {
  for (let i = 0; i < N; i++) {
    const id = uuid()
    const r = { id, ...record }
    doc = Automerge.change(doc, `${i}`, d => {
      d.list.push(r)
    })
  }
}

/**
 * Creates a large object and uses it to initialize a document all at once.
 *
 * Results:
 * ```js
 * { N: 1000, time: 627, timePerRecord: 0.6 }
 * { N: 10000, time: 2202, timePerRecord: 0.2 }
 * { N: 100000, time: 28931, timePerRecord: 0.2 }
 * // N: 500000 -> JS heap out of memory
 * ```
 */
function insertAndMapOnce(N, doc) {
  const list = []
  const map = {}
  for (let i = 0; i < N; i++) {
    const id = uuid()
    const r = { id, ...record }
    list.push(id)
    map[id] = r
  }
  doc = Automerge.from({ list, map })
}

/**
 * Creates a large object and uses it to initialize a document all at once, then clears everything out, then
 * adds it again.
 *
 * Results:
 * ```js
 * { N: 1000, time: 734, timePerRecord: 0.7 }
 * { N: 10000, time: 2291, timePerRecord: 0.2 }
 * { N: 100000, time: 30501, timePerRecord: 0.3 }
 * // N: 500000 -> JS heap out of memory
 * ```
 */
function insertAndMapTwice(N, doc) {
  const list = []
  const map = {}
  for (let i = 0; i < N; i++) {
    const id = uuid()
    const r = { id, ...record }
    list.push(id)
    map[id] = r
  }
  doc = Automerge.from({ list, map })
  doc = Automerge.change(doc, d => ({ list: [], map: {} }))
  doc = Automerge.change(doc, d => ({ list, map }))
}

/**
 * Breaks N records into multiple medium-sized batches and adds one batch at a time.
 *
 * Results:
 * ```js
 * { N: 1000, time: 1018, timePerRecord: 1 }
 * { N: 10000, time: 12243, timePerRecord: 1.2 }
 * // N: 100000 -> JS heap out of memory
 * ```
 */
function insertAndMapInBatches(N, doc) {
  const list = []
  const map = {}
  const batchSize = 7777
  let t = 0
  while (t < N) {
    for (let i = 0; i < batchSize && t < N; i++) {
      const id = uuid()
      const r = { id, ...record }
      list.push(id)
      map[id] = r
      t += 1
    }
    doc = Automerge.change(doc, d => {
      d.list = [...d.list, ...list]
      d.map = { ...d.map, ...map }
    })
  }
}

/**
 * Inserts a large number of records one by one, timing each successive batch of 1000 records.
 *
 * Results: http://docs.google.com/spreadsheets/d/1tOJDy9f0MFoD1L1GUZVh9G74UVkqto88q48EwMBrCC8/edit#gid=0
 */
function timeContinuousInsertionBatches(N, doc = Automerge.from({ list: [] })) {
  const batch = 1000
  let start = new Date()
  for (let i = 0; i < N; i++) {
    doc = Automerge.change(doc, `${i}`, d => d.list.push(i))
    if (i > 0 && i % batch === 0) {
      const time = new Date() - start
      console.log({ size: i - batch, time })
      start = new Date()
    }
  }
}

/**
 * Inserts 100 chunks of 1000 records each, timing each chunk
 *
 * Results: https://docs.google.com/spreadsheets/d/1tOJDy9f0MFoD1L1GUZVh9G74UVkqto88q48EwMBrCC8/edit#gid=440903324
 */
function timeChunkedInsertionBatches(N, doc = Automerge.from({ list: [] })) {
  const batch = 1000
  for (let i = 0; i < N; i++) {
    let start = new Date()
    const time = new Date() - start
    doc = Automerge.change(doc, s => {
      const newIds = Array(batch)
        .fill(0)
        .map((d, j) => i * batch + j)
      for (id of newIds) s.list.push(id)
    })
  }
}
