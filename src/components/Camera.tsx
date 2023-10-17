import { useEffect, useRef, useState } from "react";
import * as wasm from "../../solar_tools/pkg";

export default function Camera() {
  let myReq: number = 0;

  // On hot module update, stop existing animations.
  // Without this, animations stack.
  if (import.meta.hot) {
    import.meta.hot.on("vite:beforeUpdate", () => {
      cancelAnimationFrame(myReq);
    });
  }

  const outSize = 128;
  const pxSize = 4;
  const gap = 0;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [media, setMedia] = useState<MediaStream | null>(null);

  async function getMediaStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
      },
    });

    setMedia(stream);
  }

  function draw(
    bufferVideo: HTMLVideoElement,
    bufferCanvas: HTMLCanvasElement
  ) {
    const bufferCtx = bufferCanvas.getContext("2d");
    bufferCtx?.drawImage(bufferVideo, 0, 0);

    const size = Math.min(bufferVideo.videoHeight, bufferVideo.videoWidth);
    const data = bufferCtx?.getImageData(
      (bufferCanvas.width - size) / 2,
      (bufferCanvas.height - size) / 2,
      size,
      size
    );

    if (data) {
      const processedData = wasm.process_img(data, outSize);
      const saturations = processedData.map((val) =>
        Math.floor((val / 0xff) * 100)
      );

      const ctx = canvasRef.current?.getContext("2d");
      for (let row = 0; row < outSize; row++) {
        for (let col = 0; col < outSize; col++) {
          if (ctx) {
            ctx.fillStyle = `hsl(70, 100%, ${
              saturations[row * outSize + col]
            }%)`;
          }
          ctx?.fillRect(
            col * (pxSize + gap),
            row * (pxSize + gap),
            pxSize,
            pxSize
          );
        }
      }
    }

    myReq = requestAnimationFrame(() => draw(bufferVideo, bufferCanvas));

    return () => {
      cancelAnimationFrame(myReq);
    };
  }

  // If stream is ready, get it processed, then start draw loop
  useEffect(() => {
    if (media && canvasRef.current) {
      // Set canvas dimensions
      canvasRef.current.height = outSize * (pxSize + gap) - gap;
      canvasRef.current.width = outSize * (pxSize + gap) - gap;

      // Create dummy video element to send stream to
      const bufferVideo = document.createElement("video");
      bufferVideo.srcObject = media;
      bufferVideo.play();

      // Create dummy canvas element to draw stream to
      const bufferCanvas = document.createElement("canvas");

      bufferVideo.addEventListener(
        "loadedmetadata",
        () => {
          bufferCanvas.height = bufferVideo.videoHeight;
          bufferCanvas.width = bufferVideo.videoWidth;
          myReq = requestAnimationFrame(async () =>
            draw(bufferVideo, bufferCanvas)
          );
        },
        { once: true }
      );
    }
  }, [media, canvasRef]);

  return (
    <>
      {media ? (
        <>
          <canvas style={{ backgroundColor: "grey" }} ref={canvasRef}></canvas>
        </>
      ) : (
        <button onClick={async () => await getMediaStream()}>get video</button>
      )}
    </>
  );
}
