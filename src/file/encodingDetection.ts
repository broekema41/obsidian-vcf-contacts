/**
 * Best-effort encoding detection for vCard files.
 * Strategy:
 * 1) BOM
 * 2) Valid UTF-8 heuristic
 * 3) CHARSET=... token in vCard (v2.1/3.0)
 * 4) Fallback to utf-8 for backward compatibility
 */
export function detectVCardEncoding(bytes: Uint8Array): string {
  const bomEncoding = detectBom(bytes);
  if (bomEncoding) {
    return bomEncoding;
  }

  if (isLikelyUtf8(bytes)) {
    return "utf-8";
  }
  // For old vCard 2.1/3.0, whiche allowed encodings other than utf-8.
  // It's per-field, but we assume it to be the same for all the fields and match the file encoding; otherwise it's a broken vCard anyway.
  const charset = detectVCardCharsetToken(bytes);
  if (charset) {
    return normalizeEncodingLabel(charset);
  }

  return "utf-8";
}

function detectBom(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return "utf-8";
  }
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    // Could be UTF-16LE or UTF-32LE if next two are 0x00 0x00
    if (bytes.length >= 4 && bytes[2] === 0x00 && bytes[3] === 0x00) return "utf-32le";
    return "utf-16le";
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return "utf-16be";
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x00 &&
    bytes[1] === 0x00 &&
    bytes[2] === 0xfe &&
    bytes[3] === 0xff
  ) {
    return "utf-32be";
  }
  return null;
}

// Simple UTF-8 validator (not perfect, but good heuristic)
/*
  What this does:
  - Scans the byte array left-to-right and checks if it could be valid UTF‑8.

  How it decides:
  1) ASCII fast-path:
     - Bytes 0x00–0x7F are plain ASCII and always valid in UTF‑8, so they pass.

  2) Lead byte classification:
     - If a byte is not ASCII, it must be the lead byte of a multi-byte UTF‑8 sequence.
     - The code uses the lead-byte ranges to decide how many continuation bytes to expect:
         0xC2–0xDF → expect 1 continuation byte (2-byte sequence)
         0xE0–0xEF → expect 2 continuation bytes (3-byte sequence)
         0xF0–0xF4 → expect 3 continuation bytes (4-byte sequence)
       Any other non-ASCII lead value is rejected immediately.

     Why start at 0xC2 (and not 0xC0)?
     - 0xC0 and 0xC1 would allow overlong encodings of ASCII, which UTF‑8 forbids. Excluding them filters those out.

  3) Continuation bytes check:
     - For the expected number of continuation bytes, each must exist and match the bit pattern 10xxxxxx (i.e., 0x80–0xBF).
     - If a required continuation is missing or malformed, the function returns false.

  4) Success condition:
     - If the entire array is consumed following the above rules, it returns true.

  Limitations (why it's a heuristic, not a full validator):
  - It doesn't check all UTF‑8 edge constraints (e.g., the tighter rules for E0, ED, F0, F4 sequences,
    surrogate ranges, or every possible overlong form beyond excluding 0xC0–0xC1).
  - It’s designed to quickly distinguish “likely UTF‑8” from legacy single-byte encodings; rare false positives are possible,
    but it works well for practical pre-detection before choosing a decoder.
*/
function isLikelyUtf8(bytes: Uint8Array): boolean {
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    if (b <= 0x7f) continue; // ASCII

    let n = 0;
    if (b >= 0xc2 && b <= 0xdf) n = 1; // 2-byte
    else if (b >= 0xe0 && b <= 0xef) n = 2; // 3-byte
    else if (b >= 0xf0 && b <= 0xf4) n = 3; // 4-byte
    else return false;

    for (let j = 0; j < n; j++) {
      if (i >= bytes.length) return false;
      const c = bytes[i++];
      if ((c & 0xc0) !== 0x80) return false;
    }
  }
  return true;
}

/**
 * Try to locate a vCard CHARSET=... token using only ASCII matching.
 * Example: N;CHARSET=ISO-8859-1:...
 */
function detectVCardCharsetToken(bytes: Uint8Array): string | null {
  // Build ASCII-only string to safely search tokens without decoding
  let ascii = "";
  const limit = Math.min(bytes.length, 64 * 1024); // scan up to 64KB
  for (let i = 0; i < limit; i++) {
    const b = bytes[i];
    ascii += b < 0x80 ? String.fromCharCode(b) : ".";
  }

  const idx = ascii.toUpperCase().indexOf("CHARSET=");
  if (idx === -1) return null;

  // Extract token until a separator (; , : \n \r)
  const start = idx + "CHARSET=".length;
  let end = start;
  while (
    end < ascii.length &&
    ![";", ",", ":", "\n", "\r"].includes(ascii[end])
    ) {
    end++;
  }

  const raw = ascii.slice(start, end).trim();
  if (!raw) return null;
  return raw;
}

/**
 * Map common charset tokens to WHATWG/TextDecoder labels.
 */
function normalizeEncodingLabel(label: string): string {
  const lower = label.toLowerCase();

  // Common synonyms
  if (lower === "utf8" || lower === "utf-8") return "utf-8";
  if (lower === "utf-16" || lower === "utf16") return "utf-16le"; // ambiguous; most files are LE on Windows
  if (lower === "utf-16le" || lower === "utf16le") return "utf-16le";
  if (lower === "utf-16be" || lower === "utf16be") return "utf-16be";

  if (lower === "latin1" || lower === "iso8859-1" || lower === "iso_8859-1" || lower === "iso-8859-1")
    return "iso-8859-1";

  if (lower === "cp1252" || lower === "windows-1252" || lower === "windows1252")
    return "windows-1252";

  if (lower === "shift-jis" || lower === "shift_jis" || lower === "sjis")
    return "shift_jis";

  if (lower === "gbk") return "gbk";
  if (lower === "gb2312") return "gb2312";
  if (lower === "big5") return "big5";
  if (lower === "euc-kr" || lower === "euc_kr") return "euc-kr";
  if (lower === "windows-1251" || lower === "cp1251") return "windows-1251";

  // Let TextDecoder try the provided label if it's valid
  return lower;
}
