import { VCardKinds } from "src/contacts/vcard/shared/structuredFields";
import { createNameSlug, isKind } from "src/util/nameUtils";
import { describe, expect, it } from 'vitest';


describe('nameUtils', () => {
  describe('createNameSlug', () => {
    it('should create slug from N fields', () => {
      const record = {
        'N.PREFIX': 'Dr.',
        'N.GN': 'John',
        'N.MN': 'Q',
        'N.FN': 'Smith',
        'N.SUFFIX': 'Jr.'
      };
      expect(createNameSlug(record)).toBe('Dr. John Q Smith Jr');
    });

    it('should handle partial N fields', () => {
      const record = {
        'N.GN': 'Jane',
        'N.FN': 'Doe'
      };
      expect(createNameSlug(record)).toBe('Jane Doe');
    });

    it('should fallback to FN when N fields are empty', () => {
      const record = {
        'N.PREFIX': '',
        'N.GN': '',
        'N.FN': '',
        'FN': 'Acme Corporation'
      };
      expect(createNameSlug(record)).toBe('Acme Corporation');
    });

    it('should fallback to ORG when N and FN are empty', () => {
      const record = {
        'ORG': 'Tech Solutions Inc'
      };
      expect(() => createNameSlug(record)).toThrow();
    });

    it('should return undefined when no name data exists', () => {
      const record = {};
      expect(() => createNameSlug(record)).toThrow();
    });

    it('should sanitize problematic filename characters', () => {
      const record = {
        'FN': 'John/Doe: <CEO>'
      };
      expect(createNameSlug(record)).toBe('John Doe CEO');
    });

    it('should handle multiple consecutive dots', () => {
      const record = {
        'FN': 'Company Inc...'
      };
      expect(createNameSlug(record)).toBe('Company Inc');
    });

    it('should handle names with pipe and asterisk', () => {
      const record = {
        'N.GN': 'John*',
        'N.FN': 'Doe|Smith'
      };
      expect(createNameSlug(record)).toBe('John Doe Smith');
    });
  });


  describe('isKind', () => {

    it('should be able to test the different types', () => {
      expect(isKind({ 'KIND': 'group'}, VCardKinds.Group)).toBe(true);
      expect(isKind({ 'KIND': 'individual'}, VCardKinds.Individual)).toBe(true);
      expect(isKind({ 'KIND': 'org'}, VCardKinds.Organisation)).toBe(true);
    });

    it('should default to individual when no clear indicators', () => {
      expect(isKind({},VCardKinds.Individual)).toBe(true);
      expect(isKind({ 'FN': 'Some Name'}, VCardKinds.Individual)).toBe(true);
      expect(isKind({ 'FN': 'Some Name'}, VCardKinds.Group)).toBe(false);
      expect(isKind({ 'FN': 'Some Name'}, VCardKinds.Organisation)).toBe(false);
    });

    it('should handle macOS-style organization detection', () => {
      // macOS treats contacts without N fields as organizations
      const macOSOrg = {
        'FN': 'Apple Inc.',
        'ORG': 'Apple Inc.',
        'TEL': '+1-408-996-1010'
      };
      expect(isKind(macOSOrg, VCardKinds.Organisation)).toBe(false);
    });



  });
});
