//定数宣言部
const ConstResource = {
    firstPosX: 22, //初期位置 x
    firstPosY: 28, //初期位置 y
    screenWidth: 928,
    screenHeight: 608,
    oneTileDist: 32, //1タイル分のPixel距離
  
    //（Left: 1, Back: 2, Right: 3, Front: 0）
    upIdx: 2,
    leftIdx: 1,
    rightIdx: 3,
    downIdx: 0,
  
    textSize: 28,
  
    uiZIndex: 200, //UIのZ座標
    objZIndex: 100, //プレイヤー, モブ, オブジェクトのZ座標
    efxZIndex: 100, //攻撃等のエフェクトのZ座標
    debugZIndex: 999 //デバッグ用のZ座標
  };
  
  //変数宣言部
  let LetResource = {
    currentPosX: ConstResource.firstPosX + (ConstResource.screenWidth - ConstResource.oneTileDist) / ConstResource.oneTileDist / 2,
    currentPosY: ConstResource.firstPosY + (ConstResource.screenHeight - ConstResource.oneTileDist) / ConstResource.oneTileDist / 2,
  
    charOffsetX: 0, //キャラの位置調整
    charOffsetY: -12, //キャラの位置調整
  
    aFlag: 0, //aボタンフラグ
    xFlag: 0, //xボタンフラグ
  
    dialogueFlag: 0, //ダイアログフラグ
    gridFlag: 0,
    loopflag: 1,//定期関数　停止用フラグ
    loopCallEventFlag: 1, //定期関数におけるCallEvent実行フラグ
  
    eventData: 0, //event格納用変数
  
    lastDir: 0, //最後に向いていた方向
  
    attackAnimSpeed: 0.125, //攻撃アニメのスピード
    walkAnimSpeed: 0.25, //歩行アニメのスピード
  
    eventFlags: new Array(500) //イベント用のフラグ配列
  };
  
  //フラグ用の変数宣言部
  let GameVal = {
    // objList: new Array(500), //残存するオブジェクトを格納する配列
    steps: 0, //歩数
    sec: 0, //プレイ秒数
  
    missAtk: 0, //MPなどの制限により、攻撃不成立
    missShot: 0, //空振り（攻撃のアクション自体は成立）
  }
  
  //キーコンフィグ用の変数宣言部
  let KeyConfig = {
    attack: "d",
    check: "a",
    menu: "s",
    enter: " ",
  
    up: "ArrowUp",
    left: "ArrowLeft",
    right: "ArrowRight",
    down: "ArrowDown"
  }
  
  const ResourceURL = {
    normalAttackJson: "./img/effects/redFireEfx.json",
    meJson: "./img/PlayersSpr.json",
  
    mapPng: "./img/LargeMapTest.png",
  
    mapDataJson: "./assets/LargeMapTest.json"
  }
  
  // 文字スタイル定義
  const textStyle = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: ConstResource.textSize,
    fill: ['#FFFFFF']
  });


  /*****************************************/
//デバッグ用グリッド
winWidth = ConstResource.screenWidth;
winHeight = ConstResource.screenHeight;

let gridContainer = new PIXI.Container();
gridContainer.x = 0;
gridContainer.y = 0;
gridContainer.zIndex = ConstResource.debugZIndex;

for (let i = 0; i * ConstResource.oneTileDist < ConstResource.screenWidth; i++) {
  for (let j = 0; j * ConstResource.oneTileDist < ConstResource.screenHeight; j++) {
    //アルファのついた格子柄を描画する
    let gridColor;
    if ((i + j) % 2 == 0) {
      gridColor = 0xffffff;
    } else {
      gridColor = 0x000000;
    }
    const gridRect = new PIXI.Graphics()
      .beginFill(gridColor, 0.05)
      .drawRect(i * ConstResource.oneTileDist, j * ConstResource.oneTileDist, ConstResource.oneTileDist, ConstResource.oneTileDist)
      .endFill();
    gridContainer.addChild(gridRect);
  }
}
/**********************************************/

// ダイアログボックス
const dialogueBox = new PIXI.Graphics(); 
dialogueBox.lineStyle(1, 0xf000000);
dialogueBox.beginFill(0x778899, 0.8);
dialogueBox.drawRect(64, 468, 800, 120);
dialogueBox.endFill();
dialogueBox.zIndex = ConstResource.uiZIndex;

/**********************************************/