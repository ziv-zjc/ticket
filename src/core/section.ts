import assert from "power-assert";
import { TSectionId, TRow, TTicketNum, Colors } from "./type";
import { Seat } from "./seat";

/**
 * 区
 */
export class Section {
  id: TSectionId;
  seats: Seat[][]; // 座位矩阵
  private activeSeat: Seat;
  private rows: TRow;
  private baseSeatNum: number; // 座位基数
  private emptySeatMap: Map<TTicketNum, Seat[]> = new Map(); // 空座号码表
  constructor(id: TSectionId, rows: TRow, baseSeatNum: number) {
    this.rows = rows;
    this.baseSeatNum = baseSeatNum;
    this.id = id;
    this._initSeats();
  }
  get full() {
    return (
      this.activeRowNum === this.rows - 1 &&
      this.activeColNum === this.activeRow.length - 1 &&
      this.activeSeat.status === 1
    );
  }
  /**
   * 当前行号
   * @readonly
   * @memberof Section
   */
  get activeRowNum() {
    return this.activeSeat.row;
  }
  /**
   * 当前列号
   *
   * @readonly
   * @memberof Section
   */
  get activeColNum() {
    return this.activeSeat.col;
  }
  /**
   * 当前行元素
   *
   * @readonly
   * @memberof Section
   */
  get activeRow() {
    return this._findSeatRows(this.activeSeat);
  }

  /**
   * 空座位总数
   *
   * @readonly
   * @memberof Section
   */
  get emptySeatNum() {
    let num = 0;
    for (const key of this.emptySeatMap.keys()) {
      const emptySeatList = this.emptySeatMap.get(key) || [];
      num += key * emptySeatList.length;
    }
    return num;
  }

  get restSeatNumByActiveRow() {
    const maxActiveColNum = this.activeRow.length;
    return this.activeSeat.status ? 0 : maxActiveColNum - this.activeColNum;
  }

  get restSeatNum() {
    let num = 0;
    for (let index = this.activeRowNum + 2; index < this.rows; index++) {
      num += this.seats[index].length;
    }
    return num + this.restSeatNumByActiveRow + this.emptySeatNum;
  }

  private _initSeats() {
    const seats: Seat[][] = [];
    for (let i = 0; i < this.rows; i++) {
      seats.push([]);
      for (let y = 0; y < this.baseSeatNum + 2 * i; y++) {
        seats[i].push(new Seat(this.id, i, y));
      }
    }
    this.seats = seats;
    this.activeSeat = seats[0][0];
  }

  private _find(row: number, col: number) {
    return this.seats[row][col];
  }

  private _findSeatRows(seat: Seat) {
    return this.seats[seat.row];
  }

  /**
   * 根据购票数匹配最佳空位
   *
   * @param {TTicketNum} n
   * @returns
   * @memberof Section
   */
  private _selectEmptySeatByN(n: TTicketNum) {
    // 找到第一个比 n 大的key
    let key = n;
    for (const _key of this.emptySeatMap.keys()) {
      const emptySeatList = this.emptySeatMap.get(_key) as Seat[];
      if (emptySeatList.length !== 0 && _key >= n) {
        key = _key;
        break;
      }
    }
    const emptySeatList = this.emptySeatMap.get(key);
    if (!emptySeatList) {
      return null;
    }
    if (emptySeatList[0]) {
      console.log("已选中座位", { ...emptySeatList[0] });
      assert(emptySeatList[0].status !== 1, "改座位已经被选");
      this._clearEmptySeatFromMap(key, n, emptySeatList[0]);
    }
    return emptySeatList[0];
  }

  /**
   * 按顺序从空座表中选择座位
   *
   * @returns
   * @memberof Section
   */
  private _selectEmptySeatByOrder() {
    for (const key of this.emptySeatMap.keys()) {
      const emptySeatList = this.emptySeatMap.get(key) as Seat[];
      const emptySeat = emptySeatList[0];
      if (emptySeat) {
        this._clearEmptySeatFromMap(key, key, emptySeat);
        return emptySeat;
      }
    }
    return null;
  }

  private _next() {
    if (this.full) {
      return this.activeSeat;
    }
    let nextColNum = this.activeColNum + 1;
    // 换行，从第一个位置开始。
    if (nextColNum > this.activeRow.length - 1) {
      return this._findNextSeatByNextRow();
    }
    return this._find(this.activeRowNum, nextColNum);
  }

  private _findNextSeatByNextRow() {
    const nextRowNum = this.activeRowNum + 1;
    const nextColNum = 0;
    if (!(nextRowNum <= this.rows - 1)) {
      debugger;
    }
    assert(
      nextRowNum <= this.rows - 1,
      `已经没座位了，row必须在0-${this.rows - 1}`
    );
    return this._find(nextRowNum, nextColNum);
  }

  /**
   * 从map中清除已使用的空位
   *
   * @param {TTicketNum} key
   * @param {TTicketNum} n n <= key
   * @param {Seat} seat
   * @memberof Section
   */
  private _clearEmptySeatFromMap(key: TTicketNum, n: TTicketNum, seat: Seat) {
    assert(n <= key, "n 必须 <= key");
    const emptySeatList = (this.emptySeatMap.get(key) || []).slice();
    const index = emptySeatList.indexOf(seat);
    assert(index !== -1, `座位:${seat.no}不存在`);
    // 在原map中移除结点
    emptySeatList.splice(index, 1);
    this.emptySeatMap.set(key, emptySeatList);
    // 此时将新的空位设入map中
    if (n < key) {
      this._setEmptySeat(
        (key - n) as TTicketNum,
        this._find(seat.row, seat.col + n)
      );
    }
  }

  /**
   * 设置空位
   *
   * @param {TTicketNum} key
   * @param {Seat} seat
   * @memberof Section
   */
  private _setEmptySeat(key: TTicketNum, seat: Seat) {
    assert(seat.status === 0, `该座位${seat.no}已被购买`);
    const emptySeat = this.emptySeatMap.get(key) || [];
    this.emptySeatMap.set(key, emptySeat.concat(seat));
  }

  private _trySell(n: TTicketNum) {
    const color = Colors[n - 1];
    assert(!this.full, "购票失败，票已售完");
    this.activeSeat.sell(color);
  }

  private _sellBatchNormal(n: TTicketNum) {
    for (let index = 0; index < n; index++) {
      this._trySell(n);
      this.activeSeat = this._next();
    }
  }

  preCheck(n: TTicketNum, maxRowNum: TRow = this.rows - 1) {
    maxRowNum = Math.min(maxRowNum, this.rows - 1);
    const restSeatNumByActiveRow = this.restSeatNumByActiveRow;
    console.log(
      "区域%s,当前行剩余:%s,需要购买:%s",
      this.id,
      restSeatNumByActiveRow,
      n
    );

    if (this.activeRowNum > maxRowNum) {
      return false;
    } else if (this.activeRowNum === maxRowNum) {
      return !(restSeatNumByActiveRow + this.emptySeatNum <= n);
    }
    return true;
  }

  select(n: TTicketNum) {
    console.log("区域%s开始购票，当前需购%s", this.id, n);
    // 为了让大家都能选到连坐
    const restSeatNumByActiveRow = this.restSeatNumByActiveRow;

    // 先从空座表中查询前排是否有满足要求的座位
    const emptySeat = this._selectEmptySeatByN(n);
    if (emptySeat) {
      const activeSeatSave = this.activeSeat;
      this.activeSeat = emptySeat;

      this._sellBatchNormal(n);
      // 还原当前座位结点
      this.activeSeat = activeSeatSave;
      return;
    }
    // check当前行剩余座位是否足够
    // 不够，找到下一行的第一个位置，进行选座
    if (restSeatNumByActiveRow !== 0 && restSeatNumByActiveRow < n) {
      console.log("当前行不满足购票需求，从下一行开始购买");
      // 先对当前行的空座进行存档
      this._setEmptySeat(
        restSeatNumByActiveRow as TTicketNum,
        this._find(this.activeRowNum, this.activeColNum)
      );
      console.log(
        "记录空座，行:%s,列:%s",
        this.activeRowNum,
        this.activeColNum
      );
      // 如果行不够了，执行终极方案
      // TODO: 终极方案
      // if (this.activeRowNum + 1 > this.rows - 1) {
      //   for (let index = 0; index < n; index++) {
      //     this.activeSeat = this.selectEmptySeatByOrder() as Seat;
      //     this.trySell(n);
      //   }
      //   return;
      // }
      this.activeSeat = this._findNextSeatByNextRow();
    }

    this._sellBatchNormal(n);
  }
}
