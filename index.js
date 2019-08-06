// Profile: N push() operations

const util = require('util')
const Automerge = require('automerge')
const uuid = require('uuid')

const record = {
  first: 'Herb',
  last: 'Caudill',
  email: 'herb@devresults.com',
  company: 'DevResults',
  address: {
    street: 'Carrer de València',
    houseNumber: '293',
    floor: 3,
    door: 2,
    postalCode: '08009',
    city: 'Barcelona',
    country: 'es',
  },
}

function profileNumInserts(N) {
  let start
  let doc = Automerge.from({
    list: [],
    map: {},
  })

  console.log(`Inserting ${N} records`)

  start = new Date()
  for (let i = 0; i < N; i++) {
    const id = uuid()
    const r = { id, ...record }
    doc = Automerge.change(doc, `${i}`, doc => {
      doc.list.push(id)
      doc.map[id] = r
    })
  }

  const duration = new Date() - start
  const durationPerRecord = Math.round(duration / N, 1)
  const docinspection = util.inspect(doc, { showHidden: true, maxArrayLength: null })
  const docSize = Math.floor(docinspection.length / 1024)
  const docSizePerRecord = Math.floor(docinspection.length / N)

  console.log(`Took: ${duration} ms (${durationPerRecord} ms/record)`)
  console.log(`Size of doc: ${docSize} Kb (${docSizePerRecord} B/record)`)

  console.log('\n---\n')
}

profileNumInserts(100)
profileNumInserts(200)
profileNumInserts(500)
profileNumInserts(1000)
profileNumInserts(2000)
profileNumInserts(4000)
