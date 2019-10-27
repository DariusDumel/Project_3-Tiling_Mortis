var GAME_WIDTH = 600;
var GAME_HEIGHT = 600;
var GAME_SCALE = 4;
var DIM = 16;

var gameport = document.getElementById("gameport");
var renderer = new PIXI.autoDetectRenderer(GAME_WIDTH,
                                           GAME_HEIGHT,
                                           {backgroundColor: 0x99D5FF});
gameport.appendChild(renderer.view);

var stage = new PIXI.Container();
stage.scale.x = GAME_SCALE;
stage.scale.y = GAME_SCALE;

// Scene objects get loaded in the ready function
var player;
var world;
var water;

// Character movement constants:
var MOVE_LEFT = 1;
var MOVE_RIGHT = 2;
var MOVE_UP = 3;
var MOVE_DOWN = 4;
var MOVE_NONE = 0;

// The move function starts or continues movement
function move() {

  if (player.direction == MOVE_NONE) {
    player.moving = false;
    return;
  }

  var dx = 0;
  var dy = 0;

  if (player.direction == MOVE_LEFT) dx -= 1;
  if (player.direction == MOVE_RIGHT) dx += 1;
  if (player.direction == MOVE_UP) dy -= 1;
  if (player.direction == MOVE_DOWN) dy += 1;

  if (water[(player.gy+dy-1)*12 + (player.gx+dx)] != 0) {
    player.moving = false;
    return;
  }

  player.gx += dx;
  player.gy += dy;

  player.moving = true;

  createjs.Tween.get(player).to({x: player.gx*DIM, y: player.gy*DIM}, 250).call(move);
}

window.addEventListener("keydown", function (e) {
  e.preventDefault();
  if (!player) return;
  if (player.moving) return;
  if (e.repeat == true) return;

  player.direction = MOVE_NONE;

  if (e.keyCode == 87)
    player.direction = MOVE_UP;
  else if (e.keyCode == 83)
    player.direction = MOVE_DOWN;
  else if (e.keyCode == 65)
    player.direction = MOVE_LEFT;
  else if (e.keyCode == 68)
    player.direction = MOVE_RIGHT;

  move();
});

// Keyup events end movement
window.addEventListener("keyup", function onKeyUp(e) {
  e.preventDefault();
  if (!player) return;
  player.direction = MOVE_NONE;
});

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

PIXI.loader
  .add('../assets/map.json')
  .add('../assets/mapTileSet.png')
  .add('../assets/player.png')
  .load(ready);

function ready() {
  createjs.Ticker.setFPS(60);
  var tu = new TileUtilities(PIXI);
  world = tu.makeTiledWorld("map.json", "mapTileSet.tsx");
  stage.addChild(world);

  player = new PIXI.Sprite(PIXI.loader.resources["player.png"].texture);
  player.gx = 9;
  player.gy = 5;
  player.x = player.gx*DIM;
  player.y = player.gy*DIM;
  player.anchor.x = 0.0;
  player.anchor.y = 1.0;

  // Find the entity layer
  var entities = world.getObject("Entities");
  entities.addChild(player);

  water = world.getObject("water").data;

  player.direction = MOVE_NONE;
  player.moving = false;
  animate();
}

function animate(timestamp) {
  requestAnimationFrame(animate);
  update_camera();
  renderer.render(stage);
}

function update_camera() {
  stage.x = -player.x*GAME_SCALE + GAME_WIDTH/2 - player.width/2*GAME_SCALE;
  stage.y = -player.y*GAME_SCALE + GAME_HEIGHT/2 + player.height/2*GAME_SCALE;
  stage.x = -Math.max(0, Math.min(world.worldWidth*GAME_SCALE - GAME_WIDTH, -stage.x));
  stage.y = -Math.max(0, Math.min(world.worldHeight*GAME_SCALE - GAME_HEIGHT, -stage.y));
}
