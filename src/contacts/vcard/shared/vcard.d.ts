export enum VCardSupportedKey {
	VERSION = "vCard Version",
	N = "Name",
	FN = "Full Name",
	NICKNAME = "Nickname",
	ADR = "Address",
	ADR_LABEL = "Address Label",
	AGENT = "Agent (Representative)",
	ANNIVERSARY = "Anniversary Date",
	BDAY = "Birthday Date",
	CATEGORIES = "Categories (Tags)",
	CLASS = "Classification (Privacy Level)",
	EMAIL = "Email Address",
	GENDER = "Gender",
	GEO = "Geolocation (Latitude/Longitude)",
	KIND = "Contact Type",
	LANG = "Language Spoken",
	MEMBER = "Group Member",
	NAME = "Name Identifier",
	NOTE = "Notes",
	ORG = "Organization Name",
	PHOTO = "Profile Photo",
	REV = "Last Updated Timestamp",
	ROLE = "Job Role or Title",
	SOURCE = "vCard Source URL",
	TEL = "Telephone Number",
	TITLE = "Job Title",
	TZ = "Time Zone",
	UID = "Unique Identifier",
	URL = "Website URL",
  SOCIALPROFILE = "Social Profile"
}

export interface VCardForObsidianRecord {
	[key: string]: string,
}

export interface VCardToStringError {
  status: string;
  file: string;
  message: string;
}

export interface VCardToStringReply {
  vcards: string;
  errors: VCardToStringError[];
}
