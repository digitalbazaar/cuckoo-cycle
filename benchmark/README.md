Cuckoo Cycle Engine Benchmarks
==============================

nonce histogram
---------------

In the engine dir, generate data with something like:

    $ DATADIR=`pwd`/tmp node benchmark/nonces.js

To show all final outputs:

    $ for f in tmp/{timestamp}-*-last.csv; do (../cuckoo-cycle/benchmark/hist.py $f 20 &); done
