import { setIcon, TFile } from "obsidian";
import * as React from "react";
import { Contact, parseKey } from "src/contacts";
import { getApp } from "src/context/sharedAppContext";
import { fileId, openFile } from "src/file/file";
import Avatar from "src/ui/sidebar/components/Avatar";
import { CopyableItem } from "src/ui/sidebar/components/CopyableItem";

type ContactProps = {
	contact: Contact;
	exportVCF: (contactFile: TFile) => void;
	processAvatar: (contact: Contact) => void;
};


export const ContactView = (props: ContactProps) => {
	const {workspace} = getApp();
	const contact = props.contact;
	const buttons = React.useRef<(HTMLElement | null)[]>([]);
	React.useEffect(() => {
		buttons.current.forEach(setIconForButton);
	}, [buttons]);


	const renderFirstEmail = (prefix: string[], values: any) => {
		for (let i = 0; i < prefix.length; i++) {
			const pre = prefix[i];
			const keyparts = parseKey(pre);
			if (values[`${pre}`]) {
				if (values[`${pre}`].length > 24) {
					return (
						<CopyableItem value={values[`${pre}`]}>
							@ <a href={`mailto:${values[`${pre}`]}`}>Email {keyparts.type?.toLowerCase()} </a>
						</CopyableItem>
					)
				}
				return (
					<CopyableItem value={values[`${pre}`]}>
						<a href={`mailto:${values[`${pre}`]}`}>{values[`${pre}`]}</a>
					</CopyableItem>
				)
			}
		}
		return null;
	}

	const renderFirstPhone = (prefix: string[], values: any) => {
		for (let i = 0; i < prefix.length; i++) {
			const pre = prefix[i];
			const keyparts = parseKey(pre);
			if (values[`${pre}`]) {
				return (
					<CopyableItem value={values[`${pre}`]}>
						<a href={`tel:${values[`${pre}`]}`}>{keyparts.type?.toLowerCase()} {values[`${pre}`]}</a>
					</CopyableItem>
				)
			}
		}
		return null;
	}

	const renderOrganization = (values: any) => {
		if (values[`ORG`]) {
			return (
				<div className="bizzy-card-organization">
					{values[`ORG`]}
				</div>
			)
		}
		return null;
	}

	const renderFirstAdress = (prefix: string[], values: any) => {
		const safe = (val: any) => val != null ? String(val).trim() : '';
		for (let i = 0; i < prefix.length; i++) {
			const pre = prefix[i];
			if (values[`${pre}.STREET`]) {
				return (
					<CopyableItem value={[
						values[`${pre}.PO`],
						values[`${pre}.STREET`],
						values[`${pre}.EXT`],
						safe(values[`${pre}.POSTAL`]),
						values[`${pre}.LOCALITY`],
						values[`${pre}.REGION`],
						values[`${pre}.COUNTRY`]
					].join(' ')}>
						{(values[`${pre}.PO`] || values[`${pre}.STREET`] || values[`${prefix}.EXT`]) && (
							<div>
								{[
									values[`${pre}.PO`],
									values[`${pre}.STREET`],
									values[`${pre}.EXT`]
								]
									.filter(part => part && part.trim())
									.join(' ')}
							</div>
						)}
						{(safe(values[`${pre}.POSTAL`]) || values[`${pre}.LOCALITY`]) && (
							<div>
								{[
									safe(values[`${pre}.POSTAL`]),
									values[`${pre}.LOCALITY`],
								]
									.filter(part => part && part.trim())
									.join(' ')}
							</div>
						)}
						{(values[`${pre}.REGION`] || values[`${pre}.COUNTRY`]) && (
							<div>
								{[
									values[`${pre}.REGION`],
									values[`${pre}.COUNTRY`]
								]
									.filter(part => part && part.trim())
									.join(' ')}
							</div>
						)}
					</CopyableItem>
				)
			}
		}
		return null;
	};

	return (
		<div
			className="contact-card"
			onClick={() => openFile(contact.file, workspace)}
			id={fileId(contact.file)}
		>
			<div className="content">
				<div className="inner-card-container">
					<div className="bizzy-card-container">
						{renderOrganization(contact.data)}
						<div className="biz-card-a">
							<div className="biz-headshot biz-pic-drew">
								<Avatar photoUrl={contact.data["PHOTO"]} firstName={contact.data["N.GN"]}
												lastName={contact.data["N.FN"]}/>
								<div className="biz-words-container">
									<div className="biz-name">
									{[
										contact.data["N.PREFIX"],
										contact.data["N.GN"],
										contact.data["N.MN"],
										contact.data["N.FN"],
										contact.data["N.SUFFIX"]
									]
										.filter(part => part && part.trim())
										.join(' ')}</div>

									{contact.data["ROLE"] ? (
										<div className="biz-title">{contact.data["ROLE"]}</div>
									) : contact.data["CATEGORIES"] ? (
										<div className="biz-title">{contact.data["CATEGORIES"]}</div>
									) : null}

								</div>
							</div>
						</div>

						<div className="biz-card-b">
							<div className="biz-shape">
							</div>
							<div className="biz-contact-box">
								{renderFirstPhone(['TEL[CELL]', 'TEL'], contact.data)}
								{renderFirstPhone(['TEL[WORK]', 'TEL[HOME]'], contact.data)}
								{renderFirstEmail(['EMAIL', 'EMAIL[HOME]'], contact.data)}
								{renderFirstEmail(['EMAIL', 'EMAIL[WORK]'], contact.data)}
								{renderFirstAdress(['ADR[WORK]', 'ADR[HOME]', 'ADR'], contact.data)}
							</div>
						</div>
						<div className="biz-contact-actions">
							<div
								data-icon="image-up"
								className={
									"clickable-icon nav-action-button "
								}
								aria-label="Process avatar"
								ref={(element) => (buttons.current[0] = element)}
								onClick={(event) => {
                  event.stopPropagation();
                  props.processAvatar(contact);
                }}
							>
							</div>
							<div
								data-icon="file-up"
								className={
									"clickable-icon nav-action-button "
								}
								aria-label="Export vcf"
								ref={(element) => (buttons.current[1] = element)}
								onClick={(event) => {
                  event.stopPropagation();
                  props.exportVCF(contact.file);
                }}
							>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

function setIconForButton(button: HTMLElement | null) {
	if (button != null) {
		const icon = button.getAttr("data-icon");
		if (icon != null) {
			setIcon(button, icon);
		}
	}
}
