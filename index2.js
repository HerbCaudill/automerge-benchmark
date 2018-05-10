// Profile: Push array with N items in a single operation.

const util = require('util')
const Automerge = require('automerge')

function profileNumInserts2(numInserts)
{
  let start, duration
  let doc = Automerge.init()

  let x = []
  start = new Date()
  for (let i = 0; i < numInserts; i++) {
    x.push(i)
  }

  doc = Automerge.change(doc, '', doc => {
    doc.x = []
  })
  
  console.log(`Profiling ${numInserts} Inserts as single object.`)

  start = new Date()
  doc = Automerge.change(doc, '', doc => {
    doc.x = x
  })  
  duration = (new Date()) - start
  console.log(`Took: ${duration}ms.`)
  
  const docinspection = util.inspect(doc, {showHidden: true, maxArrayLength: null})
  
  console.log(`Size of doc: ${docinspection.length} bytes.`)
  console.log('\n---\n')
}

profileNumInserts2(1)
profileNumInserts2(10)
profileNumInserts2(100)
profileNumInserts2(1000)
profileNumInserts2(10000)
