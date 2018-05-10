# Automerge: simple profiling spike

## N push() operations

__File:__ index.js

Pushes incremental numbers to an array in a document via the `change()` method.

Timings (on my MacBook) ranged from 6ms for 1 push to 43.75 seconds for 10,000. 100 pushes took 175ms and 1,000 took 1.345 seconds.

The storage requirements (tested very roughly using `util.inspect` to flatten the object, including all hidden fields) also seem to follow a similar curve. A single insert took up 3,557 bytes (size of original object: 18 bytes), 10: ~17KB, 100: ~160KB, 1,000: ~1.6MB, and the array with 10,000 numbers took up ~ 16MB (size of original object: ~80 bytes). My testing methodology doesn’t necessarily reflect the actual amount of space these objects would take up either in memory or on the file system. (See alt tests, below.)

It does look like the system would result in a sluggish interface on operations on an array with ~100 items or so.

##  Push array with N items in a single operation

__File:__ index2.js

This time, instead of testing, say, 10,000 pushes to an array, I wanted to test a single change to the object where an array with 10,000 items is added.

The results I got mirror those of the first scenario.

The timings seem to follow a similar curve at first but the results I got for the array with 10,000 items was ~3x slower at ~115 seconds vs ~43 seconds using the first technique.

## Set N keys

__File:__ index3.js

When I posted my initial results from the tests above [on the Automerge issue tracker](https://github.com/automerge/automerge/issues/89), [@pvh](https://github.com/pvh) suggested that I also try setting object keys.

The timing results are generally about the same as with the push() example.

However, there is a ~2x improvement over storage requirements.

## Alternative means to calculating storage requirements

__Files:__ index1-alt.js, index2-alt.js, index3-alt.js

On the issue trackers, [@j-f1](https://github.com/j-f1) recommended that I try  `Automerge.save(doc).length` instead of `util.inspect(doc, {showHidden: true, maxArrayLength: null}).length` to calculate the approximate memory/storage requirements. The former returns a lossless string serialisation of the Automerge document in a more concise format than the latter.

The former method returns results that are 3-5x smaller than the latter method.

The “truth” probably lies somewhere in the middle and closer to one or the other depending on whether we are looking at storage (which will match the former over the wire) or memory use (which will be closer to the latter). None of this takes into account any compression that may be applied at the storage/memory level.

The next step is to profile these in the browser so we can see actual memory usage.