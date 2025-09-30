/**
 * @fileoverview Shared types for ContactNote module
 * 
 * This module contains common type definitions used across the ContactNote module
 * to avoid circular dependencies and provide a centralized location for type definitions.
 * All types are designed to work with Obsidian's TFile system and support various
 * contact management operations.
 * 
 * @module ContactNoteTypes
 */

import { TFile } from 'obsidian';

/**
 * Gender type for contact classification.
 * 
 * Supports both modern enum values and legacy string representations
 * for backward compatibility with existing data.
 * 
 * @typedef {string | null} Gender
 * 
 * Modern values:
 * - 'unknown' - Gender not specified or unknown
 * - 'male' - Male gender identity
 * - 'female' - Female gender identity  
 * - 'other' - Non-binary or other gender identity
 * 
 * Legacy values (for backward compatibility):
 * - 'M' - Male (legacy format)
 * - 'F' - Female (legacy format)
 * - 'NB' - Non-binary (legacy format)
 * - 'U' - Unknown (legacy format)
 * - null - Unspecified
 */
export type Gender = 'unknown' | 'male' | 'female' | 'other' | 'M' | 'F' | 'NB' | 'U' | null;

/**
 * Contact data structure containing file and data properties.
 * 
 * This is the primary data structure for representing a contact in the system.
 * It combines the Obsidian file reference with the parsed frontmatter data.
 * 
 * @interface Contact
 * 
 * @example
 * ```typescript
 * const contact: Contact = {
 *   data: {
 *     FN: "John Doe",
 *     EMAIL: "john@example.com",
 *     UID: "john-doe-123"
 *   },
 *   file: obsidianFile
 * };
 * ```
 */
export type Contact = {
  /** Parsed frontmatter data from the contact file */
  data: Record<string, any>;
  /** Obsidian TFile reference to the contact file */
  file: TFile;
}

/**
 * Parsed key structure for frontmatter field parsing.
 * 
 * Represents the components of a parsed frontmatter key, supporting
 * complex field structures with types, indices, and sub-keys.
 * 
 * @interface ParsedKey
 * 
 * @example
 * ```typescript
 * // For a key like "TEL[WORK]" 
 * const parsedKey: ParsedKey = {
 *   key: "TEL",
 *   type: "WORK",
 *   index: undefined,
 *   subkey: undefined
 * };
 * 
 * // For a key like "ADR[HOME].STREET"
 * const parsedKey: ParsedKey = {
 *   key: "ADR",
 *   type: "HOME", 
 *   index: undefined,
 *   subkey: "STREET"
 * };
 * ```
 */
export interface ParsedKey {
  /** Base field name (e.g., "TEL", "EMAIL", "ADR") */
  key: string;
  /** Optional index for multiple values of same type */
  index?: string;
  /** Optional type specifier (e.g., "HOME", "WORK", "CELL") */
  type?: string;
  /** Optional sub-field name for structured fields */
  subkey?: string;
}

/**
 * Parsed relationship data structure.
 * 
 * Represents a relationship between contacts, including metadata
 * about the relationship type and the related contact information.
 * 
 * @interface ParsedRelationship
 * 
 * @example
 * ```typescript
 * const relationship: ParsedRelationship = {
 *   parsedValue: {
 *     type: "name",
 *     value: "Jane Doe"
 *   },
 *   contactName: "Jane Doe",
 *   type: "spouse",
 *   contactFile: janeFile,
 *   gender: "female"
 * };
 * ```
 */
export interface ParsedRelationship {
  /** Parsed value information */
  parsedValue?: {
    /** Type of reference (name, uid, etc.) */
    type: string;
    /** Actual reference value */
    value: string;
  };
  /** Display name of the related contact */
  contactName: string;
  /** Type of relationship (spouse, parent, child, etc.) */
  type: string;
  /** Link type (uid or name) */
  linkType?: 'uid' | 'name';
  /** Optional file reference to the related contact */
  contactFile?: TFile;
  /** Optional gender of the related contact */
  gender?: Gender;
}

/**
 * Frontmatter relationship structure.
 * 
 * Represents relationship data as stored in frontmatter,
 * before full parsing and resolution.
 * 
 * @interface FrontmatterRelationship
 * 
 * @example
 * ```typescript
 * const fmRelationship: FrontmatterRelationship = {
 *   key: "spouse",
 *   type: "name", 
 *   value: "Jane Doe",
 *   parsedValue: {
 *     type: "name",
 *     value: "Jane Doe"
 *   }
 * };
 * ```
 */
export interface FrontmatterRelationship {
  /** Frontmatter key name */
  key: string;
  /** Relationship type */
  type: string;
  /** Raw value from frontmatter */
  value: string;
  /** Optional parsed value information */
  parsedValue?: { 
    /** Type of reference (uuid, uid, name) */
    type: 'uuid' | 'uid' | 'name'; 
    /** Parsed reference value */
    value: string;
  };
}

/**
 * Resolved contact information.
 * 
 * Contains complete information about a contact after resolution
 * from various reference types (UID, name, etc.).
 * 
 * @interface ResolvedContact
 * 
 * @example
 * ```typescript
 * const resolved: ResolvedContact = {
 *   name: "Jane Doe",
 *   uid: "jane-doe-456", 
 *   file: janeFile,
 *   gender: "female"
 * };
 * ```
 */
export interface ResolvedContact {
  /** Full name of the contact */
  name: string;
  /** Unique identifier */
  uid: string;
  /** Obsidian file reference */
  file: TFile;
  /** Gender classification */
  gender: Gender;
}