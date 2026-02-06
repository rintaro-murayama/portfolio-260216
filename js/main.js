// Pixiアプリケーション生成
let app = new PIXI.Application({
  width: ConstResource.screenWidth,                 // スクリーン(ビュー)横幅
  height: ConstResource.screenHeight,                // スクリーン(ビュー)縦幅
  backgroundColor: 0x1099bb,  // 背景色 16進 0xRRGGBB
  autoDensity: true,
});

// HTMLの<main id="app"></main>の中に上で作ったPIXIアプリケーション(app)のビュー(canvas)を突っ込む
let el = document.getElementById('app');
el.appendChild(app.view);

// 画像読み込む
let mapTexture = new PIXI.Texture.from(ResourceURL.mapPng);
let mapSpr = new PIXI.Sprite(mapTexture);

app.stage.sortableChildren = true;
app.stage.addChild(mapSpr);

//初期位置表示
mapSpr.x = -ConstResource.oneTileDist * ConstResource.firstPosX;
mapSpr.y = -ConstResource.oneTileDist * ConstResource.firstPosY;

/**********************************/
/***マップデータ読み込み***/
const mapJson = ResourceURL.mapDataJson;
let mapData;

function formatMap(json) {
  mapData = json;
  // console.log(mapData.collision);
  // console.log(mapData.object);
}

/**********************************/
//オブジェクト配置
let objSpr = new Array();
let gameObj = new Array();
function loadMapObject(objectList) {
  for (i = 0; i < objectList.length; i++) {
    if (objectList[i].exist) {

      switch (objectList[i].type) {
        case "object":
          gameObj[i] = new GameObj(objectList[i]);
          console.log(gameObj[i]);
          objSpr[i] = gameObj[i].getSprite;
          app.stage.addChild(objSpr[i]);
          break;

        case "NPC":
          gameObj[i] = new NpcObj(objectList[i]);
          objSpr[i] = gameObj[i].getSprite;
          app.stage.addChild(objSpr[i]);
          break;

        case "enemy":
          gameObj[i] = new EnemyObj(objectList[i]);
          console.log(gameObj[i]);
          objSpr[i] = gameObj[i].getSprite;
          app.stage.addChild(objSpr[i]);
          break;
      }
    }
  }
}
/**********************************/

window.addEventListener("load", async () => {
  await fetch(mapJson)
    .then(response => response.json())
    .then(data => formatMap(data));

  //このタイミングで、オブジェクトの読み込みも強制　してみる
  // console.log(mapData);
  loadMapObject(mapData.object);

  loader.load();

});

/**********************************/

/**********************************/
//通常攻撃　エフェクトスプライトの読み込み
app.loader.add("attackEfx", ResourceURL.normalAttackJson).load(loadSpr);
let atkEfxSpr = 0;
// console.log(app.loader.resources.attackEfx);
function loadSpr(loader, resources) {
  console.log(resources);
  const attackEfxTextures = resources.attackEfx.textures;
  const texturesArray = Object.keys(attackEfxTextures).map(e => attackEfxTextures[e]);
  // console.log(attackEfxTextures);
  // console.log(texturesArray);

  atkEfxSpr = new PIXI.AnimatedSprite(texturesArray);
  atkEfxSpr.visible = false;
  atkEfxSpr.animationSpeed = LetResource.attackAnimSpeed;
  atkEfxSpr.zIndex = ConstResource.efxZIndex;
  atkEfxSpr.scale.x = 2;
  atkEfxSpr.scale.y = 2;
  atkEfxSpr.loop = false;
  atkEfxSpr.gotoAndStop(3);

  app.stage.addChild(atkEfxSpr);
  //atkEfxSpr.gotoAndStop(3);
}

/**********************************/

/**
* ローダーを生成
*/
var loader = new PIXI.loaders.Loader();

/**
* スプライトシートのjsonのパス、読み込み完了の関数を与える
*/
loader
  .add('sprite', ResourceURL.meJson)
  .once('complete', function () {

    /*
    ゲーム開始時の初期化プロセス
    */
    LetResource.eventFlags.fill(0); //イベントフラグを全て0に初期化

    var date_obj = new Date(); //秒数計測用のdateオブジェクト
    const startTime = Math.floor(date_obj.getTime() / 1000); //開始時間

    loop(); //定期実行関数を呼び出す

    //通常攻撃エフェクト終了時にキーダウンハンドラを起動
    atkEfxSpr.onComplete = () => {
      atkEfxSpr.visible = false;
      // console.log("attacked");
      document.addEventListener('keydown', handleKeyDown);
    }

    /***********************/

    /***********************/
    //移動用アニメーション生成
    var
      /**
      * テクスチャの配列（Left: 1, Back: 2, Right: 3, Front: 0）
      */
      ttCharacter = [],
      /**
      * キャラクターアニメーションの配列
      */
      elmAnimationCharacter = [],
      /**
      * キャラクター要素
      */
      elmCharacter = new PIXI.Container(),
      i, j, k;

    for (i = 0; i < 4; i++) {
      // 4方向
      ttCharacter[i] = [];

      for (j = 0; j < 5; j++) {
        // 4フレーム
        var frame = j === 0 ? 0 :
          j === 1 ? 1 :
            j === 2 ? 0 :
              j === 3 ? 2 :
                j === 4 ? 0 :
                  0;
        ttCharacter[i].push(PIXI.Texture.fromFrame('Me_' + i + frame));
        //console.log(PIXI.Texture.fromFrame('Me_' + i + frame));
      }
    }

    for (k = 0; k < 4; k++) {
      elmAnimationCharacter.push(new PIXI.extras.AnimatedSprite(ttCharacter[k]));
      elmAnimationCharacter[k].gotoAndStop(4);
      elmAnimationCharacter[k].loop = false;
      elmAnimationCharacter[k].animationSpeed = LetResource.walkAnimSpeed;
      elmAnimationCharacter[k].anchor.set(0.5);
      elmAnimationCharacter[k].visible = false;
      elmCharacter.addChild(elmAnimationCharacter[k]);
    }

    /**
    * 正面（Front: 0）を表示する
    */
    elmAnimationCharacter[ConstResource.downIdx].visible = true;
    elmCharacter.scale.x = 1 / 8;
    elmCharacter.scale.y = 1 / 8;
    elmCharacter.position.set(ConstResource.screenWidth / 2 + LetResource.charOffsetX, ConstResource.screenHeight / 2 + LetResource.charOffsetY);
    elmCharacter.zIndex = Math.ceil(ConstResource.screenHeight / 2 / ConstResource.oneTileDist);

    app.stage.addChild(elmCharacter);
    /***********************/

    /***********************/
    //攻撃用アニメーション
    var
      /**
      * テクスチャの配列（Left: 1, Back: 2, Right: 3, Front: 0）
      */
      attackCharSpr = [],
      /**
      * キャラクターアニメーションの配列
      */
      attackAnime = [],
      /**
      * キャラクター要素
      */
      attackChar = new PIXI.Container(),
      i, j, k;

    for (i = 0; i < 4; i++) {
      // 4方向
      attackCharSpr[i] = [];

      for (j = 0; j < 3; j++) {
        // 3フレーム
        var frame = j === 0 ? 0 :　//ニュートラル -> 片手出し -> ニュートラル
          j === 1 ? 1 :
            0;
        attackCharSpr[i].push(PIXI.Texture.fromFrame('Me_' + i + frame));
      }
    }

    for (k = 0; k < 4; k++) {
      attackAnime.push(new PIXI.extras.AnimatedSprite(attackCharSpr[k]));
      attackAnime[k].gotoAndStop(2);
      attackAnime[k].loop = false;
      attackAnime[k].animationSpeed = LetResource.attackAnimSpeed;
      attackAnime[k].anchor.set(0.5);
      attackAnime[k].visible = false;
      attackChar.addChild(attackAnime[k]);
    }

    // attackAnime.onComplete = () => {
    //   attackAnime[getDirection()].visible = false;
    //   elmAnimationCharacter[getDirection()].visible = true;
    // };

    attackChar.scale.x = 1 / 8;
    attackChar.scale.y = 1 / 8;
    attackChar.position.set(ConstResource.screenWidth / 2 + LetResource.charOffsetX, ConstResource.screenHeight / 2 + LetResource.charOffsetY);
    attackChar.zIndex = Math.ceil(ConstResource.screenHeight / 2 / ConstResource.oneTileDist);

    app.stage.addChild(attackChar);
    /***********************/

    /***
    object 表示
    ***/
    //loadMapObject(mapData.object);

    document.addEventListener('keydown', handleKeyDown);

    /*************
    キャラ移動関数
    テクスチャの配列（Left: 1, Back: 2, Right: 3, Front: 0）
    
    isShiftKey: 1の場合、方向のみを変更し終了
    *************/
    function charMove(direction, isShiftKey) {
      elmAnimationCharacter[direction].visible = true;

      //shiftKeyが押されている場合、方向のみを変更し終了
      if (isShiftKey) {
        return 0;
      }


      if (elmAnimationCharacter[direction].currentFrame == 4 && isPenetrable(direction)) { //フレームの再生終了確認 & 侵入可否判定
        elmAnimationCharacter[direction].gotoAndPlay(0); // 最初のフレームから再生

        //ここで座標移動処理
        switch (direction) {
          case ConstResource.downIdx:
            LetResource.currentPosY += 1;
            break;
          case ConstResource.leftIdx:
            LetResource.currentPosX -= 1;
            break;
          case ConstResource.upIdx:
            LetResource.currentPosY -= 1;
            break;
          case ConstResource.rightIdx:
            LetResource.currentPosX += 1;
            break;
          default:
            break;
        }

        if (isMapSlidable(direction)) { //枠 マップスライド判定
          for (i = 0; i < objSpr.length; i++) {
            switch (direction) {
              case ConstResource.downIdx:
                objSpr[i].zIndex -= 1;
                // console.log(i + ": " + objSpr[i].zIndex);
                break;
              case ConstResource.upIdx:
                objSpr[i].zIndex += 1;
                // console.log(i + ": " + objSpr[i].zIndex);
                break;
              default:
                break;
            }
          }
          // console.log("map->move/char->unmove");
          mapSlide(direction); //マップをスライド
        } else {
          //キャラクターのZ Index 制御
          switch (direction) {
            case ConstResource.downIdx:
              elmCharacter.zIndex -= 1;
              break;
            case ConstResource.upIdx:
              elmCharacter.zIndex += 1;
              break;
            default:
              break;
          }
          // console.log("map->unmove/char->move");
          charSlide(direction); //キャラをスライド
        }

        GameVal.steps++; //歩数をカウント

      }
    }

    /*************
    侵入判定
    テクスチャの配列（Left: 1, Back: 2, Right: 3, Front: 0）
    *************/
    function isPenetrable(direction) {
      //侵入先のタイルが侵入可能であるか判定する。
      gridX = LetResource.currentPosX;
      gridY = LetResource.currentPosY;

      let resultIsPenetrable = true;

      switch (direction) {
        case ConstResource.downIdx:
          //画面端判定
          if (elmCharacter.y + ConstResource.oneTileDist >= ConstResource.screenHeight) {
            resultIsPenetrable = false;
            break;
          }
          //侵入先の可否判定
          if (mapData.collision[gridY + 1][gridX] == 1) {
            resultIsPenetrable = false;
            break;
          }

          //オブジェクトの当たり判定
          if (objectCollisionDetect(gridX, gridY + 1) == true) {
            resultIsPenetrable = false;
            break;
          }

          break;
        case ConstResource.leftIdx:
          //画面端判定
          if (elmCharacter.x - ConstResource.oneTileDist <= 0) {
            resultIsPenetrable = false;
            break;
          }

          //侵入先の可否判定
          if (mapData.collision[gridY][gridX - 1] == 1) {
            resultIsPenetrable = false;
            break;
          }

          //オブジェクトの当たり判定
          if (objectCollisionDetect(gridX - 1, gridY) == true) {
            resultIsPenetrable = false;
            break;
          }

          break;
        case ConstResource.upIdx:
          //画面端判定
          if (elmCharacter.y - ConstResource.oneTileDist < 0) {
            resultIsPenetrable = false;
            break;
          }

          //侵入先の可否判定
          if (mapData.collision[gridY - 1][gridX] == 1) {
            resultIsPenetrable = false;
            break;
          }

          //オブジェクトの当たり判定
          if (objectCollisionDetect(gridX, gridY - 1) == true) {
            resultIsPenetrable = false;
            break;
          }

          break;
        case ConstResource.rightIdx:
          //画面端判定
          if (elmCharacter.x + ConstResource.oneTileDist >= ConstResource.screenWidth) {
            resultIsPenetrable = false;
            break;
          }

          //侵入先の可否判定
          if (mapData.collision[gridY][gridX + 1] == 1) {
            resultIsPenetrable = false;
            break;
          }

          //オブジェクトの当たり判定
          if (objectCollisionDetect(gridX + 1, gridY) == true) {
            resultIsPenetrable = false;
            break;
          }

          break;
        default:
          break;
      }
      return resultIsPenetrable;
    }

    function objectCollisionDetect(x, y) {
      var retVal = false;

      for (var i = 0; i < gameObj.length; i++) {
        if (gameObj[i].existence) {
          var upperLeftX = gameObj[i].getCoordinate[0][0],
            upperLeftY = gameObj[i].getCoordinate[0][1],
            lowerRightX = gameObj[i].getCoordinate[1][0],
            lowerRightY = gameObj[i].getCoordinate[1][1];
          if (x >= upperLeftX && x <= lowerRightX && y >= upperLeftY && y <= lowerRightY) {
            retVal = true;
          }
        }

        // objX_min = mapData.object[i].topCoordinate[0];
        // objY_min = mapData.object[i].topCoordinate[1];
        // objX_max = objX_min + mapData.object[i].size[0] - 1;
        // objY_max = objY_min + mapData.object[i].size[1] - 1;

        // if (x >= objX_min && x <= objX_max && y >= objY_min && y <= objY_max) {
        //   retVal = true;
        // }
      }
      return retVal;
    }

    /*************
    枠&マップスライド判定
    キャラ画面端判定
  
    テクスチャの配列（Left: 1, Back: 2, Right: 3, Front: 0）
    *************/
    function isMapSlidable(direction) {
      let isSlidable = true;

      switch (direction) {
        case ConstResource.downIdx:
          // 枠&マップスライド判定
          if (-mapSpr.y + ConstResource.screenHeight >= mapSpr.height) isSlidable = false;

          // キャラ画面端判定
          if (elmCharacter.y < ConstResource.screenHeight / 2 + LetResource.charOffsetY) isSlidable = false;

          break;

        case ConstResource.leftIdx:
          // 枠&マップスライド判定
          if (-mapSpr.x - ConstResource.oneTileDist < 0) isSlidable = false;

          // キャラ画面端判定
          if (elmCharacter.x > ConstResource.screenWidth / 2 + LetResource.charOffsetX) isSlidable = false;

          break;

        case ConstResource.upIdx:
          // 枠&マップスライド判定
          if (-mapSpr.y - ConstResource.oneTileDist < 0) isSlidable = false;

          // キャラ画面端判定
          if (elmCharacter.y > ConstResource.screenHeight / 2 + LetResource.charOffsetY) isSlidable = false;

          break;

        case ConstResource.rightIdx:
          // 枠&マップスライド判定
          if (-mapSpr.x + ConstResource.screenWidth >= mapSpr.width) isSlidable = false;

          // キャラ画面端判定
          if (elmCharacter.x < ConstResource.screenWidth / 2 + LetResource.charOffsetX) isSlidable = false;

          break;

        default:
          break;
      }
      return isSlidable;
    }

    /******
    フレームごとに一定のペースでキャラをスライドさせる
    ******/
    var charSlide = function (direction, moveAmount) {
      if (typeof moveAmount == 'undefined') {
        moveAmount = 0;
      }
      //oneTileDistをn分割した移動単位pxずつスライド
      switch (direction) {
        case 0:
          elmCharacter.y += ConstResource.oneTileDist / 10;
          elmCharacter.y = Math.round(elmCharacter.y * 100) / 100; //丸め誤差対策
          //移動量制限のための moveAmount 変数
          moveAmount += ConstResource.oneTileDist / 10;
          moveAmount = Math.round(moveAmount * 100) / 100; //丸め誤差対策
          break;

        case 1:
          elmCharacter.x -= ConstResource.oneTileDist / 10;
          elmCharacter.x = Math.round(elmCharacter.x * 100) / 100; //丸め誤差対策

          //移動量制限のための moveAmount 変数
          moveAmount += ConstResource.oneTileDist / 10;
          moveAmount = Math.round(moveAmount * 100) / 100; //丸め誤差対策
          break;

        case 2:
          elmCharacter.y -= ConstResource.oneTileDist / 10;
          elmCharacter.y = Math.round(elmCharacter.y * 100) / 100; //丸め誤差対策

          //移動量制限のための moveAmount 変数
          moveAmount += ConstResource.oneTileDist / 10;
          moveAmount = Math.round(moveAmount * 100) / 100; //丸め誤差対策
          break;

        case 3:
          elmCharacter.x += ConstResource.oneTileDist / 10;
          elmCharacter.x = Math.round(elmCharacter.x * 100) / 100; //丸め誤差対策

          //移動量制限のための moveAmount 変数
          moveAmount += ConstResource.oneTileDist / 10;
          moveAmount = Math.round(moveAmount * 100) / 100; //丸め誤差対策
          break;

        default:
          break;
      }
      window.requestAnimationFrame(function () {
        if (moveAmount < ConstResource.oneTileDist) charSlide(direction, moveAmount);　// 1/60のタイミングで自分自身を実行
      });
    };

    /******
    フレームごとに一定のペースでマップをスライドさせる
    ******/
    var mapSlide = function (direction, moveAmount) {
      if (typeof moveAmount == 'undefined') {
        moveAmount = 0;
      }
      //oneTileDistをn分割した移動単位pxずつスライド
      switch (direction) {
        case ConstResource.downIdx:
          //マップスライド
          mapSpr.y -= ConstResource.oneTileDist / 10;
          mapSpr.y = Math.round(mapSpr.y * 100) / 100; //丸め誤差対策

          //オブジェクトスライド
          for (i = 0; i < objSpr.length; i++) {
            objSpr[i].y -= ConstResource.oneTileDist / 10;
            objSpr[i].y = Math.round(objSpr[i].y * 100) / 100; //丸め誤差対策
          }

          //移動量制限のための moveAmount 変数
          moveAmount += ConstResource.oneTileDist / 10;
          moveAmount = Math.round(moveAmount * 100) / 100; //丸め誤差対策
          break;

        case ConstResource.leftIdx:
          //マップスライド
          mapSpr.x += ConstResource.oneTileDist / 10;
          mapSpr.x = Math.round(mapSpr.x * 100) / 100; //丸め誤差対策

          //オブジェクトスライド
          for (i = 0; i < objSpr.length; i++) {
            objSpr[i].x += ConstResource.oneTileDist / 10;
            objSpr[i].x = Math.round(objSpr[i].x * 100) / 100; //丸め誤差対策
          }

          //移動量制限のための moveAmount 変数
          moveAmount += ConstResource.oneTileDist / 10;
          moveAmount = Math.round(moveAmount * 100) / 100; //丸め誤差対策
          break;

        case ConstResource.upIdx:
          //マップスライド
          mapSpr.y += ConstResource.oneTileDist / 10;
          mapSpr.y = Math.round(mapSpr.y * 100) / 100; //丸め誤差対策

          //オブジェクトスライド
          for (i = 0; i < objSpr.length; i++) {
            objSpr[i].y += ConstResource.oneTileDist / 10;
            objSpr[i].y = Math.round(objSpr[i].y * 100) / 100; //丸め誤差対策
          }

          //移動量制限のための moveAmount 変数
          moveAmount += ConstResource.oneTileDist / 10;
          moveAmount = Math.round(moveAmount * 100) / 100; //丸め誤差対策
          break;

        case ConstResource.rightIdx:
          //マップスライド
          mapSpr.x -= ConstResource.oneTileDist / 10;
          mapSpr.x = Math.round(mapSpr.x * 100) / 100; //丸め誤差対策

          //オブジェクトスライド
          for (i = 0; i < objSpr.length; i++) {
            objSpr[i].x -= ConstResource.oneTileDist / 10;
            objSpr[i].x = Math.round(objSpr[i].x * 100) / 100; //丸め誤差対策
          }

          //移動量制限のための moveAmount 変数
          moveAmount += ConstResource.oneTileDist / 10;
          moveAmount = Math.round(moveAmount * 100) / 100; //丸め誤差対策
          break;

        default:
          break;
      }
      window.requestAnimationFrame(function () {
        if (moveAmount < ConstResource.oneTileDist) mapSlide(direction, moveAmount);　// 1/60のタイミングで自分自身を実行
      });
    };

    /*
    定期的に実行される関数
    */
    async function loop() {
      while (LetResource.loopflag == 1) {
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, 200);
        });

        var now_obj = new Date();
        GameVal.sec = Math.floor(now_obj.getTime() / 1000) - startTime; //時間取得

        console.log("Set time trigger: " + GameVal.sec);

        if (LetResource.loopCallEventFlag == 1) {
          callEvent("auto");
        }
      }
    }

    function detectObject(x, y) {
      var retVal = -1;

      for (var i = 0; i < gameObj.length; i++) {
        if (gameObj[i].existence) {
          var upperLeftX = gameObj[i].getCoordinate[0][0],
            upperLeftY = gameObj[i].getCoordinate[0][1],
            lowerRightX = gameObj[i].getCoordinate[1][0],
            lowerRightY = gameObj[i].getCoordinate[1][1];
          if (x >= upperLeftX && x <= lowerRightX && y >= upperLeftY && y <= lowerRightY) {
            retVal = i;
          }
        }
      }
      return retVal;
    }

    /*
    UI 呼び出し関数

    return: 0->正常終了, それ以外->異常終了
    */
    function callUI() {
      //UIを呼び出された後は、UIルーチンに入る
      //UIルーチンから抜け出すまでは、通常のイベントハンドラや定期実行関数の動作を制限
      document.removeEventListener('keydown', handleKeyDown);

      document.addEventListener('keydown', handleKeyDown);
      return 0;
    }

    /*
    攻撃（アクション）　呼び出し関数
    isOpt: オプション付き攻撃用フラグ（reserved）
    return: 0->正常終了, それ以外->異常終了
    */
    function callAttack(isOpt) {
      /*
      攻撃成立判定
      MP制限, フィールド制限, 状態異常制限

      call event attackする？
      エフェクトアニメーションとイベントを同時に実行したい
      よって、この関数内で実行することも視野

      */

      /****攻撃ルーチン*****/

      var isAttackable = true, //MPやフィールド条件などにより、攻撃可否を判定する
        atkAnimFlag = false,
        atkResult;

      if (isAttackable) {
        //攻撃フロー
        //MP等　消耗処理
        //オブジェクト探索（mapJson.object.lengthで検索）

        var offsetX = 0, offsetY = 0;
        switch (getDirection()) {
          case ConstResource.upIdx:
            offsetY = -1;
            break;
          case ConstResource.downIdx:
            offsetY = 1;
            break;
          case ConstResource.rightIdx:
            offsetX = 1;
            break;
          case ConstResource.leftIdx:
            offsetY = -1;
            break;
        }
        var detectedObjIdx = detectObject(LetResource.currentPosX + offsetX, LetResource.currentPosY + offsetY);

        //↓の条件分岐に、オブジェクトのattackableフラグ及び、回避・空振り判定も含める
        if (detectedObjIdx >= 0) {
          //攻撃を実行し、結果を変数に格納する
          atkResult = gameObj[detectedObjIdx].attacked(100, "fire");
          objSpr[detectedObjIdx] = gameObj[detectedObjIdx].objSpr;

          switch (atkResult) {
            case "attacked":
              atkAnimFlag = true;
              makeEventFlag(gameObj[detectedObjIdx].objInfo.makeFlagAtk);
              makeEventFlag(gameObj[detectedObjIdx].objInfo.makeFlagAtk_notBroken);
              break;
            case "notAttacked":
              atkAnimFlag = false; //attackableではないため、攻撃しない
              makeEventFlag(gameObj[detectedObjIdx].objInfo.makeFlagNotAtk);
              break;
            case "broken":
              atkAnimFlag = true;
              makeEventFlag(gameObj[detectedObjIdx].objInfo.makeFlagAtk);
              makeEventFlag(gameObj[detectedObjIdx].objInfo.makeFlagBroken);
              break;
          }

        } else {
          //空振り コールイベント
          atkAnimFlag = true;
          GameVal.missShot += 1;
          atkResult = "missingShot"
        }

      } else {
        //攻撃不可フロー
        atkAnimFlag = false;
        GameVal.missAtk += 1;
        atkResult = "missAtk";
      }

      if (atkAnimFlag) callAtkAnime();

      callEvent(atkResult);
      /****************************/

      return 0;
    }

    /*
    アニメーション呼び出し
    */
    async function callAtkAnime() {
      document.removeEventListener('keydown', handleKeyDown);

      var currentDir = getDirection();
      // consoleDebug();
      elmAnimationCharacter[currentDir].visible = false;

      attackAnime.x = elmCharacter.x;
      attackAnime.y = elmCharacter.y;

      attackAnime[currentDir].zIndex = elmCharacter.zIndex;

      attackChar.x = elmCharacter.x;
      attackChar.y = elmCharacter.y;

      var efxOffsetX = 0, efxOffsetY = 0;
      switch (getDirection()) {
        case ConstResource.downIdx:
          efxOffsetY = ConstResource.oneTileDist;
          atkEfxSpr.zIndex = ConstResource.efxZIndex;
          break;
        case ConstResource.upIdx:
          efxOffsetY = -ConstResource.oneTileDist;
          atkEfxSpr.zIndex = attackAnime[currentDir].zIndex - 1;
          break;
        case ConstResource.leftIdx:
          efxOffsetX = -ConstResource.oneTileDist;
          atkEfxSpr.zIndex = ConstResource.efxZIndex;
          break;
        case ConstResource.rightIdx:
          efxOffsetX = ConstResource.oneTileDist;
          atkEfxSpr.zIndex = ConstResource.efxZIndex;
          break;
      }

      // console.log(attackChar[currentDir]);
      atkEfxSpr.x = attackAnime.x + efxOffsetX - 16;
      atkEfxSpr.y = attackAnime.y + efxOffsetY - 16;

      atkEfxSpr.visible = true;
      atkEfxSpr.gotoAndPlay(0);

      attackAnime[currentDir].visible = true;
      attackAnime[currentDir].gotoAndPlay(0);
    }

    /**
     * イベント呼び出し関数
     * input: x, y = 現座標, direction = 方向
     * mapJsonのevent
     */
    async function callEvent(trigger) {
      LetResource.eventData = 0; //イベントデータの初期化

      //console.log(getCoordinate());
      let x_now = getCoordinate().x;
      let y_now = getCoordinate().y;
      let dir_now = getDirection();

      //mapdata.event のループ作成　イベント検索
      // console.log(Object.keys(mapData['event']).length); //4
      // console.log("Event: ")
      // console.log(mapData.event)
      // console.log(mapData.event.length)
      // console.log(typeof(mapData.event))

      /*
      処理フロー
        座標のイベントチェック
        イベントある
        →イベント再生
        →イベントとは、以下4タイプの動作が単独、もしくは連続して実行されるもの
  
      ①オブジェクト移動 + アニメーションループ
      ②ポップアップ表示
      ③効果音・音声操作
      ④データダウンロード・ファイルマネージャ
      ⑤バトルフェーズ移行
      
      イベントは、/events/ 内のjsonファイルのevent要素の各行によって構成される
      */

      //イベント検索フロー
      //mapData.eventにおけるevent要素をループし、現在の座標・向きに該当するイベントを取得する
      // todo イベントが複数あった場合は
      //　→event要素のpriorityを参照し、最大値のものを先着1件処理
      //   →必須イベントが複数発生しないように気を付ける？

      //イベント優先度の初期化
      let priority_now = -1;
      //イベントインデックスの初期化
      let event_idx = -1;


      //イベント検索ループ
      for (i = 0; i < mapData.event.length; i++) {
        // console.log(mapData.event[i])
        let start_x = mapData.event[i].start[0]
        let start_y = mapData.event[i].start[1]

        let end_x = mapData.event[i].end[0]
        let end_y = mapData.event[i].end[1]

        // console.log("start_x: " + start_x)
        // console.log("start_y: " + start_y)
        // console.log("end_x: " + end_x)
        // console.log("end_y: " + end_y)

        //範囲検索
        if (x_now >= start_x && x_now <= end_x && y_now >= start_y && y_now <= end_y) {
          //方向および、トリガータイプの判断
          if (Object.values(mapData.event[i].direction).indexOf(dir_now) && mapData.event[i].trigger == trigger) {
            //イベント条件判断
            if (checkEventFlag(mapData.event[i].flag_cond) == 1) {

              // イベントあり

              // 優先度チェック
              if (mapData.event[i].priority >= priority_now) {
                priority_now = mapData.event[i].priority;
                event_idx = i;
              }
            }
          }
        }
      }

      if (event_idx < 0) {
        console.log("There is no event");
        LetResource.dialogueFlag = 0;
        app.stage.removeChild(dialogueBox);
        return 0; //イベントがなければ関数を終了
      }

      // console.log("event_idx: " + event_idx);
      // console.log("mapData.event[event_idx].ref: " + mapData.event[event_idx].ref);

      LetResource.eventData = await loadEvent(mapData.event[event_idx].ref);

      //await wait(50);
      // console.log("mapData.event[event_idx]: " + mapData.event[event_idx]);
      // console.log("LetResource.eventData: " + LetResource.eventData);
      // console.log("typeof(LetResource.eventData): " + typeof(LetResource.eventData));
      // console.log("LetResource.eventData.event.length: " + LetResource.eventData.event.length);

      //イベント再生フロー
      LetResource.loopCallEventFlag = 0; //定期実行関数によるイベント呼び出しを停止

      //event実行ループ
      for (i = 0; i < LetResource.eventData.event.length; i++) {
        let type = LetResource.eventData.event[i].type;
        // console.log(LetResource.eventData.event.length);
        // console.log("number" + i);
        //typeで分岐
        switch (type) {
          case 'text':
            /*
            ダイアログボックスがなければ表示
            */
            // if(!LetResource.dialogueFlag){
            //   LetResource.dialogueFlag = 1;
            //   app.stage.addChild(dialogueBox);
            // }
            //テキスト表示
            /*
            テキスト再生
             文字数分ループ
             もし改行フラグ（\n? や　専用要素）があれば改行
            アイコンを表示し、ボタン入力待ち（スペース or aボタン）
            テキスト削除

            次イベント要素へ進む
            */

            //kewdown handlerを解除し、playTextを実行
            document.removeEventListener('keydown', handleKeyDown);
            await playText(LetResource.eventData.event[i]);

            //keydown handlerを再開
            document.addEventListener('keydown', handleKeyDown);

            break;

          case 'popup':
            LetResource.dialogueFlag = 0;
            app.stage.removeChild(dialogueBox);
            break;

          case 'anime':
            LetResource.dialogueFlag = 0;
            app.stage.removeChild(dialogueBox);
            break;

          case 'sound':
            LetResource.dialogueFlag = 0;
            app.stage.removeChild(dialogueBox);
            break;

          case 'battle':
            LetResource.dialogueFlag = 0;
            app.stage.removeChild(dialogueBox);
            break;

          default:
            break;
        }
      }

      /*
      イベント終了処理
      */
      LetResource.loopCallEventFlag = 1;
      LetResource.dialogueFlag = 0;
      app.stage.removeChild(dialogueBox);
      makeEventFlag(mapData.event[event_idx].flag_make);
      // console.log(LetResource.eventFlags);
    }

    /*
    イベントフラグ条件を照会する
    flag_cond[0]: 0であるべきフラグインデックス
    flag_cond[1]: 1であるべきフラグインデックス

    return: 1->条件合致, 0->条件不整合, その他->異常終了
    */
    function checkEventFlag(flag_cond) {
      // console.log(flag_cond);

      for (let zero_idx = 0; zero_idx < flag_cond[0].length; zero_idx++) {
        if (LetResource.eventFlags[flag_cond[0][zero_idx]] != 0) {
          return 0; //eventFlags内の0指定フラグが0でなければ、条件不整合
        }
      }
      for (let one_idx = 0; one_idx < flag_cond[1].length; one_idx++) {
        if (LetResource.eventFlags[flag_cond[1][one_idx]] != 1) {
          return 0; //eventFlags内の1指定フラグが1でなければ、条件不整合
        }
      }

      return 1;
    }

    /*
    イベント後のフラグ更新
    flag_make[0]: 0であるべきフラグインデックス
    flag_make[1]: 1であるべきフラグインデックス

    return: 0->正常終了, その他->異常終了
    */
    function makeEventFlag(flag_make) {
      for (let zero_idx = 0; zero_idx < flag_make[0].length; zero_idx++) {
        //0指定フラグを0にする
        LetResource.eventFlags[flag_make[0][zero_idx]] = 0;
      }
      for (let one_idx = 0; one_idx < flag_make[1].length; one_idx++) {
        //1指定フラグを1にする
        LetResource.eventFlags[flag_make[1][one_idx]] = 1;
      }

      return 0; //正常終了
    }

    /**********
    テキスト再生
    **********/
    async function playText(event) {

      //テキスト表示
      /*
      テキスト再生
      文字数分ループ
      もし改行フラグ（\n? や　専用要素）があれば改行
      アイコンを表示し、ボタン入力待ち（スペース or aボタン）
      テキスト削除

      次イベント要素へ進む
      */
      if (!LetResource.dialogueFlag) {
        LetResource.dialogueFlag = 1;
        app.stage.addChild(dialogueBox);
      }

      //const text = 0;
      let textContainer = new PIXI.Container();
      textContainer.x = 100;
      textContainer.y = app.screen.height - 120;
      textContainer.zIndex = ConstResource.uiZIndex + 1;
      app.stage.addChild(textContainer);

      //テキスト再生部
      for (let j = 0; j < event.msg.length; j++) {
        const text = new PIXI.Text(event.msg[j], textStyle);
        text.y = j * ConstResource.textSize * 1.5;
        textContainer.addChild(text);
      }

      //ボタン応答待ち部
      await WaitForEnterKey();

      //テキストクリア部
      app.stage.removeChild(textContainer);
    }

    /*********
    クリック入力待ち 
    *********/
    function WaitForEnterKey() {
      return new Promise(resolve => document.addEventListener("keydown", e => {
        if (e.key == KeyConfig.enter) {
          // document.removeEventListener("keydown");
          // console.log("resolved");
          resolve();
        }
      }));
    }

    /*********
    wait
    *********/
    async function wait(msec) {
      return new Promise(resolve => setTimeout(resolve, msec));
    }


    /******
    イベントjsonの呼び出し
    ******/
    async function loadEvent(json_file) {
      const response = await fetch(json_file);
      return response.json();
    }

    //キー押下応答部分
    function handleKeyDown(e) {
      var
        key = e.key,
        i;

      /**
      * 全てのアニメーションを非表示
      */
      if (key == KeyConfig.up || key == KeyConfig.down || key == KeyConfig.left || key == KeyConfig.right) {
        for (i = 0; i < 4; i++) {
          elmAnimationCharacter[i].visible = false;
          attackAnime[i].visible = false;
        }

        /********
        矢印キーの方向のアニメーションのみ表示
        テクスチャの配列（Left: 1, Back: 2, Right: 3, Front: 0）
        ********/
        //shiftKey同時押しによる「向きのみ変更」 

        switch (key) {
          case KeyConfig.left:
            charMove(1, e.shiftKey);
            break;

          case KeyConfig.up:
            charMove(2, e.shiftKey);
            break;

          case KeyConfig.right:
            charMove(3, e.shiftKey);
            break;

          case KeyConfig.down:
            charMove(0, e.shiftKey);
            break;

          default:
            break;
        }

      } else if (key == KeyConfig.check) {
        callEvent("manual");
      } else if (key == KeyConfig.menu) {
        callUI();
      } else if (key == KeyConfig.attack) {
        callAttack();
      } else if (key == KeyConfig.enter && e.shiftKey) {
        gridOverlay(); //デバッグ用のグリッドのオン・オフ
      }


    }

    /*************
    座標取得
    *************/
    function getCoordinate() {
      let charCoordinate = new Array; //戻り値

      let charX = elmCharacter.x - LetResource.charOffsetX; //キャラの座標
      let charY = elmCharacter.y - LetResource.charOffsetY; //キャラの座標
      let halfScrWid = ConstResource.screenWidth / 2; //画面の中心点
      let halfScrHgh = ConstResource.screenHeight / 2; //画面の中心点
      let charX_adj = charX - ConstResource.oneTileDist / 2; //ずれを補正した座標点（キャラの左上のポイント）
      let charY_adj = charY - ConstResource.oneTileDist / 2; //ずれを補正した座標点（キャラの左上のポイント）

      //左右判定
      if (charX < halfScrWid) { //左寄り
        charCoordinate.x = charX_adj / ConstResource.oneTileDist;
      } else if (charX > halfScrWid) { //右寄り
        charCoordinate.x = (mapSpr.width - (ConstResource.screenWidth - charX_adj)) / ConstResource.oneTileDist;
      } else { //中心
        charCoordinate.x = (-mapSpr.x + halfScrWid - ConstResource.oneTileDist / 2) / ConstResource.oneTileDist;
      }

      //上下判定
      if (charY < halfScrHgh) { //上寄り
        charCoordinate.y = charY_adj / ConstResource.oneTileDist;
      } else if (charY > halfScrHgh) { //下寄り
        charCoordinate.y = (mapSpr.height - (ConstResource.screenHeight - charY_adj)) / ConstResource.oneTileDist;
      } else { //中心
        charCoordinate.y = (-mapSpr.y + halfScrHgh - ConstResource.oneTileDist / 2) / ConstResource.oneTileDist;
      }
      return charCoordinate;
    }

    /*************
    方向取得
    *************/
    function getDirection() {
      let direction = LetResource.lastDir;
      for (k = 0; k < 4; k++) {
        if (elmAnimationCharacter[k].visible) {
          direction = k;
          break
        }
      }
      LetResource.lastDir = direction;
      return direction;
    }

    function consoleDebug() {
      console.log(mapSpr.x);
      console.log(mapSpr.y);
      console.log(elmCharacter.x);
      console.log(elmCharacter.y);
      console.log("elmChar.zIndex: " + elmCharacter.zIndex);
      console.log("mapSpr.zIndex: " + mapSpr.zIndex);
      console.log("objSpr[0].zIndex: " + objSpr[0].zIndex);
    }

    /*
    格子をオーバーレイさせるデバッグ用の関数
    */
    function gridOverlay() {
      if (LetResource.gridFlag == 0) {
        app.stage.addChild(gridContainer);
        LetResource.gridFlag = 1;
      } else {
        app.stage.removeChild(gridContainer);
        LetResource.gridFlag = 0;
      }
      return 0;
    }

  });

/*
* 読み込む
*/
// loader.load();