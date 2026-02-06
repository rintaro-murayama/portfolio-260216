const app = new PIXI.Application({
    width: 900,                 // スクリーン(ビュー)横幅
    height: 600,                // スクリーン(ビュー)縦幅
    backgroundColor: 0x1099bb,  // 背景色 16進 0xRRGGBB
    autoDensity: true,


});
document.body.appendChild(app.view);

// const playerBTexture = new PIXI.BaseTexture("./img/Players.png");
// const playerTexture = new  PIXI.Texture(playerBTexture)
// const playerSprite = new PIXI.Sprite(playerTexture);
// app.stage.addChild(playerSprite)

app.loader.add("sprite", "./img/Players.json").load(setup);

// function setup() {
//   const sprite = PIXI.Sprite.from("./img/Me_00-sheet.png");   // ②
//   app.stage.addChild( sprite );
// }
let sprite;

function setup(loader, resources) {
  const textures = resources.Me.textures;
  const textureArray = Object.keys(textures).map(e => textures[e]);
  sprite = new PIXI.AnimatedSprite(textureArray);

  sprite.anchor.set(0.5);
  sprite.scale.x = 0.2;
  sprite.scale.y = 0.2;
  sprite.x = app.screen.width / 2;
  sprite.y = app.screen.height / 2;

  app.stage.addChild(sprite);
  sprite.animationSpeed = 0.1;
  //sprite.play();
}


function movePlayer(){
  sprite.play();

  setTimeout(() => {
    sprite.stop();
  }, 720)
}

// あるキーが押されたときのイベントリスナーを設定
window.addEventListener('keydown', function(e) {
   pushed[e.keyCode-37] = true;
});

// あるキーが離されたときのイベントリスナーを設定
window.addEventListener('keyup', function(e) {
    pushed[e.keyCode-37] = false;
});

const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;

let pushed = [];
pushed[LEFT] = false;
pushed[UP] = false;
pushed[RIGHT] = false;
pushed[DOWN] = false;

app.ticker.add((delta) => { // なんじゃこれという人向け: function(delta)の省略形です(厳密には違う)
    if (pushed[LEFT]) {
        // ←キーが押されていた場合
        movePlayer();
        console.log("pushed Left");
    }
    if (pushed[UP]) {
        // ↑キーが押されていた場合
        movePlayer();
        console.log("pushed Up");
    }
    if (pushed[RIGHT]) {
        // →キーが押されていた場合
        movePlayer();
        console.log("pushed Right");
    }
    if (pushed[DOWN]) {
        // ↓キーが押されていた場合
        movePlayer();
        console.log("pushed Down");
    }
});
