import * as fabric from "fabric";
import {
  Dispatch,
  Ref,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMediaQuery } from "react-responsive";

export type UseTwibbonHookRes = {
  fabricCanvas?: fabric.Canvas;
  canvasRef: Ref<HTMLCanvasElement>;

  addFrame: (frameUrl: string) => void;
  addBackground: (twibbonUrl: string) => void;
  recommendedSize: {
    height: number;
    width: number;
  };
  toDataUrl: () => string | undefined;
  setScaled: Dispatch<SetStateAction<number>>;
  scaled: number;
};

export const useTwibbonCanvas = (): UseTwibbonHookRes => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frameUrl, setFrameUrl] = useState<string>();
  const [lastTwb, setLastTwb] = useState<string>();
  const [scaled, setScaled] = useState<number>(0.5);

  const [recommendedSize, setRecommendedSize] = useState<{
    height: number;
    width: number;
  }>({
    height: 500,
    width: 500,
  });

  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas>();
  const isMd = useMediaQuery({
    query: "(min-width: 768px)",
  });

  const oldFabricObject = fabric.FabricObject.prototype.toObject;
  fabric.FabricObject.prototype.toObject = function (additionalProps) {
    return oldFabricObject.call(this, ["name"].concat(additionalProps!));
  };

  const addBackgroundTwibbon = async (twibbonUrl: string, isBlur = false) => {
    const prevId = "twibbon_background";

    try {
      const twibbonImage = await fabric.FabricImage.fromURL(
        twibbonUrl,
        { crossOrigin: "anonymous" },
        {
          crossOrigin: "anonymous",
          hasControls: false,
          hasBorders: false,
          objectCaching: false,
          selectable: false,
          evented: false,
          lockMovementX: false,
          lockMovementY: false,
        }
      );

      const canvasHeight = fabricCanvas?.getHeight() ?? 0;
      const canvasWidth = fabricCanvas?.getWidth() ?? 0;

      twibbonImage.scaleToHeight(canvasHeight);
      twibbonImage.scaleToWidth(canvasWidth);

      (twibbonImage as any).name = prevId;
      setFrameUrl(twibbonUrl);

      twibbonImage.centeredScaling = true;
      twibbonImage.centeredRotation = true;
      twibbonImage.setControlsVisibility({
        tr: false,
        tl: false,
        br: false,
        bl: false,
        mtr: false,
        mr: false,
        mt: false,
        mb: false,
        ml: false,
        deleteControl: false,
      });

      if (isBlur) {
        twibbonImage.filters = [
          ...(twibbonImage.filters || []),
          new fabric.filters.Blur({ blur: 0.5 }),
        ];
        twibbonImage.applyFilters();
      }

      fabricCanvas?.insertAt(0, twibbonImage);
    } catch (error) {
      console.error("Failed to load twibbon image:", error);
    }
  };

  const removeFabricObject = (objectName: string): void => {
    const objects = fabricCanvas?.getObjects() ?? [];

    objects.forEach((obj: any) => {
      if (obj.name === objectName) {
        console.log(`${objectName} removed`);
        fabricCanvas?.remove(obj);
      }
    });
  };

  const addFrameTwibbon = async (frameUrl: string) => {
    const prevId = "twibbon_frame";

    try {
      const frameImage = await fabric.FabricImage.fromURL(
        frameUrl,
        { crossOrigin: "anonymous" },
        {
          hasControls: true,
          hasBorders: false,
          centeredRotation: true,
          centeredScaling: true,
          objectCaching: false,
          originX: "center",
          originY: "center",
          absolutePositioned: true,
        }
      );

      const canvasHeight = fabricCanvas?.getHeight() ?? 0;
      const canvasWidth = fabricCanvas?.getWidth() ?? 0;

      frameImage.scaleToHeight(canvasHeight);
      frameImage.scaleToWidth(canvasWidth);

      (frameImage as any).name = prevId;
      setLastTwb(frameUrl);

      frameImage.setControlsVisibility({
        tr: true,
        tl: true,
        br: true,
        bl: true,
        mtr: false,
        mr: false,
        mt: false,
        mb: false,
        ml: false,
        deleteControl: false,
      });

      frameImage.filters = [
        ...(frameImage.filters || []),
        new fabric.filters.Brightness(),
        new fabric.filters.Contrast(),
      ];

      frameImage.applyFilters();

      removeFabricObject(prevId);
      fabricCanvas?.centerObject(frameImage);
      fabricCanvas?.insertAt(1, frameImage);
    } catch (error) {
      console.error("Failed to load frame image:", error);
    }
  };

  const setupFabric = (): fabric.Canvas => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current!, {
      enablePointerEvents: false,
      allowTouchScrolling: true,
      backgroundColor: "#EEEEF3",
      selection: false,
      preserveObjectStacking: true,
      hoverCursor: "pointer",
    });

    const dimensions = isMd
      ? { width: 500, height: 500 }
      : { width: 300, height: 300 };
    fabricCanvas.setDimensions(dimensions);

    return fabricCanvas;
  };

  useEffect(() => {
    const fabricCanvas = setupFabric();
    setFabricCanvas((prev) => fabricCanvas);

    if (frameUrl) {
      addBackgroundTwibbon(frameUrl);
    }

    return () => {
      fabricCanvas.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fabricCanvas?.clear();

    const size = isMd
      ? { height: 500, width: 500 }
      : { height: 300, width: 300 };
    setRecommendedSize(size);
    fabricCanvas?.setDimensions(size);

    if (frameUrl) {
      addBackgroundTwibbon(frameUrl);
      if (lastTwb) {
        addFrameTwibbon(lastTwb);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMd]);

  useEffect(() => {
    for (const obj of fabricCanvas?.getObjects() ?? []) {
      if ((obj as any).name === "twibbon_frame") {
        const canvasHeight = fabricCanvas?.getHeight() ?? 0;
        const canvasWidth = fabricCanvas?.getWidth() ?? 0;

        obj.scaleToHeight(canvasHeight * scaled);
        obj.scaleToWidth(canvasWidth * scaled);
        obj.setCoords();

        fabricCanvas?.renderAll();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scaled]);

  return {
    canvasRef,
    fabricCanvas,
    addFrame: addFrameTwibbon,
    addBackground: addBackgroundTwibbon,
    recommendedSize,
    toDataUrl() {
      return fabricCanvas?.toDataURL({
        quality: 2,
        format: "jpeg",
        top: 0,
        left: 0,
        multiplier: 4,
        height: recommendedSize.height,
        width: recommendedSize.width,
      });
    },
    setScaled,
    scaled,
  };
};
