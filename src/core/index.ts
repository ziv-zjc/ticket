import assert from "power-assert";
import { Section } from "./section";
import Scene from "./scene";
import { SECTION_WIDTH, SECTION_HEIGHT, PIXELS } from "./config";

interface ISectionPainter {
  section: Section;
  node: HTMLCanvasElement;
}

export interface IPainterOptions {
  sectionWidth: number
  sectionHeight: number
  pixels: number
}
/**
 * 渲染逻辑
 */
export default class Painter {
  elemId: string;
  private _scene: Scene;
  private _sectionPainter: ISectionPainter[] = [];
  private _stage: HTMLElement;
  private _options: IPainterOptions;
  constructor(id: string, scene: Scene, options?: Partial<IPainterOptions>) {
    this.elemId = id;
    this._scene = scene;

    this._options = {
      sectionWidth: SECTION_WIDTH,
      sectionHeight: SECTION_HEIGHT,
      pixels: PIXELS,
      ...options,
    };

    this.init();
  }

  init() {
    const stage = document.getElementById(this.elemId);
    assert(stage, `无法找到id为${this.elemId}的元素`);

    const { sectionHeight, sectionWidth, pixels } = this._options;
    //计算圆心角&&圆心
    const deg = (2 * Math.atan(sectionWidth / (sectionHeight * 4)) * 180) / Math.PI;
    const center = {
      x: sectionWidth / 2,
      y: sectionHeight * 2
    };

    this._stage = stage as HTMLElement;
    const sectionList = Array.from(this._scene.sectionMap.values());
    const transformOriginTEXT = `${center.x}px ${center.y}px`;
    sectionList.forEach((section, i) => {
      const canvas = document.createElement("canvas");
      canvas.id = `section_${section.id}`;
      canvas.width = sectionWidth * pixels;
      canvas.height = sectionHeight * pixels;
      canvas.style.width = sectionWidth + "px";
      canvas.style.height = sectionHeight + "px";
      canvas.style.transformOrigin = transformOriginTEXT;
      canvas.style.transform = `rotate(${deg * i}deg)`;
      // canvas.style =
      this._sectionPainter.push({
        section,
        node: canvas
      });
    });

    this._sectionPainter.forEach(({ node }) => {
      this._stage.appendChild(node);
    });
    this._stage.style.transformOrigin = transformOriginTEXT;
    this._stage.style.transform = `rotate(${(-deg * (sectionList.length - 1)) /2}deg)`;
  }

  paint() {
    this._sectionPainter.forEach(({ node, section }) => {
      const ctx = node.getContext("2d") as CanvasRenderingContext2D;
      const SECTION_WIDTH = node.width;
      const SECTION_HEIGHT = node.height;
      ctx.clearRect(0, 0, SECTION_WIDTH, SECTION_HEIGHT);

      const seatWidth = SECTION_WIDTH / section.seats[section.seats.length - 1].length / 2;
      const seatHeight = SECTION_HEIGHT / section.seats.length / 2;
      const sepWidth = seatWidth;
      const sepHeight = seatHeight;
      section.seats
        .slice()
        .reverse()
        .forEach((row, rowNum) => {
          row.forEach((seat, colNum) => {
            ctx.fillStyle = seat.color;
            const x = (colNum + rowNum) * (sepWidth + seatWidth);
            const y = rowNum * (sepHeight + seatHeight);
            ctx.fillRect(x, y, seatWidth, seatHeight);
          });
        });
      ctx.fill();
    });
  }
}
