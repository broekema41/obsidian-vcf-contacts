import {addDefaultFields} from "src/contacts/vcard/addDefaultFields";

export * from 'src/contacts/vcard/shared/vcard.d';
import { createEmpty } from 'src/contacts/vcard/createEmpty';
import { parse } from 'src/contacts/vcard/parse';
import { toString } from 'src/contacts/vcard/toString';

export const vcard = {
  parse,
  toString,
  createEmpty,
  addDefaultFields
};
