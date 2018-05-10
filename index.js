// Profile: N push() operations

const util = require('util')
const Automerge = require('automerge')

function profileNumInserts(numInserts)
{
  let start, duration
  let doc = Automerge.init()
  doc = Automerge.change(doc, '', doc => {
    doc.x = []
  })
  
  console.log(`Profiling ${numInserts} Inserts.`)

  start = new Date()
  for (let i = 0; i < numInserts; i++) {
    doc = Automerge.change(doc, '', doc => {
      doc.x.push(i)
    })  
  }
  duration = (new Date()) - start
  console.log(`Took: ${duration}ms.`)
  
  console.log(`Profiling ${numInserts} with regular array.push().`)
  let x = []
  start = new Date()
  for (let i = 0; i < numInserts; i++) {
    x.push(i)
  }
  duration = (new Date()) - start
  console.log(`Took: ${duration}ms.`)
  
  const docinspection = util.inspect(doc, {showHidden: true, maxArrayLength: null})
  const xInspection = util.inspect(x, {showHidden: true, maxArrayLength: null})
  
  console.log(`Size of doc: ${docinspection.length} bytes.`)
  console.log(`Size of regular array: ${xInspection.length} bytes.`)
  console.log('\n---\n')
}

profileNumInserts(1)
profileNumInserts(10)
profileNumInserts(100)
profileNumInserts(1000)
profileNumInserts(10000)
