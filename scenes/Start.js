export default class Start extends Phaser.Scene {
    constructor() {
      super("Start");
    }
  
    create() {
      // Add background or other visual elements for the start scene
      this.add.text(800, 300, 'A&Mu', { fontSize: '32px', fill: '#fff' }).setOrigin(1);
      this.add.text(400, 400, 'Start', { fontSize: '24px', fill: '#fff' }).setOrigin(1);
  
      // Listen for keyboard events to start the game
      this.input.keyboard.on('keydown', () => {
        this.scene.start('Game'); // Start the game scene when any key is pressed
      });
    }
  }