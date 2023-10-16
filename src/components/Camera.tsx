import { useEffect, useRef, useState } from "react";
import * as wasm from "../../solar_tools/pkg";

export default function Camera() {
  const width = 512;
  const height = 512;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [media, setMedia] = useState<MediaStream | null>(null);

  async function getMediaStream() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: width,
        height: height,
      },
    });

    setMedia(stream);
  }

  // If stream is ready, get it processed, then start draw loop
  useEffect(() => {
    let myReq: number;

    async function draw(
      bufferVideo: HTMLVideoElement,
      bufferCanvas: HTMLCanvasElement
    ) {
      const bufferCtx = bufferCanvas.getContext("2d");
      if (bufferCtx === null) {
        cancelAnimationFrame(myReq);
        return;
      }
      bufferCtx.drawImage(bufferVideo, 0, 0, width, height);

      const data = bufferCtx.getImageData(0, 0, width, height);
      const processedData = wasm.process_img(data);

      const ctx = canvasRef.current?.getContext("2d");
      ctx?.drawImage(
        await createImageBitmap(processedData),
        0,
        0,
        width,
        height
      );

      myReq = requestAnimationFrame(
        async () => await draw(bufferVideo, bufferCanvas)
      );
    }

    if (media) {
      // Create dummy video element to send stream to
      const bufferVideo = document.createElement("video");
      bufferVideo.srcObject = media;
      bufferVideo.play();

      // Create dummy canvas element to draw stream to
      const bufferCanvas = document.createElement("canvas");
      bufferCanvas.height = height;
      bufferCanvas.width = width;

      myReq = requestAnimationFrame(
        async () => await draw(bufferVideo, bufferCanvas)
      );
    }
  }, [media]);

  return (
    <>
      {media ? (
        <canvas height={height} width={width} ref={canvasRef}></canvas>
      ) : (
        <button onClick={async () => await getMediaStream()}>get video</button>
      )}
    </>
  );
}
