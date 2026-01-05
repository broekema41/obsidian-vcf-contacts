import { readVcfFixture } from "tests/fixtures/fixtures";
import type { Mock } from "vitest";
import { describe, expect, it, vi, beforeEach } from "vitest";


const mockGetMetaByUID = vi.fn().mockResolvedValue({
  href: "https://example.com/fake.vcf",
});

const mockPullVcardFromRemote = vi.fn().mockResolvedValue({
    raw: readVcfFixture('sync-fake.vcf')
});

vi.mock("src/contacts", () => {
  const updateFrontMatterValue = vi.fn(async () => null);

  return {
    updateFrontMatterValue,
  };
});

vi.mock("src/sync/adapters", () => {
  return {
    getCurrentAdapter: vi.fn(() => {
      return {
        getMetaByUid: mockGetMetaByUID,
        pull: mockPullVcardFromRemote
      }
    }),
  }
});

import { updateFrontMatterValue } from "src/contacts";
import { updateFromRemote } from "src/sync/sync";


describe('Sync updateFromRemote', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fills empty local values from remote", async () => {
    const contact: any = {
      file: {},
      data: {
        UID: "abc-123",
        FN: "",                // empty → should update
        EMAIL: "",             // empty → should update
      },
    };

    await updateFromRemote(contact);

    const calls = (updateFrontMatterValue as Mock).mock.calls
      .map(([_, key, value]) => ({ key, value }));

    expect(calls).toEqual(
      expect.arrayContaining([
        { key: "FN", value: "Zhihao Tang" },
        { key: "EMAIL[HOME]", value: "zhihao.panda@bamboomail.cn" },
      ])
    );
    expect(calls.length).toBe(19);
  });

  it("updates fields when values differ", async () => {
    const contact: any = {
      file: {},
      data: {
        UID: "abc-123",
        FN: "Wrong Name",      // different → should be updated
      },
    };

    await updateFromRemote(contact);

    const calls = (updateFrontMatterValue as Mock).mock.calls
      .map(([_, key, value]) => ({ key, value }));

    expect(calls).toEqual(
      expect.arrayContaining([
        { key: "FN", value: "Zhihao Tang" },
      ])
    );
  });

  it("does not update fields when values are identical", async () => {
    const contact: any = {
      file: {},
      data: {
        UID: "abc-123",
        FN: "Zhihao Tang",     // already correct
      },
    };

    await updateFromRemote(contact);

    const calls = (updateFrontMatterValue as Mock).mock.calls
      .map(([_, key, value]) => ({ key, value }));

    expect(calls).not.toContainEqual({
      key: "FN",
      value: "Zhihao Tang",
    });
  });

  it("updates PHOTO only when local value is empty", async () => {
    const contact: any = {
      file: {},
      data: {
        UID: "abc-123",
        PHOTO: "",             // empty → update
      },
    };

    await updateFromRemote(contact);

    const calls = (updateFrontMatterValue as Mock).mock.calls
      .map(([_, key]) => key);

    expect(calls).toContain("PHOTO");
    expect(calls.length).toBe(19);
  });

  it("does not overwrite PHOTO when already present", async () => {
    const contact: any = {
      file: {},
      data: {
        UID: "abc-123",
        PHOTO: "local-photo.jpg",   // should NOT overwrite
      },
    };

    await updateFromRemote(contact);

    const calls = (updateFrontMatterValue as Mock).mock.calls
      .map(([_, key]) => key);

    expect(calls).not.toContain("PHOTO");
    expect(calls).not.toContain("UID");
    expect(calls.length).toBe(18);
  });
});
