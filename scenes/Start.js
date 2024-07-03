export default class Start extends Phaser.Scene {
    constructor() {
      super("Start");
    }
    preload () {
      this.load.audio('startMusic', ['./assets/audio/start_music.mp3', './assets/audio/start_music.opus']);

    }
    create() {
     
      this.startMusic = this.sound.add('startMusic', { loop: true });
      this.startMusic.volume = 2;
      this.startMusic.play();
      // Add background or other visual elements for the start scene
      this.add.text(800, 300, 'A&Mu', { fontSize: '32px', fill: '#fff' }).setOrigin(1.3);
      this.add.text(800, 800, 'Start', { fontSize: '24px', fill: '#fff' }).setOrigin(1.2);
  
      // Listen for keyboard events to start the game
      this.input.keyboard.on('keydown', () => {
        this.scene.start('Game'); // Start the game scene when any key is pressed
        this.startMusic.stop();;
      });
    }
  }