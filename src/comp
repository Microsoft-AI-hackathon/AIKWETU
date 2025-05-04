import { dialogueData, scaleFactor } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 960,
    "walk-down": { from: 960, to: 963, loop: true, speed: 8 },
    "idle-side": 999,
    "walk-side": { from: 999, to: 1002, loop: true, speed: 8 },
    "idle-up": 1038,
    "walk-up": { from: 1039, to: 1041, loop: true, speed: 8 },
  },
});

// k.loadSprite("map", "./map.png");

//Test map
k.loadSprite("map2", "./map2.png");

// Load the lab map sprite
k.loadSprite("map", "./map.png");

// Load the boss fight map sprite
k.loadSprite("map3", "./map3.png");

k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
//   const mapData = await (await fetch("./map.json")).json();
//   const layers = mapData.layers;

//   const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);




  ///////////////////////

  const mapData = await (await fetch("./map2.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map2"), k.pos(0), k.scale(scaleFactor)]);

  ///////////////////////////////////////////////////////////////////////////////////

  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 250,
      direction: "down",
      isInDialogue: false,
    },
    "player",
  ]);

  for (const layer of layers) {
    if (layer.name === "boundary") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }

      continue;
    }

    if (layer.name === "outside_boundary") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            player.isInDialogue = true;
            displayDialogue(
              dialogueData[boundary.name],
              () => (player.isInDialogue = false)
            );
          });
        }
      }

      continue;
    }

    // Modify the collision logic for door1
    if (layer.name === "door1") {
      console.log("Found door1 layer");
      for (const boundary of layer.objects) {
        console.log("Processing door1 object:", boundary);
        const door = map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          "door1"
        ]);

        player.onCollide("door1", () => {
          console.log("Player collided with door1");
          if (player.isInDialogue) {
            console.log("Player already in dialogue");
            return;
          }
          player.isInDialogue = true;
          displayDialogue(
            "You are now entering the lab...",
            () => {
              console.log("Dialogue complete, transitioning to lab");
              player.isInDialogue = false;
              k.go("lab");
            }
          );
        });
      }
      continue;
    }

    // if (layer.name === "spawnpoints") {
    if (layer.name === "spawn") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          console.log("Player position after scaling:", player.pos);
          k.add(player);
          continue;
        }
      }
    }
  }

  setCamScale(k);

  k.onResize(() => {
    setCamScale(k);
  });

  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);

    const lowerBound = 50;
    const upperBound = 125;

    if (
      mouseAngle > lowerBound &&
      mouseAngle < upperBound &&
      player.curAnim() !== "walk-up"
    ) {
      player.play("walk-up");
      player.direction = "up";
      return;
    }

    if (
      mouseAngle < -lowerBound &&
      mouseAngle > -upperBound &&
      player.curAnim() !== "walk-down"
    ) {
      player.play("walk-down");
      player.direction = "down";
      return;
    }

    if (Math.abs(mouseAngle) > upperBound) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      return;
    }

    if (Math.abs(mouseAngle) < lowerBound) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      return;
    }
  });

  function stopAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
      return;
    }
    if (player.direction === "up") {
      player.play("idle-up");
      return;
    }

    player.play("idle-side");
  }

  k.onMouseRelease(stopAnims);

  k.onKeyRelease(() => {
    stopAnims();
  });
  k.onKeyDown((key) => {
    const keyMap = [
      k.isKeyDown("right"),
      k.isKeyDown("left"),
      k.isKeyDown("up"),
      k.isKeyDown("down"),
    ];

    let nbOfKeyPressed = 0;
    for (const key of keyMap) {
      if (key) {
        nbOfKeyPressed++;
      }
    }

    if (nbOfKeyPressed > 1) return;

    if (player.isInDialogue) return;
    if (keyMap[0]) {
      player.flipX = false;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "right";
      player.move(player.speed, 0);
      return;
    }

    if (keyMap[1]) {
      player.flipX = true;
      if (player.curAnim() !== "walk-side") player.play("walk-side");
      player.direction = "left";
      player.move(-player.speed, 0);
      return;
    }

    if (keyMap[2]) {
      if (player.curAnim() !== "walk-up") player.play("walk-up");
      player.direction = "up";
      player.move(0, -player.speed);
      return;
    }

    if (keyMap[3]) {
      if (player.curAnim() !== "walk-down") player.play("walk-down");
      player.direction = "down";
      player.move(0, player.speed);
    }
  });
});

// Define the lab scene
k.scene("lab", async () => {
  console.log("Starting lab scene initialization");

  try {
    // Load the lab map data
    const response = await fetch("./map.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const mapData = await response.json();
    console.log("Successfully loaded map data");

    const layers = mapData.layers;
    console.log("Map layers:", layers);

    // Add the lab map
    const labMap = k.add([
      k.sprite("map"),
      k.pos(0),
      k.scale(scaleFactor),
    ]);

    // Create player in lab
    const player = k.make([
      k.sprite("spritesheet", { anim: "idle-down" }),
      k.area({
        shape: new k.Rect(k.vec2(0, 3), 10, 10),
      }),
      k.body(),
      k.anchor("center"),
      k.pos(k.width() / 2, k.height() / 2),
      k.scale(scaleFactor),
      {
        speed: 250,
        direction: "down",
        isInDialogue: false,
      },
      "player",
    ]);

    // Process map layers
    for (const layer of layers) {
      console.log("Processing layer:", layer.name);

      // Add boundaries
      if (layer.name === "boundaries") {
        for (const boundary of layer.objects) {
          labMap.add([
            k.area({
              shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
            }),
            k.body({ isStatic: true }),
            k.pos(boundary.x, boundary.y),
            boundary.name, // Use the name for collision detection if needed
          ]);
        }
        continue;
      }

      // Handle exit
      if (layer.name === "exit") {
        for (const exit of layer.objects) {
          labMap.add([
            k.area({
              shape: new k.Rect(k.vec2(0), exit.width, exit.height),
            }),
            k.body({ isStatic: true }),
            k.pos(exit.x, exit.y),
            "exit",
          ]);

          player.onCollide("exit", () => {
            console.log("Player collided with exit"); // Debug statement
            if (player.isInDialogue) {
              console.log("Player is already in dialogue"); // Debug statement
              return;
            }
            player.isInDialogue = true;
            displayDialogue(
              "You are now entering the boss fight...",
              () => {
                console.log("Dialogue complete, transitioning to boss fight"); // Debug statement
                player.isInDialogue = false;
                k.go("bossFight");
              }
            );
          });
        }
        continue;
      }

      // Set spawn points
      if (layer.name === "spawnpoint") {
        for (const entity of layer.objects) {
          if (entity.name === "player") {
            console.log("Setting player spawn position:", entity.x, entity.y);
            player.pos = k.vec2(
              (labMap.pos.x + entity.x) * scaleFactor,
              (labMap.pos.y + entity.y) * scaleFactor
            );
            console.log("Player position after scaling:", player.pos);
            continue;
          }
        }
      }
    }

    // Add the player to the scene
    k.add(player);

    // Add camera scaling and controls
    setCamScale(k);
    console.log("Lab scene initialization complete");

    // Add event handlers after player is created
    k.onResize(() => {
      setCamScale(k);
    });

    k.onUpdate(() => {
      k.camPos(player.worldPos().x, player.worldPos().y - 100);
    });

    // Add movement controls (reuse the same logic as the main scene)
    k.onMouseDown((mouseBtn) => {
      if (mouseBtn !== "left" || player.isInDialogue) return;

      const worldMousePos = k.toWorld(k.mousePos());
      player.moveTo(worldMousePos, player.speed);

      const mouseAngle = player.pos.angle(worldMousePos);

      const lowerBound = 50;
      const upperBound = 125;

      if (
        mouseAngle > lowerBound &&
        mouseAngle < upperBound &&
        player.curAnim() !== "walk-up"
      ) {
        player.play("walk-up");
        player.direction = "up";
        return;
      }

      if (
        mouseAngle < -lowerBound &&
        mouseAngle > -upperBound &&
        player.curAnim() !== "walk-down"
      ) {
        player.play("walk-down");
        player.direction = "down";
        return;
      }

      if (Math.abs(mouseAngle) > upperBound) {
        player.flipX = false;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "right";
        return;
      }

      if (Math.abs(mouseAngle) < lowerBound) {
        player.flipX = true;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "left";
        return;
      }
    });

    function stopAnims() {
      if (player.direction === "down") {
        player.play("idle-down");
        return;
      }
      if (player.direction === "up") {
        player.play("idle-up");
        return;
      }

      player.play("idle-side");
    }

    k.onMouseRelease(stopAnims);

    k.onKeyRelease(() => {
      stopAnims();
    });

    k.onKeyDown((key) => {
      const keyMap = [
        k.isKeyDown("right"),
        k.isKeyDown("left"),
        k.isKeyDown("up"),
        k.isKeyDown("down"),
      ];

      let nbOfKeyPressed = 0;
      for (const key of keyMap) {
        if (key) {
          nbOfKeyPressed++;
        }
      }

      if (nbOfKeyPressed > 1) return;

      if (player.isInDialogue) return;
      if (keyMap[0]) {
        player.flipX = false;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "right";
        player.move(player.speed, 0);
        return;
      }

      if (keyMap[1]) {
        player.flipX = true;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "left";
        player.move(-player.speed, 0);
        return;
      }

      if (keyMap[2]) {
        if (player.curAnim() !== "walk-up") player.play("walk-up");
        player.direction = "up";
        player.move(0, -player.speed);
        return;
      }

      if (keyMap[3]) {
        if (player.curAnim() !== "walk-down") player.play("walk-down");
        player.direction = "down";
        player.move(0, player.speed);
      }
    });
  } catch (error) {
    console.error("Error initializing lab scene:", error);
  }
});

// Define the boss fight scene
k.scene("bossFight", async () => {
  console.log("Starting boss fight scene initialization");

  try {
    // Load the boss fight map data
    const response = await fetch("./map3.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const mapData = await response.json();
    console.log("Successfully loaded map3 data");

    const layers = mapData.layers;
    console.log("Map3 layers:", layers);

    // Add the boss fight map
    const bossMap = k.add([
      k.sprite("map3"),
      k.pos(0, 0),
      k.scale(scaleFactor),
    ]);

    // Create player in boss fight
    const player = k.make([
      k.sprite("spritesheet", { anim: "idle-down" }),
      k.area({
        shape: new k.Rect(k.vec2(0, 3), 10, 10),
      }),
      k.body(),
      k.anchor("center"),
      k.pos(100, 200), // Manually set spawn position
      k.scale(scaleFactor),
      {
        speed: 250,
        direction: "down",
        isInDialogue: false,
        health: 100, // Player health
      },
      "player",
    ]);

    // Create boss
    const boss = {
      health: 100, // Boss health
    };

    // Process map layers
    for (const layer of layers) {
      console.log("Processing layer:", layer.name);

      // Add boundaries
      if (layer.name === "boundaries") {
        for (const boundary of layer.objects) {
          bossMap.add([
            k.area({
              shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
            }),
            k.body({ isStatic: true }),
            k.pos(boundary.x, boundary.y),
            boundary.name,
          ]);
        }
        continue;
      }

      // Handle fight object
      if (layer.name === "fight") {
        for (const fight of layer.objects) {
          bossMap.add([
            k.area({
              shape: new k.Rect(k.vec2(0), fight.width, fight.height),
            }),
            k.body({ isStatic: true }),
            k.pos(fight.x, fight.y),
            "fight",
          ]);

          player.onCollide("fight", () => {
            if (player.isInDialogue) return;
            player.isInDialogue = true;

            // Boss dialogue before starting the quiz
            displayDialogue(
              "BOSS: Ahh you have made it, I hope you come prepared!", // Boss dialogue
              () => {
                console.log("Boss dialogue complete. Starting player's response."); // Debug statement

                // Player's response after the boss's dialogue
                displayDialogue(
                  "PLAYER: Bring it on!!!", // Player's dialogue
                  () => {
                    console.log("Player's response complete. Starting the quiz."); // Debug statement

                    // Start the quiz after the player's response
                    startQuiz(player, boss, () => {
                      console.log("Quiz complete."); // Debug statement
                      player.isInDialogue = false;
                    });
                  }
                );
              }
            );
          });
        }
      }
    }

    // Add the player to the scene
    k.add(player);

    // Add camera scaling and controls
    setCamScale(k);

    k.onResize(() => {
      setCamScale(k);
    });

    k.onUpdate(() => {
      k.camPos(player.worldPos().x, player.worldPos().y - 100);
    });

    // Add movement controls (reuse the same logic as the main scene)
    k.onMouseDown((mouseBtn) => {
      if (mouseBtn !== "left" || player.isInDialogue) return;

      const worldMousePos = k.toWorld(k.mousePos());
      player.moveTo(worldMousePos, player.speed);

      const mouseAngle = player.pos.angle(worldMousePos);

      const lowerBound = 50;
      const upperBound = 125;

      if (
        mouseAngle > lowerBound &&
        mouseAngle < upperBound &&
        player.curAnim() !== "walk-up"
      ) {
        player.play("walk-up");
        player.direction = "up";
        return;
      }

      if (
        mouseAngle < -lowerBound &&
        mouseAngle > -upperBound &&
        player.curAnim() !== "walk-down"
      ) {
        player.play("walk-down");
        player.direction = "down";
        return;
      }

      if (Math.abs(mouseAngle) > upperBound) {
        player.flipX = false;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "right";
        return;
      }

      if (Math.abs(mouseAngle) < lowerBound) {
        player.flipX = true;
        if (player.curAnim() !== "walk-side") player.play("walk-side");
        player.direction = "left";
        return;
      }
    });

    function stopAnims() {
      if (player.direction === "down") {
        player.play("idle-down");
        return;
      }
      if (player.direction === "up") {
        player.play("idle-up");
        return;
      }

      player.play("idle-side");
    }

    k.onMouseRelease(stopAnims);

    k.onKeyRelease(() => {
      stopAnims();
    });
  } catch (error) {
    console.error("Error initializing boss fight scene:", error);
  }
});

// Quiz logic
function startQuiz(player, boss, onComplete) {
  const questions = [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5"],
      answer: "4",
    },
    {
      question: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris"],
      answer: "Paris",
    },
    {
      question: "What is 5 * 6?",
      options: ["30", "25", "35"],
      answer: "30",
    },
  ];

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  displayDialogue(
    `${randomQuestion.question}\nOptions: ${randomQuestion.options.join(", ")}`,
    (playerAnswer) => {
      if (playerAnswer === randomQuestion.answer) {
        console.log("Correct answer! Dealing damage to the boss.");
        boss.health -= 20;
        if (boss.health <= 0) {
          console.log("Boss defeated!");
          displayDialogue("You defeated the boss!", onComplete);
        } else {
          displayDialogue(`Correct! Boss health: ${boss.health}`, onComplete);
        }
      } else {
        console.log("Wrong answer! Boss deals damage to the player.");
        player.health -= 20;
        if (player.health <= 0) {
          console.log("Player defeated!");
          displayDialogue("You were defeated by the boss!", onComplete);
        } else {
          displayDialogue(`Wrong! Your health: ${player.health}`, onComplete);
        }
      }
    }
  );
}

k.go("main");