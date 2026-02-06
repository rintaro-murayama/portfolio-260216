class CharObj extends GameObj {

    constructor(objList) {
        // super(objList);

        super(objList);

        //this.loadAnimSpr(this.objInfo);
        this.elmChar = 0;

        //npcタイプの場合、フレームの順序方法を必要とする
        // animArrayの形式例：[[0, 1, 2, 0],[0, 1, 2, 0],[0, 1, 2, 0],[0, 1, 2, 0]]
        this.animArray = this.objInfo.animArray;

        this.charactor = [];
        this.elmAnimChar = [];

        //外部で"app"が宣言されていることを前提とする
        //app.loader.add(this.objInfo.id, this.objInfo.spriteJson).load(this.loadAnimSpr);

        this.elmChar = new PIXI.Container();


        // fetch(this.objInfo.spriteJson)
        // .then(response => response.json())
        // .then(data => {
        //     console.log(data.frames.san00);
        //     console.log(data.frames);
        //     PIXI.Texture.fromFrame("san00");
        // });

        //外部で"loader"が宣言されていることを前提とする
        // console.log(this.loadJson(this.objInfo.spriteJson));
        // this.loadAnimSpr();
        loader.add(this.objInfo.id, this.objInfo.spriteJson).load(this.loadAnimSpr);
    }

    // 四方のアニメーションスプライトを宣言する（コンストラクタ時にanimated spriteを返却する）
    // （もしあれば）攻撃用anim sprを宣言する

    get getSprite() {
        // this.loadAnimSpr();
        return this.elmChar;
    }

    async loadJson(jsonURL) {
        var retVal;
        await fetch(jsonURL)
            .then(response => response.json())
            .then(data => {
                retVal = data;
            });
        //console.log(retVal);
        return retVal;
    }

    loadAnimSpr(resources) {
        console.log(resources);
        var tmpChar= [];
        //コンストラクタによって呼び出された関数内ではthisの概念が成立しないため、一度ローカル変数を宣言し、それを関数の戻り値とする。そして呼び出し元のコンストラクタ内でそれをthisに代入する。

        var i, j, k;
        for (i = 0; i < 4; i++) {

            //this.charactor[i] = [];
            tmpChar[i] = [];

            for (j = 0; j < this.animArray[i].length; j++) {
                var frame = this.animArray[i][j];
                this.charactor[i].push(PIXI.Texture.fromFrame("./img/San/San_" + i + frame + ".png"));
            }
        }

        for (k = 0; k < 4; k++) {
            this.elmAnimChar.push(new PIXI.extras.AnimatedSprite(this.charactor[k]));
            this.elmAnimChar[k].gotoAndPlay(4);
            this.elmAnimChar[k].loop = true;
            this.elmAnimChar[k].animationSpeed = this.objInfo.animationSpeed; //要定義
            this.elmAnimChar[k].anchor.set(0.5);
            this.elmAnimChar[k].visible = false;
            this.elmChar.addChild(this.elmAnimChar[k]);
            this.elmAnimChar[k].x = (this.objInfo.topCoordinate[0] - ConstResource.firstPosX) * ConstResource.oneTileDist;
            this.elmAnimChar[k].y = (this.objInfo.topCoordinate[1] - ConstResource.firstPosY) * ConstResource.oneTileDist;
        }

        /*
        正面を表示する
        */
        this.elmAnimChar[ConstResource.downIdx].visible = true;
        this.elmChar.scale.x = 32 / 512;
        this.elmChar.scale.y = 32 / 512;
        this.elmChar.position.set(ConstResource.screenWidth / 2 + LetResource.charOffsetX, ConstResource.screenHeight / 2 + LetResource.charOffsetY);
        this.elmChar.zIndex = Math.ceil(ConstResource.screenHeight / 2 / ConstResource.oneTileDist);
    }
}

class NpcObj extends CharObj {
    constructor(objList) {
        super(objList);
    }

    //プレイヤーの発見
    detectPlayer() {
        return 0;
    }
}

class EnemyObj extends NpcObj {

    constructor(objList) {
        super(objList);
    }

    // 何をさせるかアイドリング時の周回
    // 一定の条件を満たしたプレイヤーへの戦闘行為

    //戦闘時の通常攻撃
    //戦闘時の特殊アクション
}