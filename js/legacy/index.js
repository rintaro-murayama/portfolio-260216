/**
 * @fileoverview BOMBER MAID
*/

'use strict';

/**
 * @namespace
 */
var RM_MAG = RM_MAG || {};

/**
 * @namespace RM_MAG_OBJECT
 * @memberof RM_MAG
 */
RM_MAG.RM_MAG_OBJECT = {
  init: function () {

    var
    Config       = require('./Config'),
    Character    = require('./Character'),
    Controller   = require('./Controller'),
    Stage        = require('./Stage'),

    /**
     * ローダーを生成
     */
    loader = new PIXI.loaders.Loader();

    /**
     * 画像の読み込み
     */
    loader
    .add('sprite', './img/PlayersSprjson.json')
    .once('complete', function(){
      new Stage();
      Config.character  = new Character();
      Config.controller = new Controller();
    });

    /**
     * 読み込む
     */
    loader.load();

  }
};

RM_MAG.RM_MAG_OBJECT.init();
