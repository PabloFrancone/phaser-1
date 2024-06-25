// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  preload() {
    this.load.tilemapTiledJSON("Proyecto", "./assets/ProyectoMapaJuego.json");
    this.load.tilemapTiledJSON("MapaGenerado", "./assets/MapaGenerado.json");
    this.load.image("espacio", "./assets/A&Mu-Game-atlas-esenario.3.png");
    this.load.image("enemigo", "./assets/A&Mu-Alien-MUranttt.1.png");
    this.load.image("objeto-no", "./assets/A&Mu-objets-not-breakable.png");
    this.load.image("objeto-si", "./assets/A&Mu-objets-breakable.png");
    this.load.atlas("robot", "./assets/spritesheet.png", "./assets/spritesheet.json");

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    // Crear el mapa inicial
    this.mapaActual = this.make.tilemap({ key: "Proyecto" });
    const tiles = this.mapaActual.addTilesetImage("escenario", "espacio");

    this.LayerAbajo = this.mapaActual.createLayer("piso", tiles, 0, 0);
    this.LayerArriba = this.mapaActual.createLayer("paredes", tiles, 0, 0);
    this.LayerArriba.setCollisionByProperty({ coliders: true });

    // Crear el robot
    this.robot = this.physics.add.sprite(628, 428, "robot").setScale(0.2);
    this.physics.add.collider(this.robot, this.LayerArriba);

    // Configurar la cámara
    this.cameras.main.setBounds(0, 0, this.mapaActual.widthInPixels, this.mapaActual.heightInPixels);
    this.cameras.main.startFollow(this.robot);

    // Renderizar gráficos de debug para las colisiones si es necesario
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    this.LayerArriba.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });

    // Configurar animaciones del robot
    this.configureRobotAnimations();

    // Detectar el evento de click para reanudar el contexto de audio si está suspendido
    this.input.once('pointerdown', () => {
      if (this.sound.context.state === 'suspended') {
        this.sound.context.resume();
      }
    });

    // Generar el siguiente mapa y mover el actual hacia abajo
    this.generateNextMap();
  }

  update() {
    const speed = 200;

    // Movimiento del robot con las teclas
    if (this.cursors.left.isDown) {
        this.robot.setVelocity(-speed, 0);
        this.robot.anims.play("robot-run-side(right)", true);
    } else if (this.cursors.right.isDown) {
        this.robot.setVelocity(speed, 0);
        this.robot.anims.play("robot-run-side(left)", true);
    } else if (this.cursors.up.isDown) {
        this.robot.setVelocity(0, -speed);
        this.robot.anims.play("robot-run-up", true);
    } else if (this.cursors.down.isDown) {
        this.robot.setVelocity(0, speed);
        this.robot.anims.play("robot-run-below", true);
    } else {
        this.robot.setVelocity(0, 0);
        const currentAnim = this.robot.anims.currentAnim;
        if (currentAnim && currentAnim.key) {
            const direction = currentAnim.key.split("-")[2];
            this.robot.anims.play(`robot-idle-${direction}`, true);
        } else {
            this.robot.anims.play("robot-idle-below", true);
        }
    }

    // Verificar colisiones con la capa de arriba del mapa actual
    this.physics.world.collide(this.robot, this.LayerArriba);
    
    // Verificar si el robot está cerca del borde inferior del mapa actual
    const bottomOfMap = this.LayerAbajo.tileToWorldXY(0, this.mapaActual.heightInTiles).y;
    if (this.robot.y > bottomOfMap - this.cameras.main.height / 2) {
        this.generateNextMap();
    }
  }

  configureRobotAnimations() {
    this.anims.create({
      key: "robot-idle-left",
      frames: [{ key: "robot", frame: ".A&Mu-robot-run-left-00.png" }],
      
    });

    this.anims.create({
      key: "robot-idle-right",
      frames: [{ key: "robot", frame: ".A&Mu-robot-run-right-00.png" }],
     
    });  
    this.anims.create({
      key: "robot-run-side(left)",
      frames: this.anims.generateFrameNames("robot", { start: 0, end: 2, prefix: ".A&Mu-robot-run-left-0", suffix: ".png" }),
      frameRate: 8,
      
    });

    this.anims.create({
      key: "robot-run-side(right)",
      frames: this.anims.generateFrameNames("robot", { start: 0, end: 2, prefix: ".A&Mu-robot-run-right-0", suffix: ".png" }),
      frameRate: 8,
      
    });

    this.anims.create({
      key: "robot-run-below",
      frames: [{ key: "robot", frame: ".A&Mu-robot-run-below-01.png" }],
     
    });

    this.anims.create({
      key: "robot-run-up",
      frames: [{ key: "robot", frame: ".A&Mu-robot-run-up-00.png" }],
      
    });



    this.anims.create({
      key: "robot-idle-below",
      frames: [{ key: "robot", frame: ".A&Mu-robot-run-below-00.png" }],
      
    });

    this.anims.create({
      key: "robot-idle-up",
      frames: [{ key: "robot", frame: ".A&Mu-robot-run-up-00.png" }],
     
    });
  }

  generateNextMap() {
    // Generar el siguiente mapa y mover el actual hacia abajo
    this.mapaActual = this.make.tilemap({ key: "MapaGenerado" });
    const tiles = this.mapaActual.addTilesetImage("escenario", "espacio");

    // Crear nuevas capas y configurar colisiones
    const newLayerAbajo = this.mapaActual.createLayer("piso", tiles, 0, this.mapaActual.heightInPixels);
    const newLayerArriba = this.mapaActual.createLayer("paredes", tiles, 0, this.mapaActual.heightInPixels);
    newLayerArriba.setCollisionByProperty({ coliders: true });
    this.physics.add.collider(this.robot, newLayerArriba); // Agregar colisión con el robot

    // Actualizar las capas actuales
    this.LayerAbajo = newLayerAbajo;
    this.LayerArriba = newLayerArriba;

    // Renderizar gráficos de debug para las colisiones si es necesario
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    this.LayerArriba.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });
}
}
