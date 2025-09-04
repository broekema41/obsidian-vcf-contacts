import { describe, expect, it } from 'vitest';
import { createNameSlug, hasValidNFields, isOrganization } from 'src/contacts/vcard/shared/nameUtils';

describe('nameUtils', () => {
  describe('createNameSlug', () => {
    it('should create slug from N components', () => {
      const records = {
        'N.PREFIX': 'Dr.',
        'N.GN': 'John',
        'N.MN': 'Q',
        'N.FN': 'Smith',
        'N.SUFFIX': 'Jr.'
      };
      expect(createNameSlug(records)).toBe('Dr. John Q Smith Jr.');
    });

    it('should handle partial N components', () => {
      const records = {
        'N.GN': 'Jane',
        'N.FN': 'Doe'
      };
      expect(createNameSlug(records)).toBe('Jane Doe');
    });

    it('should fallback to FN when N components are empty', () => {
      const records = {
        'N.PREFIX': '',
        'N.GN': '',
        'N.FN': '',
        'FN': 'Acme Corporation'
      };
      expect(createNameSlug(records)).toBe('Acme Corporation');
    });

    it('should fallback to ORG when N and FN are empty', () => {
      const records = {
        'ORG': 'Tech Solutions Inc'
      };
      expect(createNameSlug(records)).toBe('Tech Solutions Inc');
    });

    it('should return undefined when no name data exists', () => {
      const records = {};
      expect(createNameSlug(records)).toBeUndefined();
    });

    it('should sanitize problematic filename characters', () => {
      const records = {
        'FN': 'John/Doe: <CEO>'
      };
      expect(createNameSlug(records)).toBe('John Doe CEO');
    });

    it('should handle multiple consecutive dots', () => {
      const records = {
        'FN': 'Company Inc...'
      };
      expect(createNameSlug(records)).toBe('Company Inc.');
    });

    it('should handle names with pipe and asterisk', () => {
      const records = {
        'N.GN': 'John*',
        'N.FN': 'Doe|Smith'
      };
      expect(createNameSlug(records)).toBe('John DoeSmith');
    });
  });

  describe('hasValidNFields', () => {
    it('should return true when both GN and FN exist', () => {
      expect(hasValidNFields({ 'N.GN': 'John', 'N.FN': 'Doe' })).toBe(true);
    });

    it('should return true when only GN exists', () => {
      expect(hasValidNFields({ 'N.GN': 'John' })).toBe(true);
    });

    it('should return true when only FN exists', () => {
      expect(hasValidNFields({ 'N.FN': 'Doe' })).toBe(true);
    });

    it('should return false when N fields are empty', () => {
      expect(hasValidNFields({ 'N.GN': '', 'N.FN': '' })).toBe(false);
    });

    it('should return false when N fields are missing', () => {
      expect(hasValidNFields({})).toBe(false);
    });
  });

  describe('isOrganization', () => {
    it('should detect explicit KIND:org', () => {
      expect(isOrganization({ 'KIND': 'org' })).toBe(true);
      expect(isOrganization({ 'KIND': 'ORG' })).toBe(true);
      expect(isOrganization({ 'KIND': 'organization' })).toBe(true);
    });

    it('should respect explicit KIND:individual', () => {
      expect(isOrganization({ 'KIND': 'individual', 'ORG': 'Company' })).toBe(false);
    });

    it('should detect implicit organization (no N fields + has ORG)', () => {
      const records = {
        'ORG': 'Acme Corporation',
        'FN': 'Acme Corporation'
      };
      expect(isOrganization(records)).toBe(true);
    });

    it('should not detect organization when N fields exist', () => {
      const records = {
        'N.GN': 'John',
        'N.FN': 'Doe',
        'ORG': 'Acme Corporation'
      };
      expect(isOrganization(records)).toBe(false);
    });

    it('should default to individual when no clear indicators', () => {
      expect(isOrganization({})).toBe(false);
      expect(isOrganization({ 'FN': 'Some Name' })).toBe(false);
    });

    it('should handle macOS-style organization detection', () => {
      // macOS treats contacts without N fields as organizations
      const macOSOrg = {
        'FN': 'Apple Inc.',
        'ORG': 'Apple Inc.',
        'TEL': '+1-408-996-1010'
      };
      expect(isOrganization(macOSOrg)).toBe(true);
    });
  });
});