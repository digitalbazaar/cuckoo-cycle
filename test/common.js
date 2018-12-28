const Long = require('long');

const api = {};
module.exports = api;

function str2edges(str) {
  return str.split(' ').map(x => Long.fromString(x, true, 16).low);
}

// 1x : easiest difficulty
api.DIFFICULTY_1X = Buffer.allocUnsafe(32).fill(0xFF);
api.DIFFICULTY_MIN = api.DIFFICULTY_1X;
// 2x : one leading zero bit
api.DIFFICULTY_2X = Buffer.from(api.DIFFICULTY_MIN);
api.DIFFICULTY_2X[0] = 0x7F;
// 4x : two leading zero bits
api.DIFFICULTY_4X = Buffer.from(api.DIFFICULTY_MIN);
api.DIFFICULTY_4X[0] = 0x3F;
// 8x : three leading zero bits
api.DIFFICULTY_8X = Buffer.from(api.DIFFICULTY_MIN);
api.DIFFICULTY_8X[0] = 0x1F;
// 16x : four leading zero bits
api.DIFFICULTY_16X = Buffer.from(api.DIFFICULTY_MIN);
api.DIFFICULTY_16X[0] = 0x0F;
// hardest difficulty (just shy of impossible!)
api.DIFFICULTY_MAX = Buffer.allocUnsafe(32).fill(0x00);
api.DIFFICULTY_16X[31] = 0x01;

api.tests = {
  cuckoo_g20_sh24_1: {
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 38,
      edges: str2edges(
        '21ce 5240 d304 d34c f756 faf5 16c9f 1a349 ' +
        '1d3d9 2096a 22036 2589b 2e2ed 2eb40 2fb3c 376fd ' +
        '37740 393c0 3ad29 3cf04 3f365 41fe2 43a29 454eb ' +
        '4cf13 4d12c 535ed 57d03 60e81 68fd1 6902f 69408 ' +
        '6c2f1 728c8 73e0e 76589 7a037 7adcb 7c4b8 7d746 ' +
        '7eae0 7fe67')
    }
  },
  cuckatoo_g20_sh24_1: {
    variant: 'cuckatoo',
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 68,
      edges: str2edges(
        '6330 6fc9 a191 a9f2 b847 e22a ed86 11ee8 ' +
        '12c42 1a7da 1b479 1c032 27a88 29dee 2b5c1 2c03c ' +
        '2ea3a 30440 31827 397a1 3f561 40979 42995 42e05 ' +
        '42fd5 47e43 4dbec 5108e 512de 5203b 56793 5d269 ' +
        '5fd3c 60a06 65942 6bdea 6d92a 6f1d6 71797 757c5 ' +
        '782e3 7edb4')
    }
  },

  cuckoo_g20_sh25_1: {
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    sipHash: 'SipHash-2-5',
    solution: {
      nonce: 57,
      edges: [
        4929, 10568, 18146, 19446, 23244, 27221, 37213, 45384,
        46731, 54141, 61819, 67234, 68919, 81300, 108640, 120278,
        138321, 148672, 156560, 156850, 195518, 216670, 224925, 228393,
        232756, 246875, 247723, 254351, 256610, 265051, 274802, 277819,
        286785, 321606, 321877, 327732, 347322, 364364, 365793, 384565,
        453105, 481276
      ]
    }
  },
  cuckatoo_g20_sh25_1: {
    variant: 'cuckatoo',
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    sipHash: 'SipHash-2-5',
    solution: {
      nonce: 9,
      edges: [
        7866, 44502, 49255, 53680, 67697, 85982, 86534, 144485,
        153577, 162992, 167952, 204206, 212258, 252422, 263580, 264269,
        270301, 271752, 280975, 287370, 302300, 313220, 334187, 357809,
        361681, 366001, 372257, 383098, 388543, 404059, 409598, 411859,
        415967, 420671, 432653, 436594, 448819, 467143, 491692, 498645,
        504665, 509683
      ]
    }
  },

  cuckoo_g20_sh24_1_d8x: {
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 1161,
      edges: [
        43430, 46071, 47271, 93403, 102567, 121073, 125064, 136278,
        166297, 173834, 174425, 184537, 185311, 194348, 197675, 213856,
        216114, 220312, 225475, 254695, 296142, 298488, 313118, 313238,
        326604, 331834, 335005, 344297, 351187, 352389, 359278, 396571,
        404936, 459959, 469052, 473636, 479297, 489753, 507677, 513560,
        520463, 522487
      ]
    },
    difficulty: api.DIFFICULTY_8X
  },
  cuckatoo_g20_sh24_1_d8x: {
    variant: 'cuckatoo',
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 781,
      edges: [
        19850, 27932, 33253, 44285, 71260, 77393, 77829, 79965,
        91078, 92963, 101085, 112022, 125192, 129569, 139485, 166472,
        170093, 187005, 204895, 230485, 235350, 244673, 257861, 259416,
        262786, 266968, 284869, 333039, 338815, 381642, 387485, 388219,
        405747, 433158, 445510, 448144, 459896, 464454, 471036, 490717,
        491868, 504412
      ]
    },
    difficulty: api.DIFFICULTY_8X
  },

  // from: https://github.com/tromp/cuckoo/blob/master/GPU.md
  cuckoo_g30_sh24_1: {
    graphSize: 30,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 63,
      edges: str2edges(
        '23ece 27e0856 2ad8c27 2cbb0b5 3694cdd 477a095 64de6fc 64e1c92 ' +
        '68e624d 6aa4c6f 6b1d0c2 76f07d2 c273122 c2e38ed c655cde c97ba17 ' +
        'e708130 ec8890d ecb9932 f28d66d f577aff 104d8441 116de91f 116e61cb ' +
        '1178ea28 11840f8a 11ce10b0 12792630 12ae2388 140ae893 1439b9fd ' +
        '146a3047 1538d93c 176cb068 17e01c9b 1876ee0a 1c871774 1d37d976 ' +
        '1d6fa785 1d9c1669 1d9d015e 1db85f7e')
    }
  },
  // calculated from code
  cuckatoo_g30_sh24_1: {
    variant: 'cuckatoo',
    graphSize: 30,
    input: Buffer.allocUnsafe(0),
    solution: {
      nonce: 20,
      edges: [
        4762082, 10285123, 22399536, 26167171,
        38336620, 40016484, 96130898, 120468841,
        155039584, 159202103, 165697136, 171007322,
        171274657, 172546886, 175609526, 180631057,
        191140143, 196527902, 197954529, 205038650,
        223324825, 234981990, 238544028, 262764026,
        293101621, 306427402, 310980000, 337335379,
        344179616, 352670302, 369571116, 370679779,
        400794074, 403399966, 412735096, 422686907,
        425747528, 453252693, 455876781, 467118140,
        470144432, 470523050
      ]
    }
  },

  cuckoo_g20_sh24_1_c2: {
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    chainLength: 2,
    solution: [{
      nonce: 38,
      edges: [
        8654, 21056, 54020, 54092, 63318, 64245, 93343, 107337,
        119769, 133482, 139318, 153755, 189165, 191296, 195388, 227069,
        227136, 234432, 240937, 249604, 258917, 270306, 277033, 283883,
        315155, 315692, 341485, 359683, 396929, 430033, 430127, 431112,
        443121, 469192, 474638, 484745, 499767, 503243, 509112, 513862,
        518880, 523879
      ]
    }, {
      nonce: 54,
      edges: [
        5701, 16883, 30418, 42706, 44913, 53149, 59851, 71742,
        79789, 108092, 122845, 130588, 149239, 180373, 183269, 233519,
        237381, 243114, 262848, 263128, 266850, 284795, 315364, 323107,
        326110, 345497, 360895, 397738, 397963, 403588, 427214, 431288,
        442634, 459744, 463797, 473853, 500359, 507839, 514648, 521096,
        522056, 523580
      ]
    }]
  },
  cuckatoo_g20_sh24_1_c2: {
    variant: 'cuckatoo',
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
    chainLength: 2,
    solution: [{
      nonce: 68,
      edges: [
        25392, 28617, 41361, 43506, 47175, 57898, 60806, 73448,
        76866, 108506, 111737, 114738, 162440, 171502, 177601, 180284,
        191034, 197696, 202791, 235425, 259425, 264569, 272789, 273925,
        274389, 294467, 318444, 331918, 332510, 335931, 354195, 381545,
        392508, 395782, 416066, 441834, 448810, 455126, 464791, 481221,
        492259, 519604,
      ]
    }, {
      nonce: 17,
      edges: [
        17286, 23280, 32428, 34039, 35778, 40812, 79832, 132095,
        135900, 183100, 187742, 197219, 209449, 217533, 228820, 229054,
        237880, 246348, 258323, 259115, 283621, 284189, 293157, 305829,
        307060, 307520, 307665, 325227, 346414, 350101, 376317, 378693,
        379164, 383571, 390607, 399197, 422706, 436483, 448347, 451640,
        465018, 495242
      ]
    }]
  },
};

api.DEFAULT_TEST = 'cuckatoo_g20_sh24_1';

api.cloneTest = id => {
  const t = api.tests[id];
  const cloned = {
    graphSize: t.graphSize,
    input: Buffer.from(t.input),
    // solution set below
  };
  for(const key of ['variant', 'sipHash', 'chainLength']) {
    if(key in t) {
      cloned[key] = t[key];
    }
  }
  if(Array.isArray(t.solution)) {
    cloned.solution = [];
    for(const s of t.solution) {
      cloned.solution.push({
        nonce: s.nonce,
        edges: Array.from(s.edges)
      });
    }
  } else {
    cloned.solution = {
      nonce: t.solution.nonce,
      edges: Array.from(t.solution.edges)
    };
  }
  if('difficulty' in t) {
    cloned.difficulty = Buffer.from(t.difficulty);
  }
  return cloned;
};
