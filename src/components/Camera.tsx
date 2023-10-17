import { useEffect, useRef, useState } from "react";
import * as wasm from "../../solar_tools/pkg";

export default function Camera() {
  const width = 512;
  const height = 512;

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

    async function draw(
      bufferVideo: HTMLVideoElement,
      bufferCanvas: HTMLCanvasElement
    ) {
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

    if (media && canvasRef) {
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
          <canvas height={height} width={width} ref={canvasRef}></canvas>
        </>
      ) : (
        <button onClick={async () => await getMediaStream()}>get video</button>
      )}
    </>
  );
}
