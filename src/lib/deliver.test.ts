import assert from "node:assert/strict";
import { test } from "node:test";
import { asShareFile, canUseSavePicker, facebookIntent, shareAttempts, shareSheetOk, threadsIntent, tweetIntent } from "./deliver.ts";

test("share attempts send the file, never files plus url, never text as the card", () => {
  const file = new File(["png"], "first-bucket-thunder-58.png", { type: "image/png" });
  const text = "Walked a 58–24 Positionless Thunder at First Bucket Studio: Shai Gilgeous-Alexander, Jalen Williams.";
  const attempts = shareAttempts(file, text);
  assert.equal(attempts.length, 2);
  assert.equal(attempts[0]?.files?.length, 1);
  assert.equal(attempts[0]?.url, undefined);
  assert.match(attempts[0]?.title ?? "", /Thunder/);
  assert.match(attempts[0]?.text ?? "", /Shai/);
  assert.equal(attempts[1]?.files?.length, 1);
  assert.equal(attempts[1]?.url, undefined);
  assert.equal(attempts[1]?.text, undefined);
  assert.ok(attempts.every((row) => !("url" in row && row.url)));
});

test("share title stays short enough for the sheet", () => {
  const file = new File(["png"], "first-bucket-thunder-51.png", { type: "image/png" });
  const text =
    "Walked a 51–31 Positionless Thunder at First Bucket Studio: Shai Gilgeous-Alexander, Jalen Williams, Chet Holmgren, Luguentz Dort, Isaiah Hartenstein. /walk/v1.OKC.positionless.even.51.chet~dort~hartenstein~jalenw~sga";
  const attempts = shareAttempts(file, text);
  assert.ok((attempts[0]?.title?.length ?? 0) <= 80);
  assert.equal(attempts[0]?.url, undefined);
  assert.equal(attempts[1]?.url, undefined);
});

test("asShareFile stamps a PNG type so canShare files can succeed", () => {
  const blob = new Blob(["png"], { type: "" });
  const file = asShareFile(blob, "first-bucket-thunder-58.png");
  assert.equal(file.type, "image/png");
  assert.equal(file.name, "first-bucket-thunder-58.png");
});

test("share sheet stays off without a top-level navigator.share", () => {
  assert.equal(shareSheetOk(), false);
});

test("save picker stays off in node and framed contexts", () => {
  assert.equal(canUseSavePicker(), false);
});

test("tweet intent carries text and an https walk, never a relative path", () => {
  const href = tweetIntent("51–31 Thunder · First Bucket Studio", "https://first-bucket-studios.vercel.app/walk/v1.OKC");
  assert.match(href, /https:\/\/x\.com\/intent\/tweet/);
  assert.match(href, /url=/);
  assert.match(href, /first-bucket-studios/);
  const relative = tweetIntent("51–31 Thunder · First Bucket Studio", "/walk/v1.OKC");
  assert.equal(relative.includes("url="), false);
});

test("threads and facebook intents need a public walk", () => {
  const walk = "https://first-bucket-studios.vercel.app/walk/v1.OKC";
  assert.match(threadsIntent("51–31 Thunder · First Bucket Studio", walk), /threads\.net\/intent\/post/);
  assert.match(facebookIntent(walk), /facebook\.com\/sharer/);
  assert.equal(facebookIntent("/walk/v1.OKC").includes("u="), false);
});
