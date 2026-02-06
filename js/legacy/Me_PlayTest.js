//宣言部
// 押されたキーの情報を格納する配列を用意
const LEFT = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;

let pushed = [];
pushed[LEFT] = false;
pushed[UP] = false;
pushed[RIGHT] = false;
pushed[DOWN] = false;

// あるキーが押されたときのイベントリスナーを設定
window.addEventListener('keydown', function(e) {
   pushed[e.keyCode-37] = true;
});

// あるキーが離されたときのイベントリスナーを設定
window.addEventListener('keyup', function(e) {
    pushed[e.keyCode-37] = false;
});

// Pixiアプリケーション生成
let app = new PIXI.Application({
    width: 600,                 // スクリーン(ビュー)横幅
    height: 600,                // スクリーン(ビュー)縦幅
    backgroundColor: 0x888888,  // 背景色 16進 0xRRGGBB
    autoDensity: true,
});
// HTMLの<main id="app"></main>の中に上で作ったPIXIアプリケーション(app)のビュー(canvas)を突っ込む
let el = document.getElementById('app');
el.appendChild(app.view);

let Me_00_Texture = new PIXI.Texture.from('./img/Me_00.png');
let Me_00_Sprite = new PIXI.Sprite(Me_00_Texture);

// let Me_01_Texture = new PIXI.Texture.from('./img/Me_01.png');
// let Me_01_Sprite = new PIXI.Sprite(Me_00_Texture);
//
// let Me_02_Texture = new PIXI.Texture.from('./img/Me_02.png');
// let Me_02_Sprite = new PIXI.Sprite(Me_00_Texture);

Me_00_Sprite.anchor.set(0.5);
Me_00_Sprite.x = app.screen.width / 2;
Me_00_Sprite.y = app.screen.width / 2;

let Me_Array = new Array();
for(let i=0; i<3; i++) {
  let MeTex = new PIXI.Texture.from('./img/ME_0'+i+'.png');
  let MeSpr = new PIXI.Sprite(MeTex);

  MeSpr.anchor.set(0.5);
  MeSpr.x = app.screen.width / 2;
  MeSpr.y = app.screen.width / 2;

  Me_Array.push(MeSpr);
}

app.stage.addChild(Me_00_Sprite);

let MeContainer = new PIXI.Container();

MeContainer.x = 0;
MeContainer.y = 0;
app.stage.addChild(MeContainer);




// //デフォルトでME_00を中央に表示すること
// //キー入力を受け付けること
// //キー入力に反応し、00->01->00->02->00が切り替わること
//
// // フレーム更新時の処理(≒ループ処理)を追加する
// app.ticker.add(animate);
// let amountTime = 0;
//
// // 処理の定義
// function animate(delta) {
//     // ぶたがはまってる円を回転する
//     circle.rotation += 0.2;
//
//     // ぶたがはまってる円を左右に動かす(適当なのでほっとくとどんどんずれていきます)
//     amountTime += delta;                    // delta(app.ticker.deltaTime) : 前のフレームから今のフレームまでの経過時間を正規化した値？
//     // amountTime += app.ticker.deltaMS;    // app.ticker.deltaMS  : 前のフレームから今のフレームまでの経過時間(ms)
//
//     if (Math.cos(amountTime / 10) > 0) {
//         // 右に動かす
//         circle.x += 2;
//     }
//     else {
//         // 左に動かす
//         circle.x -= 2;
//     }
// }
//
// // 毎フレーム処理を解除する
// // app.ticker.remove(animate);
