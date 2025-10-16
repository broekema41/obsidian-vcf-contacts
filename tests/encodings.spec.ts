import {beforeAll, describe, expect, it} from 'vitest';

import {parseTextFile} from "../src/file/file";
import {readVcfFixture, readVcfFixtureAsBlob} from "./fixtures/fixtures";


describe('parseDifferentEncodings', () => {

  let expectedData: string;
  beforeAll(() => {
    expectedData = readVcfFixture('encoding-utf8.vcf');
  })


  it('should parse utf-8 vCards as it used to', async () => {
    const data = await readVcfFixtureAsBlob('encoding-utf8.vcf');
    const result = await parseTextFile(data)

    expect(result).toBe(expectedData);

  })

  it('should parse windows-1251 vCards correctly', async () => {
    const data = await readVcfFixtureAsBlob('encoding-win1251.vcf');
    const result = await parseTextFile(data)

    expect(result).toBe(expectedData);
  })


})
