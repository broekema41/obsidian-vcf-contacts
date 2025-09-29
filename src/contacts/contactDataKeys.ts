/**
 * @fileoverview This module provides utilities to parse custom key strings following a specific pattern.
 *
 * The supported format is:
 *    key[index:type].subkey
 *
 * Where:
 *  - "key" is a required identifier.
 *  - The bracketed portion is optional and can be either:
 *      - A single value (interpreted as "type"), e.g., key[type]
 *      - A pair of values separated by a colon, e.g., key[index:type] or key[index:]
 *  - The subkey (after a dot) is also optional.
 *
 * This module splits the parsing process into smaller helper functions for improved readability and maintainability:
 *  - `extractSubkey`: Separates the main part from the optional subkey.
 *  - `parseBracketContent`: Parses the content inside brackets to extract "index" and/or "type".
 *  - `parseKeyPart`: Extracts the key and bracketed values from the main part.
 *  - `parseKeyString`: Combines the above functions to return a complete ParsedKey object.
 *
 * Example usage:
 *    const result = parseKeyString('key[index:type].subkey');
 *    console.log(result);
 *
 * The parsing functions assume that the input string is well-formed; an error is thrown if a closing bracket is missing.
 */
import {Notice} from "obsidian";

export interface ParsedKey {
	key: string;
	index?: string;
	type?: string;
	subkey?: string;
}
/**
 * Extracts the main part of the string and an optional subkey.
 * The subkey is defined as the portion after the first dot.
 */
function extractSubkey(input: string): { main: string; subkey?: string } {
	const dotIndex = input.indexOf('.');
	if (dotIndex === -1) {
		return { main: input, subkey: ''};
	}
	return {
		main: input.substring(0, dotIndex),
		subkey: input.substring(dotIndex + 1)
	};
}

/**
 * Parses the content inside the brackets.
 * If a colon is present, it splits into index and type.
 * Otherwise, it assumes the content is a type.
 */
function parseBracketContent(content: string): { index?: string; type?: string } {
	if (content.includes(':')) {
		const [index, type] = content.split(':');
		return { index, type };
	}
	return { type: content };
}

/**
 * Extracts the key and optional bracketed values (index and type) from the main part.
 */
function parseKeyPart(main: string): { key: string; index?: string; type?: string } {
	const openBracketIndex = main.indexOf('[');
	if (openBracketIndex === -1) {
		// No bracketed part, the entire string is the key.
		return { key: main };
	}

	// Extract key portion before the '['
	const key = main.substring(0, openBracketIndex);

	// Find the closing bracket and validate it.
	const closeBracketIndex = main.indexOf(']', openBracketIndex);
	if (closeBracketIndex === -1) {
		throw new Error('Invalid vcard property key encountered please correct.');
	}

	// Extract and parse the content within the brackets.
	const bracketContent = main.substring(openBracketIndex + 1, closeBracketIndex);
	const { index, type } = parseBracketContent(bracketContent);

	return { key, index, type };
}

/**
 * Parses a string in the format:
 * key[index:type].subkey
 * Where the bracketed part and subkey are optional.
 */
export function parseKey(input: string): ParsedKey {
	// First separate subkey if it exists.
	const { main, subkey } = extractSubkey(input);
	// Parse the main part to get the key, index, and type.
	const { key, index, type } = parseKeyPart(main);
	return { key, index, type, subkey };
}

export function getSubkeyNameFallback(key: ParsedKey): String {
	if (key.subkey != null && key.subkey.length > 0) {
		return key.subkey;
	} else if (key.type != null && key.type.length > 0){
		return key.type;
	} else {
		return key.key;
	}
}