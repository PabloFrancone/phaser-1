// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  init() {
    

  }

  preload() {
    this.load.image("fondo", "./public/assets/ .imagen. ");

  }

  create() {

this.sky = this.add.image(400, 300, "fondo");
this.sky.setScale(2);

this.platforms = this.physics.add.staticGroup();

this.platforms.create(400, 568, "platform").setScale(2).refreshBody();

this.platforms.create(200, 400, "platform");

this.character = this.physics.add.sprite(400, 300, "character");
this.character.setScale(0.1);
this.character.setCollideWorldBounds(true);

this.physics.add.collider(this.character, this.platforms);

this.cursors = this.input.keyboard.createCursorKeys();

this.collectibles = this.physics.add.group();

this.time.addEvent({
  delay: 1000,
  callback: this.onSecond,
  callbackScope: this,
  loop: true,
});
  }

  update() {
 
  }
}
