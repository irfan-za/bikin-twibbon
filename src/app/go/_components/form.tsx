"use client";
import { useTwibbonCanvas } from "@/hooks/useTwibbonCanvas";
import cn from "@/lib/clsx";
import { useEffect, useState } from "react";
import { FaFileImage } from "react-icons/fa";
import { FaDownload } from "react-icons/fa6";
import Canvas from "./canvas";
import { Button } from "@/app/_components/global/button";

interface Props {
  searchParams: {
    title?: string;
    frameUrl?: string;
    caption?: string;
    slug?: string;
  };
}

function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Form({ searchParams }: Readonly<Props>) {
  const { frameUrl } = searchParams;
  const canvasHook = useTwibbonCanvas();

  const [fileName, setFileName] = useState<string>();
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    if (searchParams?.slug) {
      window.history.pushState({}, "", `/${searchParams?.slug}`);
      localStorage.setItem(searchParams.slug, JSON.stringify(searchParams));
    }

    canvasHook.addBackground(frameUrl!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasHook]);

  useEffect(() => {
    canvasHook.setScaled(scale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale]);

  return (
    <div className="flex flex-col gap-4 bg-white p-4 rounded-md">
      <div className="flex justify-center items-center space-y-4 flex-col">
        <Canvas
          width={canvasHook.recommendedSize.width}
          height={canvasHook.recommendedSize.height}
          canvasid="twibbon"
          ref={canvasHook.canvasRef}
        />
        <div
          className={cn(
            "w-full flex flex-col items-center gap-4 mt-10 justify-center",
            !fileName ? "hidden" : null
          )}
        >
          <label
            htmlFor="zoom"
            className="text-lg font-semibold text-slate-600"
          >
            Zoom {(Math.round((scale + Number.EPSILON) * 100) / 100).toString()}
            x
          </label>
          <div className="flex items-center gap-3">
            <Button
              variant={"primary"}
              onClick={() => setScale((prev) => prev - 0.01)}
            >
              -
            </Button>
            <input
              id="zoom"
              type="range"
              min="0.2"
              max="3"
              step="0.01"
              value={scale}
              onChange={(e) => {
                setScale(parseFloat(e.currentTarget.value));
              }}
              className="bg-red-500 !w-[10rem] md:!w-[15rem]"
            />
            <Button
              variant={"primary"}
              onClick={() => setScale((prev) => prev + 0.01)}
            >
              +
            </Button>
          </div>
        </div>
      </div>
      <div className="flex space-x-4 items-center mx-auto">
        <div>
          <input
            type="file"
            id="foto"
            accept="image/png, image/jpeg, image/jpg"
            onChange={async (ev) => {
              setFileName(ev.currentTarget.files?.[0]?.name);

              if (ev.currentTarget.files?.length) {
                canvasHook.addFrame(
                  URL.createObjectURL(ev.currentTarget.files[0])
                );
              }
            }}
            hidden
          />
          <label
            htmlFor="foto"
            className="flex items-center gap-2 truncate max-w-[18rem] md:max-w-sm py-1 px-4 lg:py-2 rounded-full border-0 lg:text-lg text-md font-semibold bg-red-100 text-red-700 h-10 hover:bg-red-300 cursor-pointer duration-100"
          >
            <FaFileImage /> {fileName ?? "Pilih Foto"}
          </label>
        </div>
        <Button
          onClick={() => {
            if (!fileName) return alert("Silahkan pilih foto terlebih dahulu!");
            const data = canvasHook.toDataUrl();

            if (data) {
              downloadURI(
                data,
                `Twibbon ${searchParams?.title ?? "Hut RI-79"}.jpg`
              );
            }
          }}
          variant={"primary"}
          className="flex items-center gap-2 h-10 w-fit"
        >
          <FaDownload /> Download
        </Button>
      </div>
    </div>
  );
}
