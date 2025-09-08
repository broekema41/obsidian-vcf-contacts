import { createFileName } from 'src/file/file';
import { createNameSlug } from "src/util/nameUtils";
import { describe, expect, it } from 'vitest';


describe('createFileName', () => {
  it('should add .md extension to name slug', () => {
    const records = {
      'N.GN': 'Jane',
      'N.FN': 'Doe'
    };
    const slug = createNameSlug(records);
    expect(createFileName(records)).toBe(slug + '.md');
  });

  it('should throw error when no name data is available', () => {
    const records = {};
    expect(() => createFileName(records)).toThrow('Failed to update, create file name due to missing FN property');
  });
});
