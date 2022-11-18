import { MyObject3D } from "../webgl/myObject3D";
import { Mesh } from 'three/src/objects/Mesh';
import { Object3D } from 'three/src/core/Object3D';
import { Util } from "../libs/util";
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Func } from "../core/func";
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry';

// 閉じてる
export class EyeD extends MyObject3D {

  private _con:Object3D;

  private _speed:number = 1;

  constructor() {
    super()

    this._c = 0;

    this._con = new Object3D();
    this.add(this._con);

    for(let i = 0; i < 1; i++) {
      const m = new Mesh(
        new PlaneGeometry(1,1),
        new MeshBasicMaterial({
          color:0x000000,
          transparent:true,
          depthTest:false,
        })
      );
      this._con.add(m);
    }
  }


  protected _update():void {
    // if(!this.visible) return;
    this._c += this._speed;

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    this._con.children.forEach((val) => {
      let s = Math.max(sw, sh) * 0.09;
      val.scale.set(s, s * 0.1, 1);
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