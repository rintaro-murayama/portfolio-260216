/**********************************/
//ゲームオブジェクトクラス
class GameObj {
    // MapJsonの object 列挙体をコンストラクタに渡す
    constructor(objList) {
      this.objInfo = objList;
      this.objTexture = new PIXI.Texture.from(objList.file);
      this.objSpr = new PIXI.Sprite(this.objTexture);
      this.objSpr.x = (objList.topCoordinate[0] - ConstResource.firstPosX) * ConstResource.oneTileDist;
      this.objSpr.y = (objList.topCoordinate[1] - ConstResource.firstPosY) * ConstResource.oneTileDist;
      this.objSpr.zIndex = (this.objSpr.y + objList.size[1] - 1) / ConstResource.oneTileDist;
  
      // 左上と右下の座標点を定義
      this.upperLeftX = this.objInfo.topCoordinate[0];
      this.upperLeftY = this.objInfo.topCoordinate[1];
  
      this.lowerRightX = this.objInfo.topCoordinate[0] + this.objInfo.size[0] - 1;
      this.lowerRightY = this.objInfo.topCoordinate[1] + this.objInfo.size[1] - 1;
    }
  
    get getSprite() {
      return this.objSpr;
    }
  
    get getCoordinate() {
      /*
      左上の座標点、右下の座標点を返す
      return [[左上_x, 左上_y], [右下_x, 右下_y]];
      */
     // this.coordinate
     // upperLeftX
      return [[this.upperLeftX, this.upperLeftY],[this.lowerRightX, this.lowerRightY]];
    }
  
    get existence(){
      return this.objInfo.exist;
    }

    get attackable(){
        return this.objInfo.attackable;
    }

    get breakable(){
        return this.objInfo.breakable;
    }

    get HP(){
        return this.objInfo.HP;
    }

    set HP(HP_new){
        this.objInfo.HP = HP_new;
    }
  
    consoleObjStat() {
      console.log(this.objInfo);
      return;
    }
  
    attacked(atkPoint, atkType) {
      var retval;
      if (this.attackable && this.HP > 0) {
        this.HP = this.HP - atkPoint; //本当はタイプに応じた複雑な計算式を用意する
  
        if (this.breakable && this.HP <= 0) {
          this.broken();
          retval = "broken";
        } else {
          retval = "attacked";
        }
      } else {
        retval = "notAttacked";
      }
      return retval;
    }
  
    broken() {
      this.objInfo.attackable = false;
      this.objInfo.breakable = false;
      this.objInfo.exist = false;

      this.objSpr.visible = false;
    }
  
  }
  /**********************************/