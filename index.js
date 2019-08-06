// Profile: N push() operations

const util = require('util')
const Automerge = require('automerge')
const uuid = require('uuid')

const record = {
  first: 'Herb',
  last: 'Caudill',
}

let doc = Automerge.from({
  list: [],
  map: {},
})

const benchmark = (fn, iterations) => {
  console.log()
  console.log(fn.name)
  console.log('----------------')
  iterations.forEach(N => {
    doc = Automerge.from({
      list: [],
      map: {},
    })

    const start = new Date()

    fn(N)
    const time = new Date() - start
    const timePerRecord = Math.floor(time / N)
    console.log({ N, time, timePerRecord })
  })
  console.log('\n')
}

const insertAndMap = N => {
  for (let i = 0; i < N; i++) {
    const id = uuid()
    const r = { id, ...record }
    doc = Automerge.change(doc, `${i}`, d => {
      d.list.push(id)
      d.map[id] = r
    })
  }
}
benchmark(insertAndMap, [100, 500, 1000, 2000, 3000])

const insertOnly = N => {
  for (let i = 0; i < N; i++) {
    const id = uuid()
    const r = { id, ...record }
    doc = Automerge.change(doc, `${i}`, d => {
      d.list.push(id)
    })
  }
}
benchmark(insertOnly, [1000, 2000, 3000, 4000])
