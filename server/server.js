import ws from "ws";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });

const tendon = 20; //the space between 2 bones
const COLLISION_CRITERIA = 40; //the distance between 2 bones to be considered a collision
const MAX_FOOD = 100; //the maximum number of food on the map
const GAME_WIDTH = 2599;
const GAME_HEIGHT = 2599;
const SPEED = 4;
var clientId = 0;
let snakes = [];
let foods = [];

class Bone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Snake {
  constructor(socket, username) {
    this.bones = [new Bone(500, 500)]; //this is also the starting point of the snake
    this.angle = 0; // Angle in degrees
    this.clientId = clientId++;
    this.socket = socket;
    this.username = username;
  }

  addBone() {
    let lastBone = this.bones[this.bones.length - 1];
    this.bones.push(new Bone(lastBone.x, lastBone.y));
  }

  // Move each bone towards the bone in front of it
  move() {
    if (this.bones.length === 0) return;

    //if you are inside game area, move
    if (
      this.bones[0].x > 0 &&
      this.bones[0].x < GAME_WIDTH &&
      this.bones[0].y > 0 &&
      this.bones[0].y < GAME_HEIGHT
    ) {
    } else {
      return;
    }
    let dx = SPEED * Math.cos((this.angle * Math.PI) / 180);
    let dy = -SPEED * Math.sin((this.angle * Math.PI) / 180);
    this.bones[0].x += dx;
    this.bones[0].y += dy;

    for (let i = this.bones.length - 1; i > 0; i--) {
      let currentBone = this.bones[i];
      let prevBone = this.bones[i - 1];

      // Calculate the difference in position
      let diffX = prevBone.x - currentBone.x;
      let diffY = prevBone.y - currentBone.y;

      // Calculate the distance using Pythagoras theorem
      let distance = Math.sqrt(diffX * diffX + diffY * diffY);

      if (distance > 0) {
        // Avoid division by zero
        let moveAmount = Math.max(0, distance - tendon); // This ensures bones don't overlap
        let moveFraction = moveAmount / distance; // This calculates what fraction of the distance to move

        currentBone.x += diffX * moveFraction;
        currentBone.y += diffY * moveFraction;
      }
    }
  }
}

class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function pointsDistance(point1, point2) {
  let dx = point1.x - point2.x;
  let dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function checkCollision(loserSnake, winnerSnake) {
  //take the first bone of the loser snake
  let loserSnakeHead = loserSnake.bones[0];
  //check if this head is touching any bone of the winner snake except the head
  for (let i = 1; i < winnerSnake.bones.length; i++) {
    let winnerSnakeBone = winnerSnake.bones[i];
    if (pointsDistance(loserSnakeHead, winnerSnakeBone) < COLLISION_CRITERIA) {
      return true;
    }
  }
}

function balanceFood() {
  //if array length is less than max food, add a new food
  if (foods.length < MAX_FOOD) {
    let newFood = new Food(
      Math.random() * GAME_WIDTH,
      Math.random() * GAME_HEIGHT
    );
    foods.push(newFood);
  }
}

function globalStep() {
  ///LOOP
  for (let snake of snakes) {
    //make this snake move
    snake.move();
    //now check for collision of this snake assuming it is the loser
    for (let otherSnake of snakes) {
      //assuming snake is the loser and otherSnake is the winner
      if (otherSnake !== snake) {
        if (checkCollision(snake, otherSnake)) {
          //snake lost
          console.log("snake lost");
          //remove the snake from the snakes array
          let removedSnake = snakes.splice(snakes.indexOf(snake), 1)[0];

          // send a message to the client that he lost
          removedSnake.socket.send(JSON.stringify({ eventName: "game_over" }));

          //tell everyone else to dstroy_player
          for (let otherSnake of snakes) {
            otherSnake.socket.send(
              JSON.stringify({
                eventName: "destroy_player",
                clientId: removedSnake.clientId,
              })
            );
          }
          //convert this snake into food
          //add each alternate bone of the snake to the foods array
          for (let i = 0; i < removedSnake.bones.length; i += 2) {
            let bone = snake.bones[i];
            let food = new Food(bone.x, bone.y);
            foods.push(food);
          }
          break;
        }
      }
    }
    //now check if it is touching any food
    for (let food of foods) {
      if (pointsDistance(snake.bones[0], food) < COLLISION_CRITERIA) {
        //snake ate the food
        //remove the food from the foods array
        foods = foods.filter((f) => f !== food);
        //add a new bone to the snake

        snake.addBone();
      }
    }
  }

  //balance the food
  balanceFood();
}

// Run the step function 60 times a second
setInterval(globalStep, 1000 / 60);

function globalStateUpdate() {
  var foodUpdate = {
    eventName: "food_update",
    foods: foods,
  };
  for (let snake of snakes) {
    snake.socket.send(JSON.stringify(foodUpdate));
  }
  for (let snake of snakes) {
    //copy this players state to all other players
    var sendThis = {
      eventName: "state_update",
      clientId: snake.clientId,
      bones: snake.bones,
      username: snake.username,
    };

    for (let otherSnake of snakes) {
      //sending this to everyone
      otherSnake.socket.send(JSON.stringify(sendThis));
    }
  }
}

// Run the state update function 60 times a second
setInterval(globalStateUpdate, 1000 / 60);

//when a client connects
wss.on("connection", (ws) => {
  console.log("A client connected");
  //when a client sends a message
  ws.on("message", (message) => {
    //parse the message
    var realData = JSON.parse(message);
    switch (realData.eventName) {
      case "create_me":
        var username = realData.name;
        var newSnake = new Snake(ws, username);
        newSnake.addBone();
        newSnake.addBone();

        snakes.push(newSnake);
        console.log(newSnake);

        //tell this player we created you
        var sendThis = {
          eventName: "created_you",
          clientId: newSnake.clientId,
          bones: newSnake.bones,
          // angle: newSnake.angle,
          // username: newSnake.username,
        };
        ws.send(JSON.stringify(sendThis));

        break;

      case "angle_update":
        //find the snake with this client id
        for (let snake of snakes) {
          if (snake.clientId === realData.clientId) {
            snake.angle = realData.A;

            break;
          }
        }
        break;
    }
  });

  //when a client disconnects
  ws.on("close", () => {
    console.log("A client disconnected");
  });
});
