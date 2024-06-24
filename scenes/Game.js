// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  init() {
    

  }

  preload() {
    this.load.tilemapTiledJSON("Proyecto", "./assets/ProyectoMapaJuego.json");
    this.load.image("espacio", "./assets/A&Mu Game atlas esenario.3.png");
    this.load.atlas("robot", "./assets/spritesheet.png", "./assets/spritesheet.json");

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {

    //this.cursors = this.input.keyboard.createCursorKeys();

    this.collectibles = this.physics.add.group();

    const map = this.make.tilemap({ key:"Proyecto" });

    const tiles = map.addTilesetImage("escenario", "espacio");

    const LayerAbajo = map.createLayer("piso", tiles, 0, 0);

    const LayerArriba = map.createLayer("paredes", tiles, 0, 0);

    LayerArriba.setCollisionByProperty({ coliders: true })

    const robot = this.physics.add.sprite(628, 428, "robot").setScale(0.2);
    this.physics.add.collider(robot, LayerArriba);

    const debugGraphics = this.add.graphics().setAlpha(0.75);
    LayerArriba.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39 ,37 ,255 )
    });

    this.anims.create({
      key: "robot-run-side(left)",
      frames: this.anims.generateFrameNames("robot", { start: 0 , end: 2 , prefix:".A&Mu-robot-run-left-0", suffix:".png"}),
      frameRate: 15
    });

    this.anims.create({
      key: "robot-run-side(right)",
      frames: this.anims.generateFrameNames("robot", { start: 0 , end: 2 , prefix:".A&Mu-robot-run-right-0", suffix:".png"}),
      frameRate: 15

      
    });

    this.anims.create({
      key: "robot-run-below",
      frames: [{ key:"robot", frame:".A&Mu-robot-run-below-01.png"}]
    });
    
    this.anims.create({
      key: "robot-run-up",
      frames: [{ key:"robot", frame:".A&Mu-robot-run-up-00.png"}]
    });

    this.anims.create({
      key: "robot-idle-",
      frames: [{ key:"robot", frame:".A&Mu-robot-run-below-00.png"}]
    });
  }

  update() {

    this.createCursorKeys();
    
    
  }

  createCursorKeys(){
    const speed = 100;
    
    if(!this.cursors || !this.robot){
      return
    }
    if (this.cursors.left?.isDown) {
      this.robot.setVelocity(-speed, 0);
      this.robot.anims.play("robot-run-side(left)", true);
    } else if (this.cursors.right?.isDown) {
      this.robot.setVelocity(speed, 0);
      this.robot.anims.play("robot-run-side(right)", true);
    } else if (this.cursors.up?.isDown) {
      this.robot.setVelocity(0, -speed);
      this.robot.anims.play("robot-run-up", true);
    } else if (this.cursors.down?.isDown) {
      this.robot.setVelocity(0, speed);
      this.robot.anims.play("robot-run-below", true);
   } else {
      this.robot.setVelocity(0, 0);
      const currentDirection = this.robot.anims.currentAnims?.key;
      if (currentDirection) {
        const direction = currentDirection.split("-")[2];
        this.robot.anims.play(`robot-idle-${direction}`, true);
      }
    }
  };
}
