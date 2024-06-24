import Game from "./scenes/Game.js";

// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 2500,
  height: 2000,
  scale: {
    mode: Phaser.Scale.FIT,
    
    min: {
      width: 1000,
      height: 1000,
    },
    max: {
      width: 2600,
      height: 2200,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: true
    },
  },

  scene: [Game],
};


window.game = new Phaser.Game(config);
