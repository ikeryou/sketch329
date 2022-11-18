import { MyObject3D } from "../webgl/myObject3D";
import { Mesh } from 'three/src/objects/Mesh';
import { Object3D } from 'three/src/core/Object3D';
import { Util } from "../libs/util";
import { MeshBasicMaterial } from 'three/src/materials/MeshBasicMaterial';
import { Func } from "../core/func";
import { MousePointer } from "../core/mousePointer";
import { ShapeGeometry } from 'three/src/geometries/ShapeGeometry';
import { Shape } from 'three/src/extras/core/Shape';

// 怒ってる
export class EyeB extends MyObject3D {

  private _con:Object3D;
  private _item:Array<Mesh> = [];
  private _speed:number = 1;

  constructor() {
    super()

    this._c = 0;

    this._con = new Object3D();
    this.add(this._con);

    const geo = this._makeGgeo();

    const num = 3;
    for(let i = 0; i < num; i++) {
      let m = new Mesh(
        geo,
        new MeshBasicMaterial({
          color:[0x000000, 0xffffff, 0x000000][i],
        })
      );
      this._con.add(m);
      this._item.push(m);

      if(i == 0) m.visible = false;
    }
  }


  private _makeGgeo():ShapeGeometry {
    const shape = new Shape();

    let radius = 0.65;
    let i = 0;
    while(i <= 180) {
      const rad = Util.instance.radian(90 + i);
      const x = Math.sin(rad) * radius;
      const y = Math.cos(rad) * radius;
      if(i == 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
      i += 10;
    }
    shape.lineTo(shape.getPointAt(0).x, shape.getPointAt(0).y);

    return new ShapeGeometry(shape);
  }


  protected _update():void {
    // if(!this.visible) return;
    this._c += this._speed;

    const sw = Func.instance.sw();
    const sh = Func.instance.sh();

    const mx = MousePointer.instance.easeNormal.x;
    // const my = MousePointer.instance.easeNormal.y * -1;

    this._item.forEach((val,i) => {
      let s = Math.max(sw, sh) * 0.1;
      if(i == 2) s *= 0.35;
      val.scale.set(s, s, 1);

      const rad = Util.instance.radian(this._c);
      const r = s * 0.15;

      if(i == 2) {
        val.position.x = Math.sin(rad) * r + mx * s * 1;
        // val.position.y = Util.instance.map(my, 0, s * 0.2, -1, 1);
      }

      if(i == 0) {
        val.position.x = 0;
        val.position.y = -s * 0.05;
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