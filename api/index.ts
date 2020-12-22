import { NowRequest, NowResponse } from "@vercel/node";
import { join } from "path";
import { readFileSync } from "fs";
import { decompressFromEncodedURIComponent } from "lz-string";
import { parse } from "querystring";

const base = join(__dirname, "..", "_files");
const template = readFileSync(join(base, "template.html"), "utf-8");

export default async (req: NowRequest, res: NowResponse) => {
  const key = Object.keys(req.query)[0];
  const keyDec = parse(decompressFromEncodedURIComponent(key));
  const input = keyDec["input-til"];

  const proto = req.headers["x-forwarded-proto"] == "http" ? "http" : "https";
  const ogUrl = `${proto}://${req.headers.host}${req.url}`;
  const leadImageUrl = `${proto}://${req.headers.host}/api/preview${req.url}`;

  const obj = {
    ogTitle: "Julehilsen fra Variant",
    ogDescription: input ? input : "Lag din egen julehilsen fra Variant!",
    leadImageUrl,
    ogUrl,
  };
  const data = template.replace(/\{\{(\w+)\}\}/gi, function (_, name) {
    return obj[name];
  });

  res.setHeader("Content-type", "text/html");
  res.status(200).send(data);
};
