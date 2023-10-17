import { useEffect, useRef, useState } from "react";
import * as wasm from "../../solar_tools/pkg";

export default function Camera() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [media, setMedia] = useState<MediaStream | null>(null);

  async function getMediaStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    setMedia(stream);
  }

  // If stream is ready, get it processed, then start draw loop
  useEffect(() => {
    let myReq: number = 0;
    const outSize = 128;
    const pxSize = 4;
    const gap = 1;

    async function draw(
      bufferVideo: HTMLVideoElement,
      bufferCanvas: HTMLCanvasElement
    ) {
      // Wait for data to show up on video element
      if (bufferVideo.videoHeight === 0 || bufferVideo.videoWidth === 0) {
        myReq = requestAnimationFrame(
          async () => await draw(bufferVideo, bufferCanvas)
        );
        return;
      }
      bufferCanvas.height = bufferVideo.videoHeight;
      bufferCanvas.width = bufferVideo.videoWidth;

      const bufferCtx = bufferCanvas.getContext("2d");
      if (bufferCtx === null) {
        cancelAnimationFrame(myReq);
        return;
      }
      bufferCtx.drawImage(bufferVideo, 0, 0);

      const size = Math.min(bufferVideo.videoHeight, bufferVideo.videoWidth);
      const data = bufferCtx.getImageData(
        (bufferCanvas.width - size) / 2,
        (bufferCanvas.height - size) / 2,
        size,
        size
      );

      const processedData = wasm.process_img(data, outSize);

      const saturations = processedData.map((val) =>
        Math.floor((val / 0xff) * 50)
      );

      const ctx = canvasRef.current?.getContext("2d");

      for (let row = 0; row < outSize; row++) {
        for (let col = 0; col < outSize; col++) {
          if (ctx) {
            ctx.fillStyle = `hsl(50, 100%, ${
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

      myReq = requestAnimationFrame(
        async () => await draw(bufferVideo, bufferCanvas)
      );
    }

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
      if (myReq === 0) {
        myReq = requestAnimationFrame(
          async () => await draw(bufferVideo, bufferCanvas)
        );
      }
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
