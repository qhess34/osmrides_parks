// Données du jeu écrites par l'éditeur T2Z (editor/, docs/ARCHITECTURE.md D1-D3) : priorité sur SITE (sites/<site>.js).
// Le corps est du JSON strict : à modifier de préférence avec l'éditeur (docker compose up -d, http://127.0.0.1:8787/).
const GAME = {
  "barriers": {
    "entry": {
      "x": 37.06,
      "z": 27.34,
      "a": {
        "ang": 34.1,
        "len": 1.02
      },
      "b": {
        "ang": 119.1,
        "len": 1.06
      }
    },
    "fork:boucle ouest:fork0": {
      "x": -15,
      "z": 56.82,
      "a": {
        "ang": -1.1,
        "len": 1.9
      },
      "b": {
        "ang": 85.7,
        "len": 1.59
      }
    },
    "fork:boucle ouest:fork1": {
      "x": -15.2,
      "z": 56.43,
      "a": {
        "ang": 0,
        "len": 2.2
      },
      "b": {
        "ang": -85.7,
        "len": 1.59
      }
    }
  },
  "boardAreas": [
    {
      "id": "quai",
      "pts": [
        [
          -14.43,
          -5.53
        ],
        [
          -9.18,
          -16.76
        ],
        [
          -11.31,
          -17.75
        ],
        [
          -14.29,
          -11.09
        ],
        [
          -16.25,
          -11.79
        ],
        [
          -17.15,
          -12.21
        ],
        [
          -19.43,
          -7.91
        ],
        [
          -16.55,
          -6.53
        ]
      ]
    }
  ]
};
