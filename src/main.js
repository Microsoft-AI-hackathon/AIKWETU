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

k.loadSprite("map2", "./map2.png");
k.loadSprite("map", "./map.png"); 
k.loadSprite("map3", "./map3.png");
// 
k.setBackground(k.Color.fromHex("#311047"));

k.scene("main", async () => {
  const mapData = await (await fetch("./map2.json")).json();
  const layers = mapData.layers;

  const map = k.add([k.sprite("map2"), k.pos(0), k.scale(scaleFactor)]);

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
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name,
        ]);

        // Handle the "one" boundary for scene transition to lab house
        if (boundary.name === "one") {
          player.onCollide(boundary.name, () => {
            if (!player.isInDialogue) {
              k.go("lab"); // Transition to the lab scene
            }
          });
        } 

        // Handle other named boundaries for dialogue
        else if (boundary.name && boundary.name !== "wall") {
          player.onCollide(boundary.name, () => {
            console.log(`Collided with: ${boundary.name}`);
            if (!player.isInDialogue) {
              player.isInDialogue = true;
              displayDialogue(
                dialogueData[boundary.name] || "No dialogue available.",
                () => (player.isInDialogue = false)
              );
            }
          });
        }
      }
      continue;
    }

    if (layer.name === "spawnpoint") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
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

// Lab scene definition
k.scene("lab", async () => {
  console.log("Starting lab scene initialization");

  try {
    const response = await fetch("./map.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const mapData = await response.json();
    const layers = mapData.layers;

    const labMap = k.add([
      k.sprite("map"),
      k.pos(0),
      k.scale(scaleFactor),
    ]);

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

    k.add(player);

    for (const layer of layers) {
      if (layer.name === "boundaries") {
        for (const boundary of layer.objects) {
          labMap.add([
            k.area({
              shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
            }),
            k.body({ isStatic: true }),
            k.pos(boundary.x, boundary.y),
            boundary.name,
          ]);

          if (boundary.name === "gotoboss") {
            player.onCollide(boundary.name, () => {
              if (!player.isInDialogue) {
                k.go("challenge"); // Transition to the challenge scene
              }
            });
          } 

          // Handle named boundaries for dialogue
          if (boundary.name && boundary.name !== "wall") {
            player.onCollide(boundary.name, () => {
              console.log(`Collided with: ${boundary.name}`);
              if (!player.isInDialogue) {
                player.isInDialogue = true;
                displayDialogue(
                  dialogueData[boundary.name] || "No dialogue available.",
                  () => (player.isInDialogue = false)
                );
              }
            });
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
    console.error("Error initializing lab scene:", error);
  }
});

// Challenge scene definition
k.scene("challenge", async () => {
  console.log("Starting challenge scene initialization");

  try {
    // Fetch and load map3.json
    const response = await fetch("./map3.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const mapData = await response.json();
    const layers = mapData.layers;

    // Add the map sprite
    const challengeMap = k.add([
      k.sprite("map3"), // Ensure "map3" matches the loaded sprite
      k.pos(0),
      k.scale(scaleFactor),
    ]);

    // Create the player
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

    k.add(player);

    // Process layers and boundaries
    for (const layer of layers) {
      if (layer.name === "boundaries") {
        for (const boundary of layer.objects) {
          challengeMap.add([
            k.area({
              shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
            }),
            k.body({ isStatic: true }),
            k.pos(boundary.x, boundary.y),
            boundary.name,
          ]);

          // Handle the "boss" boundary for dialogue
          if (boundary.name === "boss") {
            player.onCollide(boundary.name, () => {
              if (!player.isInDialogue) {
                player.isInDialogue = true;

                // Display the dialogue for "boss"
                const dialogueBox = document.getElementById("textbox");
                const dialogueText = document.getElementById("dialogue");
                dialogueText.innerText =
                  dialogueData["boss"] || "You have encountered the boss!";

                // Add a "Close" button dynamically
                const btnContainer = document.querySelector(".btn-container");
                btnContainer.innerHTML = ""; // Clear previous buttons

                const closeButton = document.createElement("button");
                closeButton.innerText = "Close";
                closeButton.className = "ui-close-btn";
                closeButton.addEventListener("click", () => {
                  dialogueBox.style.display = "none"; // Hide the dialogue box
                  player.isInDialogue = false;
                });
                btnContainer.appendChild(closeButton);

                // Show the dialogue box
                document.getElementById("textbox-container").style.display =
                  "block";
              }
            });
          }
        }
      }
    }

    // Set camera scaling
    setCamScale(k);

    k.onResize(() => {
      setCamScale(k);
    });

    // Update camera position
    k.onUpdate(() => {
      k.camPos(player.worldPos().x, player.worldPos().y - 100);
    });

    // Handle mouse clicks for movement
    k.onMouseDown((mouseBtn) => {
      if (mouseBtn !== "left" || player.isInDialogue) return;

      const worldMousePos = k.toWorld(k.mousePos());
      player.moveTo(worldMousePos, player.speed);
    });

    // Stop animations when movement stops
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
    console.error("Error initializing challenge scene:", error);
  }
});

k.go("main");

player.onCollide("exit", () => {
  if (!player.isInDialogue) {
    player.isInDialogue = true;

    // Display the dialogue for "exit"
    const dialogueBox = document.getElementById("textbox");
    const dialogueText = document.getElementById("dialogue");
    dialogueText.innerText = dialogueData["exit"] || "No dialogue available.";

    // Add a "Back" button dynamically
    const btnContainer = document.querySelector(".btn-container");
    const backButton = document.createElement("button");
    backButton.innerText = "Back";
    backButton.className = "ui-close-btn";
    backButton.addEventListener("click", () => {
      window.location.href = "anotherPage.html"; // Replace with the actual URL
    });

    // Clear existing buttons and add "Close" and "Back"
    btnContainer.innerHTML = ""; // Clear previous buttons
    btnContainer.appendChild(backButton);

    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.className = "ui-close-btn";
    closeButton.addEventListener("click", () => {
      dialogueBox.style.display = "none"; // Hide the dialogue box
      player.isInDialogue = false;
    });
    btnContainer.appendChild(closeButton);

    // Show the dialogue box
    document.getElementById("textbox-container").style.display = "block";
  }
});