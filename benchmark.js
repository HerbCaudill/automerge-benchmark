const Automerge = require('automerge')
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
exports.benchmark = benchmark
