import Game from "./scenes/Game.js";
import Start from "./scenes/Start.js";
// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 1600,
  height: 1000, // Altura válida
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH, // Centra la imagen
    min: {
      width: 900,
      height: 700,
    },
    max: {
      width: 1000,
      height: 500,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true
    },
  },

  scene: [Start,Game],
};


window.game = new Phaser.Game(config);
