// Profile: N push() operations

const util = require('util')
const Automerge = require('automerge')
const uuid = require('uuid')

const record = {
  first: 'Herb',
  last: 'Caudill',
}

console.clear()

const benchmark = (fn, iterations) => {
  console.log()
  console.log(fn.name)
  console.log(''.padStart(fn.name.length, '-'))
  iterations.forEach(N => {
    doc = Automerge.from({
      list: [],
      map: {},
    })

    const start = new Date()

    try {
      fn(N, doc)
      const time = new Date() - start
      const timePerRecord = Math.floor((time * 10) / N) / 10
      console.log({ N, time, timePerRecord })
    } catch (err) {
      console.log({ N, err: err.toString().split('\n')[0] })
    }
  })
  console.log('\n')
}

benchmark(
  function insertAndMap(N, doc) {
    for (let i = 0; i < N; i++) {
      const id = uuid()
      const r = { id, ...record }
      doc = Automerge.change(doc, `${i}`, d => {
        d.list.push(id)
        d.map[id] = r
      })
    }
  },
  [100, 500, 1000, 2000, 4000, 10000]
)

benchmark(
  function mapOnly(N, doc) {
    for (let i = 0; i < N; i++) {
      const id = uuid()
      const r = { id, ...record }
      doc = Automerge.change(doc, `${i}`, d => {
        d.map[id] = r
      })
    }
  },
  [100, 500, 1000, 2000, 4000, 10000]
)

benchmark(
  function insertOnly(N, doc) {
    for (let i = 0; i < N; i++) {
      const id = uuid()
      const r = { id, ...record }
      doc = Automerge.change(doc, `${i}`, d => {
        d.list.push(r)
      })
    }
  },
  [1000, 10000, 20000, 40000, 100000]
)

benchmark(
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
  },
  [1000, 2000, 4000, 10000, 20000, 40000]
)

benchmark(
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
  },
  [100, 1000, 5000, 10000, 20000, 40000]
)
