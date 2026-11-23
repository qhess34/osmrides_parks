// Données du jeu écrites par l'éditeur T2Z (editor/, docs/ARCHITECTURE.md D1-D3) : priorité sur SITE (sites/<site>.js).
// Le corps est du JSON strict : à modifier de préférence avec l'éditeur (docker compose up -d, http://127.0.0.1:8787/).
const GAME = {
  "barriers": {
    "entry": {
      "x": 18.76,
      "z": 27.92,
      "a": {
        "ang": 49.5,
        "len": 1.96
      },
      "b": {
        "ang": 132.4,
        "len": 1.77
      }
    },
    "fork:boucle nord:fork1": {
      "x": -2.9,
      "z": 51,
      "a": {
        "ang": -29.7,
        "len": 2.24
      },
      "b": {
        "ang": -156.2,
        "len": 2.2
      }
    }
  },
  "controlRooms": [
    {
      "id": "poste",
      "x": 2.88,
      "z": 8.84,
      "angle": 88.2,
      "w": 2.88,
      "d": 1.21,
      "main": true
    }
  ],
  "boardAreas": [
    {
      "id": "quai",
      "pts": [
        [
          -1.67,
          10.08
        ],
        [
          -2.35,
          -7.75
        ],
        [
          -6.61,
          -7.6
        ],
        [
          -6.53,
          -0.41
        ],
        [
          -9,
          -0.29
        ],
        [
          -8.89,
          0.56
        ],
        [
          -6.6,
          0.46
        ],
        [
          -6.06,
          10.04
        ]
      ]
    }
  ],
  "board": {
    "depth": 2.13
  }
};
