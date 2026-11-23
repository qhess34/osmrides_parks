// Données du jeu écrites par l'éditeur T2Z (editor/, docs/ARCHITECTURE.md D1-D3) : priorité sur SITE (lieux/<type>/<lieu>/<el>.js).
// Le corps est du JSON strict : à modifier de préférence avec l'éditeur (docker compose up -d, http://127.0.0.1:8787/).
const GAME = {
  "barriers": {
    "entry": {
      "x": 57.01,
      "z": 14.7,
      "a": {
        "ang": 113.3,
        "len": 1.06
      },
      "b": {
        "ang": -160.3,
        "len": 1.08
      }
    },
    "fork:boucle nord:fork0": {
      "x": 0.66,
      "z": -11.51,
      "a": {
        "ang": 57.3,
        "len": 0.89
      },
      "b": {
        "ang": 147.7,
        "len": 0.98
      }
    },
    "fork:boucle nord:fork1": {
      "x": 3.32,
      "z": -12.04,
      "a": {
        "ang": 140.6,
        "len": 1.07
      },
      "b": {
        "ang": 43,
        "len": 1
      }
    }
  },
  "controlRooms": [
    {
      "id": "poste",
      "x": 2.13,
      "z": 6.84,
      "angle": -138.1,
      "w": 3.75,
      "d": 1.7,
      "main": true
    }
  ],
  "board": {
    "depth": 1.86
  },
  "boardAreas": [
    {
      "id": "quai",
      "pts": [
        [
          4.36,
          3.92
        ],
        [
          -3.83,
          -3.19
        ],
        [
          -0.78,
          -6.65
        ],
        [
          1.9,
          -3.76
        ],
        [
          2.58,
          -3.68
        ],
        [
          3.22,
          -2.92
        ],
        [
          3.36,
          -2.44
        ],
        [
          6.87,
          0.91
        ]
      ]
    }
  ],
  "site": {
    "kind": "bob",
    "car": {
      "len": 1.55,
      "n": 7,
      "seats": 2
    },
    "trains": [
      {
        "name": "Train 1",
        "col": "#d8a92a",
        "col2": "#2a2a2c",
        "wear": 28
      },
      {
        "name": "Train 2",
        "col": "#d8a92a",
        "col2": "#2a2a2c",
        "wear": 44,
        "lane": 1
      },
      {
        "name": "Train 3",
        "col": "#d8a92a",
        "col2": "#2a2a2c",
        "wear": 36,
        "lane": 2
      },
      {
        "name": "Train 4",
        "col": "#d8a92a",
        "col2": "#2a2a2c",
        "wear": 52,
        "lane": 3
      },
      {
        "name": "Train 5",
        "col": "#d8a92a",
        "col2": "#2a2a2c",
        "wear": 20,
        "lane": 4
      },
      {
        "name": "Train 6",
        "col": "#d8a92a",
        "col2": "#2a2a2c",
        "wear": 60,
        "lane": 5
      }
    ],
    "trough": {
      "lo": [
        112,
        38,
        36
      ],
      "hi": [
        140,
        52,
        46
      ],
      "edge": "#5a1f1c",
      "deck": "#6e2622",
      "rim": "#b8322c",
      "shine": "rgba(255,220,210,.12)"
    },
    "phys": {
      "roll": 0.13,
      "drag": 0.0016,
      "vmin": 3
    }
  }
};
