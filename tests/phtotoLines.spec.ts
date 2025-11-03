import { parsePhotoParams } from "src/util/photoLine";
import { describe, expect, it } from 'vitest';

const fixtures = [
  {
    name: "v3 base64 JPEG (no TYPE key)",
    input: "PHOTO;ENCODING=BASE64;JPEG:randomvalue",
    expected: { mimeType: "jpeg", base64Data: "randomvalue" },
  },
  {
    name: "v3 TYPE=JPEG ENCODING=b",
    input: "PHOTO;TYPE=JPEG;ENCODING=b:randomvalue",
    expected: { mimeType: "jpeg", base64Data: "randomvalue" },
  },
  {
    name: "v3 ENCODING=b TYPE=PNG",
    input: "PHOTO;ENCODING=b;TYPE=PNG:randomvalue",
    expected: { mimeType: "png", base64Data: "randomvalue" },
  },
  {
    name: "v4 data:image/jpeg;base64",
    input: "PHOTO:data:image/jpeg;base64,randomvalue",
    expected: { mimeType: "jpeg", base64Data: "randomvalue" },
  },
  {
    name: "v4 data:image/png;base64",
    input: "PHOTO:data:image/png;base64,randomvalue",
    expected: { mimeType: "png", base64Data: "randomvalue" },
  },
  {
    name: "v4 data:image/png;base64 with a malformed start",
    input: "PHOTO;data:image/png;base64,randomvalue",
    expected: { mimeType: "png", base64Data: "randomvalue" },
  },
];



describe('photoLines', () => {
  describe("Should be able to parse photo vCard params in v3 and v4 format", () => {
    fixtures.forEach(({ name, input, expected }) => {
      it(`should parse ${name}`, () => {
        const result = parsePhotoParams(input);
        expect(result).toMatchObject(expected);
      });
    });
  });
});
