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
  g20_1: {
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
  g20_sh25_1: {
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
  g20_1_d8x: {
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
  // from: https://github.com/tromp/cuckoo/blob/master/GPU.md
  g30_1: {
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
  g20_1_c2: {
    graphSize: 20,
    input: Buffer.allocUnsafe(0),
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
      nonce: 22,
      edges: [
        11265, 34846, 37576, 51372, 53471, 63204, 76088, 97265,
        118417, 119341, 123817, 125374, 196503, 198206, 200054, 209736,
        212403, 223034, 238733, 251033, 255919, 259397, 265605, 271915,
        278522, 282658, 319130, 319899, 332825, 352211, 357379, 368148,
        399013, 405042, 418773, 433177, 462889, 471937, 475930, 504059,
        506109, 518786
      ]
    }]
  },
};

api.DEFAULT_TEST = 'g20_1';

api.cloneTest = id => {
  const t = api.tests[id];
  const cloned = {
    graphSize: t.graphSize,
    input: Buffer.from(t.input),
    // solution set below
  };
  if('sipHash' in t) {
    cloned.sipHash = t.sipHash;
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
