/**
 * Support for vCard property groups (RFC 6350 section 3.3):
 *    [group "."] name *(";" param) ":" value
 *
 * Google, Apple and Proton use groups to attach a custom label to a property:
 *    item1.EMAIL;TYPE=INTERNET:contact@example.com
 *    item1.X-ABLabel:School
 *
 * In frontmatter such a label is stored in the bracket notation, `EMAIL[School]`.
 */

/** Properties whose custom labels are written back out as a group with an X-ABLabel. */
export const LABELED_PROPERTIES = ['EMAIL', 'TEL', 'ADR', 'URL'];

/** TYPE values from RFC 6350, RFC 2426 and common client extensions. */
const STANDARD_TYPES = [
  'HOME', 'WORK', 'PREF', 'OTHER', 'MAIN', 'INTERNET', 'X400',
  'CELL', 'MOBILE', 'IPHONE', 'VOICE', 'FAX', 'PAGER', 'TEXT', 'VIDEO', 'TEXTPHONE',
  'MSG', 'BBS', 'MODEM', 'CAR', 'ISDN', 'PCS',
  'DOM', 'INTL', 'POSTAL', 'PARCEL'
];

const GROUP_REGEX = /^([A-Za-z0-9-]+)\.(.+)$/;

/**
 * Splits `item1.EMAIL` into its group and property name.
 * Ungrouped properties are returned unchanged with no group.
 */
export function splitGroup(property: string): { group?: string; name: string } {
  const match = property.match(GROUP_REGEX);
  if (!match) {
    return { name: property };
  }
  return { group: match[1].toUpperCase(), name: match[2] };
}

/**
 * Makes a label safe to use inside a frontmatter key.
 * - Unwraps Apple's built-in labels: `_$!<HomePage>!$_` becomes `HomePage`.
 * - Replaces characters that have meaning in the `key[index:type].subkey` notation.
 */
export function normalizeLabel(raw: string): string {
  const apple = raw.match(/^_\$!<(.*)>!\$_$/);
  const label = apple ? apple[1] : raw;
  return label
    .replace(/[[\]:.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Collects the X-ABLabel of each group in a single (unfolded) vCard, keyed by group name.
 */
export function collectGroupLabels(lines: string[]): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const [property] = line.substring(0, colon).split(';');
    const { group, name } = splitGroup(property);
    if (group && name.toUpperCase() === 'X-ABLABEL') {
      const label = normalizeLabel(line.substring(colon + 1));
      if (label) labels[group] = label;
    }
  }
  return labels;
}

/**
 * True when every comma separated part of a bracket value is a standard TYPE,
 * meaning it should be exported as `;TYPE=` and not as a custom label.
 */
export function isStandardType(type: string): boolean {
  return type
    .split(',')
    .every((part) => STANDARD_TYPES.includes(part.trim().toUpperCase()));
}

/**
 * Whether a frontmatter key's bracket value is a custom label that should be exported
 * as a property group with an X-ABLabel.
 */
export function isCustomLabel(key: string, type?: string): boolean {
  return !!type && LABELED_PROPERTIES.includes(key) && !isStandardType(type);
}

/**
 * Hands out group names (`item1`, `item2`, ...) for one exported vCard.
 */
export function createGroupNamer(): () => string {
  let count = 0;
  return () => `item${++count}`;
}
