export const photoLineToV4 = (line:string) => {
  const params = parsePhotoParams(line);
  if (!params) {
    return
  }

  return `data:image/${params.mimeType};base64,${params.base64Data}`;
}

export const photoLineToV3 = (line: string) => {
  const params = parsePhotoParams(line);
  if (!params) {
    return;
  }

  return `ENCODING=b;TYPE=${params.mimeType.toUpperCase()}:${params.base64Data}`;
};

export const parsePhotoParams = (line: string) => {
  if (!/^PHOTO/i.test(line)) return null;

  // Split into param section and value section
  const [header, ...rest] = line.split(':');
  let base64Data = rest.join(':');
  const paramParts = header.replace(/^PHOTO;?/i, '').split(';').filter(Boolean);

  const params = paramParts.reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (value) {
      acc[key.toLowerCase()] = value;
    } else if (/^[A-Z0-9+.-]+$/i.test(key)) {
      // handle naked type, e.g. ";JPEG"
      acc['type'] = key.toLowerCase();
    }
    return acc;
  }, {} as Record<string, string>);

  let mimeType = '';
  if (params.type && params.type !== 'data') {
    mimeType = params.type.toLowerCase();
  } else if (/^PHOTO[:;]data:image\//i.test(line)) {
    const m = line.match(/^PHOTO[:;]data:image\/([a-zA-Z0-9+.-]+);/i);
    mimeType = m ? m[1].toLowerCase() : '';
    const commaIndex = line.indexOf(',');
    base64Data = commaIndex !== -1 ? line.slice(commaIndex + 1) : '';
  }

  return { mimeType, base64Data };
};
