// URL to explain PHASER scene: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scene/

export default class Juego extends Phaser.Scene {
  constructor() {
    super("Juego");
  }

  preload() {
    // Cargar assets
    this.load.tilemapTiledJSON("Proyecto", "./assets/ProyectoMapaJuego.json");
    this.load.tilemapTiledJSON("MapaGenerado", "./assets/MapaGenerado.json");
    this.load.image("espacio", "./assets/A&Mu-Game-atlas-esenario.3.png");
    this.load.image("enemigo", "./assets/A&Mu-Alien-MUranttt.1.png");
    this.load.image("objeto-no", "./assets/A&Mu-objets-not-breakable.png");
    this.load.image("objeto-si", "./assets/A&Mu-objets-breakable.png");
    this.load.atlas(
      "robot",
      "./assets/spritesheet.png",
      "./assets/spritesheet.json"
    );

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.ultimoEstado = "";
    this.maps = 0;
    // Cargar el mapa inicial
    this.mapaActual = this.make.tilemap({ key: "Proyecto" });
    const tiles = this.mapaActual.addTilesetImage("escenario", "espacio");

    this.LayerAbajo = this.mapaActual.createLayer("piso", tiles, 0, 0);
    this.LayerArriba = this.mapaActual.createLayer("paredes", tiles, 0, 0);
    this.LayerArriba.setCollisionByProperty({ coliders: true });

    // Crear el sprite del robot
    this.robot = this.physics.add.sprite(628, 428, "robot").setScale(0.2);
    this.robot.setDepth(1);

    this.physics.add.collider(this.robot, this.LayerArriba);

    // Configurar la cámara
    this.mycam = this.cameras.main;
    this.mycam.startFollow(this.robot);

    // Renderizar gráficos de depuración de colisiones si es necesario
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    this.LayerArriba.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });

    // Configurar las animaciones del robot
    this.configurarAnimacionesRobot();

    // Manejar la reanudación del contexto de audio al hacer clic en un punto
    this.input.once("pointerdown", () => {
      if (this.sound.context.state === "suspended") {
        this.sound.context.resume();
      }
    });

    // Generar el siguiente mapa
    //this.generarSiguienteMapa();
  }

  update() {
    const velocidad = 500;

    // Manejar el movimiento del robot
    if (this.cursors.left.isDown) {
      this.ultimoEstado = "right";
      this.robot.setVelocity(-velocidad, 0);
      this.robot.anims.play("robot-run-side(right)", true);
    } else if (this.cursors.right.isDown) {
      this.ultimoEstado = "left";
      this.robot.setVelocity(velocidad, 0);
      this.robot.anims.play("robot-run-side(left)", true);
    } else if (this.cursors.up.isDown) {
      this.ultimoEstado = "up";
      this.robot.setVelocity(0, -velocidad);
      this.robot.anims.play("robot-run-up", true);
    } else if (this.cursors.down.isDown) {
      this.ultimoEstado = "below";
      this.robot.setVelocity(0, velocidad);
      this.robot.anims.play("robot-run-below", true);
    } else {
      this.robot.anims.play(`robot-idle-${this.ultimoEstado}`);
      this.robot.setVelocity(0, 0);
      //const currentAnim = this.robot.anims.currentAnim;
      //if (currentAnim && currentAnim.key) {
      //  const direction = currentAnim.key.split("-")[2];
      //  this.robot.anims.play(`robot-idle-${direction}`, true);
      //} else {
      //  this.robot.anims.play("robot-idle-below", true);
      //}
    }

    // Comprobar colisiones con la capa superior del mapa actual
    this.physics.world.collide(this.robot, this.LayerArriba);

    // Comprobar si el robot está cerca del borde inferior del mapa actual
    let bottomOfMap = this.LayerAbajo.height;
    if (this.robot.y > bottomOfMap - 400) {
      this.generarSiguienteMapa();
    }
  }

  configurarAnimacionesRobot() {
    // Definir las animaciones del robot
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
      frames: this.anims.generateFrameNames("robot", {
        start: 0,
        end: 2,
        prefix: ".A&Mu-robot-run-left-0",
        suffix: ".png",
      }),
      frameRate: 4,
    });

    this.anims.create({
      key: "robot-run-side(right)",
      frames: this.anims.generateFrameNames("robot", {
        start: 0,
        end: 2,
        prefix: ".A&Mu-robot-run-right-0",
        suffix: ".png",
      }),
      frameRate: 2,
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

  generarSiguienteMapa() {
    // Generar el siguiente mapa y mover el actual hacia abajo
    this.maps++;
    this.mapaActual = this.make.tilemap({ key: "MapaGenerado" });
    let tiles = this.mapaActual.addTilesetImage("escenario", "espacio");

    // Crear nuevas capas y establecer colisiones
    const nuevaLayerAbajo = this.mapaActual.createLayer(
      "piso",
      tiles,
      0,
      this.mapaActual.heightInPixels
    );
    const nuevaLayerArriba = this.mapaActual.createLayer(
      "paredes",
      tiles,
      0,
      this.mapaActual.heightInPixels
    );
    console.log("MAPA", this.mapaActual);
    //nuevaLayerArriba.setCollisionByProperty({ coliders: true });
    // this.physics.add.collider(this.robot, nuevaLayerArriba); // Añadir colisión con el robot
    // this.physics.add.collider(this.robot, nuevaLayerAbajo);

    // Actualizar las capas actuales
    this.LayerAbajo = nuevaLayerAbajo;
    this.LayerArriba = nuevaLayerArriba;

    // Renderizar gráficos de depuración para colisiones
    const debugGraphics = this.add.graphics().setAlpha(0.75);
    this.LayerArriba.renderDebug(debugGraphics, {
      tileColor: null,
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
      faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    });
  }
}
