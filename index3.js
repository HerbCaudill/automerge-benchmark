// Profile: set N keys
// As suggested by @pvh
// https://github.com/automerge/automerge/issues/89#issuecomment-387883317

const util = require('util')
const Automerge = require('automerge')

function profileNumInserts(numInserts)
{
  let start, duration
  let doc = Automerge.init()
  doc = Automerge.change(doc, '', doc => {
    doc.x = []
  })
  
  console.log(`Profiling ${numInserts} key sets.`)

  start = new Date()
  for (let i = 0; i < numInserts; i++) {
    doc = Automerge.change(doc, '', doc => {
      doc[`key${i}`] = true
    })  
  }
  duration = (new Date()) - start
  console.log(`Took: ${duration}ms.`)
  
  console.log(`Profiling ${numInserts} key sets on regular object`)
  let x = {}
  start = new Date()
  for (let i = 0; i < numInserts; i++) {
    x[`key${i}`] = true
  }
  duration = (new Date()) - start
  console.log(`Took: ${duration}ms.`)
  
  const docinspection = util.inspect(doc, {showHidden: true, maxArrayLength: null})
  const xInspection = util.inspect(x, {showHidden: true, maxArrayLength: null})
  
  console.log(`Size of doc: ${docinspection.length} bytes.`)
  console.log(`Size of regular object: ${xInspection.length} bytes.`)
  console.log('\n---\n')
}

profileNumInserts(1)
profileNumInserts(10)
profileNumInserts(100)
profileNumInserts(1000)
profileNumInserts(10000)
