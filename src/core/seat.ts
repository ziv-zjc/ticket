// 0 0 0 0 0 0
// 0 0 0 0 n + 2
// 0 0  n
import assert from "power-assert";
import { TSectionId, TRow } from "./type";

/**
 * 座位
 */
export class Seat {
  sid: TSectionId;
  row: TRow;
  col: number;
  no: string; // {sid}{row}{col}
  color: string;
  status: 0 | 1 = 0; // 0 - 空, 1 - 占
  constructor(
    sid: TSectionId,
    row: number,
    col: number,
    color: string = "white"
  ) {
    this.sid = sid;
    this.row = row;
    this.col = col;
    this.color = color;
    this.no = sid + pad0(row) + pad0(col);
  }

  sell(color: string = "white") {
    if (this.status === 1) {
      throw new Error("这个座位已经被出售了！！！");
    }
    this.color = color;
    this.status = 1;
    console.log("%s购票成功", this.no);
  }
}

function pad0(number: number) {
  assert(number <= 99, "数字必须为0-99之间");
  const numberStr = "" + number;
  if (numberStr.length === 1) {
    return "0" + numberStr;
  }
  return numberStr;
}
