import { NowRequest, NowResponse } from "@vercel/node";
import {
  createCanvas,
  loadImage,
  registerFont,
  CanvasRenderingContext2D,
} from "canvas";
import { join } from "path";
import { decompressFromEncodedURIComponent } from "lz-string";
import { parse } from "querystring";

const base = join(__dirname, "..", "_files");
registerFont(join(base, "recoleta.otf"), {
  family: "Recoleta",
  weight: "500",
  style: "normal",
});

export default async (req: NowRequest, res: NowResponse) => {
  const bg = await loadImage(join(base, "background.jpg"));
  const key = Object.keys(req.query)[0];

  const canvas = createCanvas(bg.width, bg.height);
  const ctx = canvas.getContext("2d");

  ctx.quality = "best";
  ctx.imageSmoothingQuality = "high";
  ctx.patternQuality = "best";

  ctx.drawImage(bg, 0, 0);

  const render = () => {
    res.setHeader("Content-type", "image/jpeg");
    res.status(200);
    canvas
      .createJPEGStream({
        quality: 100,
        chromaSubsampling: false,
        progressive: true,
      })
      .pipe(res);
  };

  const keyDec = parse(decompressFromEncodedURIComponent(undefined));
  const to = keyDec?.["input-til"];
  if (!key || !keyDec || !to) {
    return render();
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#FBFAF7";
  ctx.font = "70px 'Recoleta'";

  const x = bg.width / 3 + 60;
  const maxWidth = bg.width - x - 60;

  const { emHeightAscent: fontHeight } = ctx.measureText(String(to));

  const lines = getLines(ctx, String(to), maxWidth);

  const textBlockHeight = (lines.length - 1) * fontHeight;

  const y = bg.height / 2 - textBlockHeight / 2 + 20;

  let yOffset = 0;
  for (let line of lines) {
    ctx.fillText(line, x, y + yOffset);
    yOffset += fontHeight;
  }

  return render();
};

function getLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const words = text.split(" ");
  const lines = [];

  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
