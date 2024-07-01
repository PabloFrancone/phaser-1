export default class Game extends Phaser.Scene {
  constructor() {
    super("Game");
  }

  preload() {
    // Cargar assets
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
    // Configurar variables de estado inicial
    this.ultimoEstado = "";
    this.maps = 0;

    // Crear el mapa inicial
    this.generarMapaInicial();

    // Configurar la cámara
    this.mycam = this.cameras.main;
    this.mycam.startFollow(this.robot);
    this.mycam.centerOn(this.robot.x, this.robot.y);

    // Configurar animaciones del robot
    this.configurarAnimacionesRobot();

    // Manejar la reanudación del contexto de audio al hacer clic en un punto
    this.input.once("pointerdown", () => {
      if (this.sound.context.state === "suspended") {
        this.sound.context.resume();
      }
    });

    // Generar el siguiente mapa
    this.generarSiguienteMapa();
  }

  update() {
    const velocidad = 500;

    // Manejar el movimiento del robot
    if (this.cursors.left.isDown) {
      this.moverRobot(-velocidad, 0, "right", "robot-run-side(right)");
      this.ultimoEstado = "right";
    } else if (this.cursors.right.isDown) {
      this.moverRobot(velocidad, 0, "left", "robot-run-side(left)");
      this.ultimoEstado = "left";
    } else if (this.cursors.up.isDown) {
      this.moverRobot(0, -velocidad, "up", "robot-run-up");
      this.ultimoEstado = "up";
    } else if (this.cursors.down.isDown) {
      this.moverRobot(0, velocidad, "below", "robot-run-below");
      this.ultimoEstado = "below";
    } else {
      this.robot.anims.play("robot-run-below");
      this.robot.setVelocity(0, 0);
    }

    // Actualizar la posición de los enemigos para que persigan al robot
    this.enemigos.children.iterate((enemigo) => {
      this.physics.moveToObject(enemigo, this.robot, 200);
    });

    // Verificar colisiones con la capa de arriba del mapa actual
    this.physics.world.collide(this.robot, this.LayerArriba);

    // Comprobar si el robot está cerca del borde inferior del mapa actual
    if (this.robot.y > this.LayerAbajo.height - 400) {
      this.generarSiguienteMapa();
    }
  }

  generarMapaInicial() {
    // Crear el mapa inicial
    this.mapaActual = this.make.tilemap({ key: "Proyecto" });
    const tiles = this.mapaActual.addTilesetImage("escenario", "espacio");

    this.LayerAbajo = this.mapaActual.createLayer("piso", tiles, 0, 0);
    this.LayerArriba = this.mapaActual.createLayer("paredes", tiles, 0, 0);
    this.LayerArriba.setCollisionByProperty({ coliders: true });

    // Crear el robot
    this.robot = this.physics.add.sprite(628, 428, "robot").setScale(0.2);
    this.robot.setDepth(1);
    this.robot.setSize(this.robot.width * 0.5, this.robot.height * 0.7);
    this.physics.add.collider(this.robot, this.LayerArriba);

    // Crear grupos para objetos
    this.objetosNoDestruibles = this.physics.add.staticGroup();
    this.objetosDestruibles = this.physics.add.group();

    // Crear grupo para enemigos
    this.enemigos = this.physics.add.group();

    // Generar objetos y enemigos aleatorios al iniciar
    this.generarObjetosAleatorios();
    this.generarEnemigosAleatorios();

    // Configurar colisiones entre robot y objetos
    this.physics.add.collider(this.robot, this.objetosNoDestruibles);
    this.physics.add.collider(this.robot, this.objetosDestruibles, this.destruirObjeto, null, this);

    // Configurar colisiones entre robot y enemigos
    this.physics.add.collider(this.robot, this.enemigos, this.colisionEnemigo, null, this);
  }

  generarSiguienteMapa() {
    // Generar el siguiente mapa y mover el actual hacia abajo
    this.maps++;
    this.mapaActual = this.make.tilemap({ key: "MapaGenerado" });
    const tiles = this.mapaActual.addTilesetImage("escenario", "espacio");

    const nuevaLayerAbajo = this.mapaActual.createLayer(
      "piso",
      tiles,
      0,
      this.maps * this.mapaActual.heightInPixels
    );
    const nuevaLayerArriba = this.mapaActual.createLayer(
      "paredes",
      tiles,
      0,
      this.maps * this.mapaActual.heightInPixels
    );

    nuevaLayerArriba.setCollisionByProperty({ coliders: true });
    this.physics.add.collider(this.robot, nuevaLayerArriba);

    // Actualizar las capas actuales
    this.LayerAbajo = nuevaLayerAbajo;
    this.LayerArriba = nuevaLayerArriba;

    // Renderizar gráficos de depuración para colisiones
    this.renderizarGraficosDepuracion(this.LayerArriba);

    // Generar nuevos objetos y enemigos aleatorios
    this.generarObjetosAleatorios();
    this.generarEnemigosAleatorios();
  }

  generarObjetosAleatorios() {
    // Generar nuevos objetos
    const cantidadObjetos = 10; // Cantidad de objetos a generar
    const spawnAreaWidth = this.LayerAbajo.width; // Ancho del área de generación
    const offsetY = this.maps * this.LayerAbajo.height; // Desplazamiento en el eje Y según el mapa

    for (let i = 0; i < cantidadObjetos; i++) {
      // Generar posición aleatoria dentro del área de juego
      const x = Phaser.Math.Between(200, spawnAreaWidth - 200);
      const y = Phaser.Math.Between(300, this.LayerAbajo.height - 300) + offsetY;

      // Elegir aleatoriamente entre objeto destruible o no destruible
      if (Phaser.Math.Between(0, 1) === 0) {
        // Objeto no destruible
        const objetoNoDestruible = this.objetosNoDestruibles.create(x, y, "objeto-no");
        objetoNoDestruible.setSize(objetoNoDestruible.width * 0.1, objetoNoDestruible.height * 0.18).setScale(0.2).setDepth(2);
      } else {
        // Objeto destruible
        const objetoDestruible = this.objetosDestruibles.create(x, y, "objeto-si").setScale(0.2);
        objetoDestruible.setSize(objetoDestruible.width * 0.7, objetoDestruible.height * 0.8).setDepth(2);
      }
    }
  }

  generarEnemigosAleatorios() {
    // Verificar si ya hay 5 enemigos activos
    if (this.enemigos.countActive(true) >= 5) {
        return; // Salir del método si ya hay 5 enemigos activos
    }

    // Configurar parámetros de generación
    const spawnAreaWidth = this.LayerAbajo.width; // Ancho del área de generación
    const spawnAreaHeight = this.LayerAbajo.height; // Alto del área de generación
    const offsetY = this.maps * this.LayerAbajo.height; // Desplazamiento en el eje Y según el mapa

    // Generar enemigos
    const x = Phaser.Math.Between(200, spawnAreaWidth - 200);
    const y = Phaser.Math.Between(300, spawnAreaHeight - 300) + offsetY;

    // Añadir un retraso de 2 segundos antes de generar el enemigo
    this.time.delayedCall(2000, () => {
        const enemigo = this.enemigos.create(x, y, "enemigo").setScale(0.05);
        enemigo.setSize(enemigo.width * 0.3, enemigo.height * 0.7);
        enemigo.setDepth(2);

        // Configurar comportamiento de colisiones y físicas para enemigos
        this.physics.add.collider(enemigo, this.LayerArriba);
        this.physics.add.collider(this.robot, enemigo, this.colisionEnemigo, null, this);
    });
}


  moverRobot(velX, velY, estado, animacion) {
    this.robot.setVelocity(velX, velY);
    this.robot.anims.play(animacion, true);
    this.ultimoEstado = estado;
  }

  configurarAnimacionesRobot() {
    // Definir las animaciones del robot
    

    this.anims.create({
      key: "robot-run-side(left)",
      frames: this.anims.generateFrameNames("robot", {
        start: 0,
        end: 2,
        prefix: ".A&Mu-robot-run-left-0",
        suffix: ".png",
      }),
      frameRate: 6,
    });

    this.anims.create({
      key: "robot-run-side(right)",
      frames: this.anims.generateFrameNames("robot", {
        start: 0,
        end: 2,
        prefix: ".A&Mu-robot-run-right-0",
        suffix: ".png",
      }),
      frameRate: 6,
    });

    this.anims.create({
      key: "robot-run-below",
      frames: [{ key: "robot", frame: ".A&Mu-robot-run-below-01.png" }],
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "robot-run-up",
      frames: [{ key: "robot", frame: ".A&Mu-robot-run-up-00.png" }],
      frameRate: 4,
      repeat: -1,
    });
  }

  renderizarGraficosDepuracion(layer) {
    // const debugGraphics = this.add.graphics().setAlpha(0.75);
    // layer.renderDebug(debugGraphics, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });
  }

  destruirObjeto(robot, objeto) {
    objeto.destroy();
  }

  colisionEnemigo(robot, enemigo) {
    this.scene.restart();
  }
}
