import { Func } from '../core/func';
import { Canvas } from '../webgl/canvas';
import { Object3D } from 'three/src/core/Object3D';
import { Update } from '../libs/update';
import { Item } from './item';
import { Vector3 } from 'three/src/math/Vector3';
import { MousePointer } from '../core/mousePointer';
import { CircleGeometry } from 'three/src/geometries/CircleGeometry';
import { EyeA } from './EyeA';
import { EyeB } from './EyeB';
import { EyeC } from './EyeC';
import { EyeD } from './EyeD';
import { Conf } from '../core/conf';
import { Util } from '../libs/util';
import { Val } from '../libs/val';
import { Tween } from '../core/tween';
import { Color } from "three/src/math/Color";
import { HSL } from '../libs/hsl';
import { Param } from '../core/param';


export class Visual extends Canvas {

  private _con:Object3D;
  private _item:Array<Item> = [];
  private _eyeA:Array<EyeA> = [];
  private _eyeB:Array<EyeB> = [];
  private _eyeC:Array<EyeC> = [];
  private _eyeD:Array<EyeD> = [];
  private _nowEye:number = 0;
  private _changeRate:Val = new Val(1);
  private _changeRate2:Val = new Val(1);
  private _bgColor:Color = new Color()

  constructor(opt: any) {
    super(opt);

    this._con = new Object3D();
    this.mainScene.add(this._con);

    // 共通で使うGeo
    const eyeShape = new CircleGeometry(0.5, 64);
    const geoShapeA = new CircleGeometry(0.5, 32);
    const geoShapeB = new CircleGeometry(0.5, 8);

    for(let i = 0; i < Conf.instance.NUM; i++) {
      const item = new Item({
        id:i,
        geoShape:i % 2 == 0 ? geoShapeA : geoShapeB,
      })
      if(i == 0) {
        this._con.add(item);
      } else {
        this._item[i - 1].add(item);
      }

      this._item.push(item);
    }

    // 目
    for(let i = 0; i < 2; i++) {
      const eyeA = new EyeA();
      const eyeB = new EyeB();
      const eyeC = new EyeC({id:i, geoShape:eyeShape});
      const eyeD = new EyeD();

      this._con.add(eyeA);
      this._con.add(eyeB);
      this._con.add(eyeC);
      this._con.add(eyeD);

      this._eyeA.push(eyeA);
      this._eyeB.push(eyeB);
      this._eyeC.push(eyeC);
      this._eyeD.push(eyeD);

      eyeA.visible = false;
      eyeB.visible = false;
      eyeC.visible = false;
      eyeD.visible = false;
    }

    this._changeEye();
    this._bgColor.copy(Param.instance.colorA);
    this._resize();
  }


  private _closeEye(): void {
    this._eyeA.forEach((val,i) => {
      val.visible = false;
      this._eyeB[i].visible = false;
      this._eyeC[i].visible = false;
      this._eyeD[i].visible = true;
    });
  }


  private _changeEye(): void {
    this._eyeA.forEach((val,i) => {
      val.visible = (this._nowEye == 0);
      this._eyeB[i].visible = (this._nowEye == 1);
      this._eyeC[i].visible = (this._nowEye == 2);
      this._eyeD[i].visible = false;
    });

    Tween.instance.a(this._changeRate2, {
      val:[0, 1]
    }, 0.2, 0, Tween.Power3EaseOut);

    // カラー決定
    const col:Color = new Color();
    const hsl:HSL = new HSL();
    col.getHSL(hsl);
    hsl.h = Util.instance.random(0, 1)
    hsl.s = 0.4;
    hsl.l = 0.5;
    col.setHSL(hsl.h, hsl.s, hsl.l);
    Param.instance.colorA = col.clone();
    Param.instance.colorB = new Color(1 - col.r, 1 - col.g, 1 - col.b);
  }


  private _change(): void {
    this._nowEye = Util.instance.randomInt(0, 2);

    Tween.instance.a(this._changeRate2, {
      val:[1, 0]
    }, 0.1, 0, Tween.Power3EaseOut, null, null, () => {
      Tween.instance.a(this._changeRate, {
        val:[0, 1]
      }, 0.2, 0, Tween.EaseNone, () => {
        this._closeEye();
      }, null, () => {
        this._changeEye();
      });
    });
  }


  protected _update(): void {
    super._update()

    if(this._c % 100 == 0) {
      this._change();
    }

    this._con.position.y = Func.instance.screenOffsetY() * -1;

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    const mkake = 0.0025 * 1;
    const mx = MousePointer.instance.easeNormal.x * w * mkake;
    const my = MousePointer.instance.easeNormal.y * h * mkake * -1;

    let baseRadius = Math.min(w, h) * 0.5;
    let moveRadius = 0;
    let center = new Vector3(mx, my, 0);
    let kake = 0.99;

    this._item.forEach((val) => {
      val.updateItem({
        radius:baseRadius,
        moveRadius:moveRadius * 1,
        center:center.clone(),
      });

      moveRadius = baseRadius - (baseRadius * kake);
      baseRadius *= kake;
    });

    // 目
    const d = Math.sin(this._c * 0.025) * w * 0.05;
    this._eyeA.forEach((val,i) => {
      val.position.x = w * 0.15 + d;
      val.position.y = my * 30 + h * 0.1;
      if(i == 1) val.position.x *= -1;
      val.position.x += mx * 30;

      val.scale.set(1, Util.instance.mix(0.000001, 1, this._changeRate2.val), 1);

      // val.rotation.z = Util.instance.radian(20) * (i == 0 ? 1 : -1);

      this._eyeB[i].position.copy(val.position);
      this._eyeB[i].scale.copy(val.scale);
      this._eyeB[i].rotation.z = Util.instance.mix(0, Util.instance.radian(20) * (i == 0 ? 1 : -1), this._changeRate2.val);

      this._eyeC[i].position.copy(val.position);
      this._eyeC[i].scale.copy(val.scale);
      // this._eyeC[i].rotation.copy(val.rotation);

      this._eyeD[i].position.copy(val.position);
      // this._eyeD[i].rotation.copy(val.rotation);
    });

    if (this.isNowRenderFrame()) {
      this._render()
    }
  }


  private _render(): void {
    this._bgColor.r += (Param.instance.colorA.r - this._bgColor.r) * 0.1;
    this._bgColor.g += (Param.instance.colorA.g - this._bgColor.g) * 0.1;
    this._bgColor.b += (Param.instance.colorA.b - this._bgColor.b) * 0.1;

    Param.instance.bgColor = this._bgColor.clone();

    this.renderer.setClearColor(this._bgColor, 1);
    this.renderer.render(this.mainScene, this.cameraOrth);
  }


  public isNowRenderFrame(): boolean {
    return this.isRender && Update.instance.cnt % 1 == 0
  }


  _resize(isRender: boolean = true): void {
    super._resize();

    const w = Func.instance.sw();
    const h = Func.instance.sh();

    this.renderSize.width = w;
    this.renderSize.height = h;

    this._updateOrthCamera(this.cameraOrth, w, h);
    this._updatePersCamera(this.cameraPers, w, h);

    let pixelRatio: number = window.devicePixelRatio || 1;

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h);
    this.renderer.clear();

    if (isRender) {
      this._render();
    }
  }
}
