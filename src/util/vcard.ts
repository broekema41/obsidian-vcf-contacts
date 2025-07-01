export function uidOutOfString(messyString: string):string|undefined {
  const unfolded = messyString.replace(/\r\n[ \t]/g, '');
  const match = unfolded.match(/^uid:.*$/gim);
  let uid;
  if(match) {
    const uidLine = match[0]
    const parts = uidLine.split(':');
    uid = parts.length > 1 ? parts.at(-1)!.trim() : '';
  }
  return uid
}

export function fnOutOfString(messyString: string):string|undefined {
  const unfolded = messyString.replace(/\r\n[ \t]/g, '');
  const match = unfolded.match(/^fn:.*$/gim);
  let fn;
  if(match) {
    const uidLine = match[0]
    const parts = uidLine.split(':');
    fn = parts.length > 1 ? parts.at(-1)!.trim() : '';
  }
  return fn
}


// Zero dependency uuid generator as its not used for millions of records
export function generateUUID(): string {
  const timestamp = Date.now().toString(16).padStart(12, '0');
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }).replace(/^(.{24})/, (_, p1) => {
    return timestamp + p1.slice(timestamp.length);
  });
}
