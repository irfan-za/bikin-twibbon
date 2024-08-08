import { forwardRef } from "react";

export type TwibbonCanvasProps = {
  canvasid: string;
  width: number;
  height: number;
  hidden?: boolean;
};

const TwibbonCanvas = forwardRef<HTMLCanvasElement, TwibbonCanvasProps>(
  (props, ref) => {
    return <canvas id={props.canvasid} {...props} ref={ref} />;
  }
);

TwibbonCanvas.displayName = "TwibbonCanvas";

export default TwibbonCanvas;
