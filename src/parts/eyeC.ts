import { MyObject3D } from "../webgl/myObject3D";
import { Mesh } from 'three/src/objects/Mesh';
import { Object3D } from 'three/src/core/Object3D';
import { Util } from "../libs/util";
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Func } from "../core/func";
import { MousePointer } from "../core/mousePointer";

// 普通
export class EyeC extends MyObject3D {

  private _con:Object3D;
  private _item:Array<Mesh> = [];
  private _speed:number = 1;

  constructor(opt:any) {
    super()

    this._c = 0;

    this._con = new Object3D();
    this.add(this._con);

    const num = 2;
    for(let i = 0; i < num; i++) {
      let m = new Mesh(
        opt.geoShape,
        new MeshBasicMaterial({
          color:i == 0 ? 0xffffff : 0x000000,
        })
      );
      this._con.add(m);
      this._item.push(m);
    }
  }


  protected _update():void {
    // if(!this.visible) return;
    this._c += this._speed;

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    const mx = MousePointer.instance.easeNormal.x;
    const my = MousePointer.instance.easeNormal.y * -1;

    this._item.forEach((val,i) => {
      let s = Math.max(sw, sh) * 0.1;
      if(i == 1) s *= 0.25;
      val.scale.set(s, s, 1);

      if(i == 1) {
        const rad = Util.instance.radian(this._c);
        const r = s * 0.15;
        val.position.x = Math.sin(rad) * r + mx * s * 0.5;
        val.position.y = Math.cos(rad) * r + my * s * 0.5;
      }
    });

    const rad = Util.instance.radian(this._c * -1.2);
    const r = sw * 0.025;
    this._con.position.x = Math.sin(rad) * r;
    this._con.position.y = Math.cos(rad) * r;
  }


  protected _resize(): void {
    super._resize();
  }
}