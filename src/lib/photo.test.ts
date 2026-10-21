import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, PHOTO_SIZE_ERROR, PHOTO_TYPE_ERROR, parsePhotoDataUrl, uploadedPhotoUrl } from "./photo";

const dataUrl = (type: string, bytes: number[]) => `data:${type};base64,${Buffer.from(bytes).toString("base64")}`;
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0x10];
const WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];

describe("parsePhotoDataUrl", () => {
  it.each([
    ["image/png", PNG],
    ["image/jpeg", JPEG],
    ["image/webp", WEBP],
  ])("accepts a real %s", (type, bytes) => {
    const result = parsePhotoDataUrl(dataUrl(type, bytes));
    expect(result).toMatchObject({ ok: true, contentType: type });
  });

  it("rejects other types and malformed input", () => {
    expect(parsePhotoDataUrl(dataUrl("image/gif", [0x47, 0x49, 0x46]))).toEqual({ ok: false, error: PHOTO_TYPE_ERROR });
    expect(parsePhotoDataUrl("not a data url")).toEqual({ ok: false, error: PHOTO_TYPE_ERROR });
  });

  it("rejects a file whose bytes don't match its declared type", () => {
    expect(parsePhotoDataUrl(dataUrl("image/png", JPEG))).toEqual({ ok: false, error: PHOTO_TYPE_ERROR });
    expect(parsePhotoDataUrl(dataUrl("image/jpeg", [0x3c, 0x73, 0x76, 0x67]))).toEqual({ ok: false, error: PHOTO_TYPE_ERROR });
  });

  it("rejects photos over the size limit", () => {
    const big = [...JPEG, ...new Array(MAX_PHOTO_BYTES).fill(0)];
    expect(parsePhotoDataUrl(dataUrl("image/jpeg", big))).toEqual({ ok: false, error: PHOTO_SIZE_ERROR });
  });
});

describe("uploadedPhotoUrl", () => {
  it("versions the address by update time", () => {
    expect(uploadedPhotoUrl("abc", new Date(1700000000000))).toBe("/api/dishes/abc/photo/1700000000000");
  });
});
