/**
 * @fileoverview Core VCard file class for individual VCard operations
 * 
 * This module provides the main VcardFile class for handling individual VCard
 * instances. It focuses on operations that act upon a single vCard file,
 * such as parsing, string conversion, and file I/O operations.
 * 
 * The class follows data locality principles by keeping single-vCard operations
 * separate from collection-level operations (which are handled by VcardManager).
 * 
 * @module VcardFile
 */

import { TFile, App } from "obsidian";
import * as fs from 'fs/promises';
import * as path from 'path';
import { VCardForObsidianRecord, VCardToStringReply } from './types';
import { VCardParser } from './parsing';
import { VCardGenerator } from './generation';
import { VCardFileOperations } from './fileOperations';

/**
 * Main class for interacting with individual vCard files (VCF).
 * 
 * This class provides a unified interface for working with single vCard instances,
 * including parsing VCard data, generating VCard content, and performing file
 * operations. It delegates complex operations to specialized classes while
 * maintaining a simple, consistent API.
 * 
 * @class VcardFile
 * @example
 * ```typescript
 * // Create from file
 * const vcard = await VcardFile.fromFile('/path/to/contact.vcf');
 * 
 * // Parse contents
 * for await (const [slug, contact] of vcard.parse()) {
 *   console.log(`Contact: ${slug}`, contact);
 * }
 * 
 * // Create empty vCard
 * const empty = await VcardFile.createEmpty();
 * console.log(empty.toString());
 * ```
 */
export class VcardFile {
  /** Raw VCard data as string */
  private data: string;
  
  /**
   * Creates a new VcardFile instance.
   * 
   * @param {string} vcardData - Raw VCard data in VCF format
   */
  constructor(vcardData: string = '') {
    this.data = vcardData;
  }

  /**
   * Creates a VcardFile instance from a file path.
   * 
   * Reads the specified file and creates a VcardFile instance with its contents.
   * Returns null if the file cannot be read or is empty.
   * 
   * @param {string} filePath - Absolute path to the VCF file
   * @returns {Promise<VcardFile | null>} VcardFile instance or null if error
   * 
   * @example
   * ```typescript
   * const vcard = await VcardFile.fromFile('/contacts/john-doe.vcf');
   * if (vcard) {
   *   console.log('Loaded VCard:', vcard.toString());
   * }
   * ```
   */
  static async fromFile(filePath: string): Promise<VcardFile | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (!content) {
        console.log(`[VcardFile] Empty or unreadable VCF file: ${path.basename(filePath)}`);
        return null;
      }
      return new VcardFile(content);
    } catch (error: any) {
      console.log(`[VcardFile] Error reading VCF file ${filePath}: ${error.message}`);
      return null;
    }
  }

  /**
   * Creates VCard content from Obsidian contact files.
   * 
   * Processes multiple Obsidian files and generates VCard data from their
   * frontmatter. Returns both successful conversions and any errors encountered.
   * 
   * @param {TFile[]} contactFiles - Array of Obsidian TFile objects
   * @param {App} [app] - Obsidian App instance (optional)
   * @returns {Promise<VCardToStringReply>} Generation results with errors
   * 
   * @example
   * ```typescript
   * const files = app.vault.getMarkdownFiles().filter(isContactFile);
   * const result = await VcardFile.fromObsidianFiles(files, app);
   * console.log('Generated VCards:', result.vcards);
   * console.log('Errors:', result.errors);
   * ```
   */
  static async fromObsidianFiles(contactFiles: TFile[], app?: App): Promise<VCardToStringReply> {
    return VCardGenerator.fromObsidianFiles(contactFiles, app);
  }

  /**
   * Creates an empty VcardFile with default field structure.
   * 
   * Generates a new VCard with standard fields pre-populated with empty values.
   * Useful as a template for creating new contacts.
   * 
   * @returns {Promise<VcardFile>} VcardFile instance with empty template
   * 
   * @example
   * ```typescript
   * const template = await VcardFile.createEmpty();
   * console.log('Empty VCard template:');
   * console.log(template.toString());
   * ```
   */
  static async createEmpty(): Promise<VcardFile> {
    const vcfContent = await VCardGenerator.createEmpty();
    return new VcardFile(vcfContent);
  }

  /**
   * Parses the VCard data and yields contact information.
   * 
   * Processes the VCard content and returns an async generator that yields
   * tuples of [slug, contactData] for each contact found. The slug is a
   * URL-friendly identifier, and contactData contains the parsed properties.
   * 
   * @returns Async generator yielding [slug, contactData] tuples
   * 
   * @example
   * ```typescript
   * const vcard = new VcardFile(vcfContent);
   * for await (const [slug, contact] of vcard.parse()) {
   *   if (slug) {
   *     console.log(`Contact ${slug}:`, contact.FN);
   *   }
   * }
   * ```
   */
  async* parse(): AsyncGenerator<[string | undefined, VCardForObsidianRecord], void, unknown> {
    yield* VCardParser.parse(this.data);
  }

  /**
   * Converts the VCard data to string format.
   * 
   * @returns {string} Raw VCard data in VCF format
   * 
   * @example
   * ```typescript
   * const vcard = new VcardFile(vcfData);
   * const vcfString = vcard.toString();
   * console.log(vcfString);
   * ```
   */
  toString(): string {
    return this.data;
  }

  /**
   * Saves the VCard data to a file.
   * 
   * Writes the current VCard data to the specified file path.
   * Creates parent directories if they don't exist.
   * 
   * @param {string} filePath - Absolute path where to save the VCF file
   * @returns {Promise<boolean>} True if saved successfully, false otherwise
   * 
   * @example
   * ```typescript
   * const vcard = new VcardFile(vcfData);
   * const success = await vcard.saveToFile('/contacts/new-contact.vcf');
   * if (success) {
   *   console.log('VCard saved successfully');
   * }
   * ```
   */
  async saveToFile(filePath: string): Promise<boolean> {
    try {
      await fs.writeFile(filePath, this.data, 'utf-8');
      return true;
    } catch (error: any) {
      console.log(`[VcardFile] Error writing VCF file ${filePath}: ${error.message}`);
      return false;
    }
  }

  // ============================================================================
  // Static Constants and Configuration
  // ============================================================================

  /**
   * Sort field constants for contact list ordering.
   * Used by UI components to determine sort order.
   * 
   * @static
   * @readonly
   */
  static readonly Sort = {
    /** Sort by contact name */
    NAME: 0,
    /** Sort by birthday date */
    BIRTHDAY: 1,
    /** Sort by organization */
    ORG: 2
  } as const;

  // ============================================================================
  // Backward Compatibility Methods
  // 
  // These static methods delegate to specialized classes for backward 
  // compatibility with existing code that expects these methods on VcardFile.
  // New code should use the specialized classes directly.
  // ============================================================================

  /**
   * Lists all VCF files in the specified folder.
   * 
   * @deprecated Use VCardFileOperations.listVCFFiles() directly
   * @param {string} folderPath - Path to search for VCF files
   * @returns {Promise<string[]>} Array of full file paths to VCF files
   */
  static async listVCFFiles(folderPath: string): Promise<string[]> {
    return VCardFileOperations.listVCFFiles(folderPath);
  }

  /**
   * Gets file statistics for a VCF file.
   * 
   * @deprecated Use VCardFileOperations.getFileStats() directly
   * @param {string} filePath - Path to the VCF file
   * @returns {Promise<{ mtimeMs: number } | null>} File stats or null if error
   */
  static async getFileStats(filePath: string): Promise<{ mtimeMs: number } | null> {
    return VCardFileOperations.getFileStats(filePath);
  }

  /**
   * Checks if a folder exists.
   * 
   * @deprecated Use VCardFileOperations.folderExists() directly
   * @param {string} folderPath - Path to check
   * @returns {Promise<boolean>} True if folder exists
   */
  static async folderExists(folderPath: string): Promise<boolean> {
    return VCardFileOperations.folderExists(folderPath);
  }

  /**
   * Searches for a UID within VCF file content.
   * 
   * @deprecated Use VCardFileOperations.containsUID() directly
   * @param {string} content - VCF file content to search
   * @param {string} uid - UID to search for
   * @returns {boolean} True if UID is found in content
   */
  static containsUID(content: string, uid: string): boolean {
    return VCardFileOperations.containsUID(content, uid);
  }

  /**
   * Generates a sanitized filename for a VCF file.
   * 
   * @deprecated Use VCardFileOperations.generateVCFFilename() directly
   * @param {string} contactName - Contact name to base filename on
   * @returns {string} Sanitized filename with .vcf extension
   */
  static generateVCFFilename(contactName: string): string {
    return VCardFileOperations.generateVCFFilename(contactName);
  }

  /**
   * Reads VCF file content from disk.
   * 
   * @deprecated Use VCardFileOperations.readVCFFile() directly
   * @param {string} filePath - Path to VCF file
   * @returns {Promise<string | null>} File content or null if error
   */
  static async readVCFFile(filePath: string): Promise<string | null> {
    return VCardFileOperations.readVCFFile(filePath);
  }

  /**
   * Writes content to a VCF file.
   * 
   * @deprecated Use VCardFileOperations.writeVCFFile() directly
   * @param {string} filePath - Path where to write the file
   * @param {string} content - VCF content to write
   * @returns {Promise<boolean>} True if write was successful
   */
  static async writeVCFFile(filePath: string, content: string): Promise<boolean> {
    return VCardFileOperations.writeVCFFile(filePath, content);
  }

  /**
   * Converts vCard v3 photo format to v4 format.
   * 
   * @deprecated Use VCardParser.photoLineFromV3toV4() directly
   * @param {string} line - VCard photo line in v3 format
   * @returns {string} Photo line converted to v4 format
   */
  static photoLineFromV3toV4(line: string): string {
    return VCardParser.photoLineFromV3toV4(line);
  }

  /**
   * Converts a VCard object to VCF format string.
   * 
   * @deprecated Use VCardGenerator.objectToVcf() directly
   * @param {Record<string, any>} vCardObject - VCard data object
   * @returns {string} VCF format string
   */
  static objectToVcf(vCardObject: Record<string, any>): string {
    return VCardGenerator.objectToVcf(vCardObject);
  }
}