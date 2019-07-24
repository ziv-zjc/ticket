import assert from "power-assert";
import { TSectionId, TRow, TTicketNum } from "./type";
import { Section } from "./section";
import { SECTION_ROWS, SECTION_BASE_SEAT_NUM, DEFAULT_SECTIONS } from "./config";

export interface ISceneOptions {
  sections: TSectionId[]
  rows: number
  baseSeatNum: number
  threshold: number
}
/**
 * 场景，整个选票的流程：preCheck -> scene.select(场馆级调度) -> section.select(区块级调度)
 */
export default class Scene {
  sectionMap: Map<TSectionId, Section> = new Map();
  private _activeSection: Section;
  private _rows: TRow;
  private _options: ISceneOptions;
  constructor(options?: Partial<ISceneOptions>) {
    this._options = {
      sections: DEFAULT_SECTIONS as TSectionId[],
      rows: SECTION_ROWS,
      baseSeatNum: SECTION_BASE_SEAT_NUM,
      threshold: Math.ceil(SECTION_ROWS / 4),
      ...options,
    };
    this._rows = this._options.threshold;
    this._initSection();
  }

  get sections() {
    return this._options.sections;
  }

  get restSeatNum() {
    let num = 0;
    Array.from(this.sectionMap.values()).forEach(section => {
      num += section.restSeatNumByActiveRow;
    });
    return num;
  }

  private _initSection() {
    this.sections.forEach(section => {
      this.sectionMap.set(
        section,
        new Section(section, this._options.rows,this._options.baseSeatNum)
      );
    });
    this._activeSection = this.sectionMap.get(this.sections[0]) as Section;
  }

  private _next() {
    const index = this.sections.indexOf(this._activeSection.id) + 1;
    if (index === this.sections.length) {
      return this.sectionMap.get(this.sections[0]) as Section;
    }
    assert(index > 0, `下一个区号必须在1-${this.sections.length - 1}之间`);
    return this.sectionMap.get(this.sections[index]) as Section;
  }

  /**
   * 场馆余票预校验
   *
   * @param {TTicketNum} n
   * @returns
   * @memberof Scene
   */
  private _preCheck(n: TTicketNum) {
    return Array.from(this.sectionMap.values()).some(section =>
      section.preCheck(n)
    );
  }

  private _sellRest(n: TTicketNum) {
    let done = false;
    let rn: number = n;
    if (this.restSeatNum < n) {
      return true;
    }
    for (const section of this.sectionMap.values()) {
      // 无票跳过
      if (!section.restSeatNumByActiveRow) {
        done = true;
        continue;
      }
      done = false;
      const _n = Math.min(section.restSeatNumByActiveRow, rn) as TTicketNum;
      rn = rn - _n;
      section.select(_n);
      if (!rn) {
        break;
      }
    }
    return done;
  }

  private _select(n: TTicketNum) {
    if (!this._activeSection.preCheck(n, this._rows)) {
      const nextSection = this._next();
      if (!nextSection) {
        return;
      }
      this._activeSection = nextSection;
      // 校验若走完一圈，更新阈值
      if (this.sections.indexOf(this._activeSection.id) === 0) {
        this._rows += this._options.threshold;
      }
    }
    this._activeSection.select(n);
  }

  sell(n: TTicketNum) {
    console.log("开始售票, 需购%s", n);
    if (!this._preCheck(n)) {
      console.log("开始补票");
      const done = this._sellRest(n);
      if (done) {
        console.log("场馆余票不足，购票失败");
      }
      return !done;
    }
    this._select(n);
    return true;
  }
}
