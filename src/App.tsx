import React, { Component, useEffect } from "react";
import { random } from "lodash";
import "./core";
import Painter from "./core";
import "./App.css";
import Scene from "./core/scene";
import { TTicketNum } from "./core/type";

function App() {
  useEffect(() => {
    const scene = new Scene();
    const painter = new Painter("stage", scene);
    let n = 0;
    const timer = setInterval(() => {
      let success = false;
      try {
        const _n = random(1, 5) as TTicketNum;
        success = scene.sell(_n);
        if (success) {
          n += _n;
        }
      } catch (ex) {
        console.error(ex);
      }
      if (!success) {
        setTimeout(() => {
          alert(`售票结束,共售出${n}张票`);
        }, 0);
        clearInterval(timer);
        return;
      }
      painter.paint();
    }, 0);
  });
  return <div id="stage" />;
}
export default App;
