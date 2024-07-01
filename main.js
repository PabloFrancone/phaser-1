import Game from "./scenes/Game.js";

// Create a new Phaser config object
const config = {
  type: Phaser.AUTO,
  width: 1500,
  height: 1000,
  scale: {
    mode: Phaser.Scale.FIT,
    
    min: {
      width: 1000,
      height: 800,
    },
    max: {
      width: 2600,
      height: 800,
    },
  },
  physics: {
    default: "arcade",
    arcade: {
      debug: false
    },
  },

  scene: [Game],
};


window.game = new Phaser.Game(config);
