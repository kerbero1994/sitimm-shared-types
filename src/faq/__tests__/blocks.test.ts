import { describe, expect, it } from "vitest";
import {
  isFAQBlockType,
  type FAQBlock,
  type ParagraphBlock,
  type VideoBlock,
} from "../blocks";

describe("FAQBlock type guards", () => {
  it("narrows to ParagraphBlock when type matches", () => {
    const b: FAQBlock = { type: "paragraph", text_md: "hi" };
    if (isFAQBlockType(b, "paragraph")) {
      const p: ParagraphBlock = b;
      expect(p.text_md).toBe("hi");
    }
  });

  it("returns false for non-matching type", () => {
    const b: FAQBlock = { type: "divider" };
    expect(isFAQBlockType(b, "paragraph")).toBe(false);
  });

  it("narrows to VideoBlock when type matches", () => {
    const b: FAQBlock = {
      type: "video",
      resource_uuid: "00000000-0000-0000-0000-000000000000",
      autoplay: false,
    };
    if (isFAQBlockType(b, "video")) {
      const v: VideoBlock = b;
      expect(v.resource_uuid).toBe("00000000-0000-0000-0000-000000000000");
    }
  });
});
