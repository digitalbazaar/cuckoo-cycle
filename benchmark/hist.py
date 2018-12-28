#!/usr/bin/env python

"""Show histogram for equihash benchmark data."""

import sys
import numpy as np
import matplotlib.pyplot as plt


def plot():
    """Plot data"""
    # rng = np.random.RandomState(10)  # deterministic random data
    # a = np.hstack((rng.normal(size=1000),
    #   rng.normal(loc=5, scale=2, size=1000)))
    filename = sys.argv[1]
    bins = 20
    if len(sys.argv) == 3:
        bins = int(sys.argv[2])

    data = np.loadtxt(filename, delimiter=',', usecols=(2))
    # arguments are passed to np.histogram
    plt.hist(data, bins)
    plt.title(filename + " histogram")
    plt.show()


plot()
