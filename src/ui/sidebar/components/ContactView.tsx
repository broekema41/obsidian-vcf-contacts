import { setIcon, TFile } from "obsidian";
import * as React from "react";
import { Contact, parseKey } from "src/contacts";
import { getApp } from "src/context/sharedAppContext";
import { fileId, openFile } from "src/file/file";
import Avatar from "src/ui/sidebar/components/Avatar";
import { CopyableItem } from "src/ui/sidebar/components/CopyableItem";
import { getUiName, uiSafeString } from "src/util/nameUtils";

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


  const renderTopThreeItems = (
    base: string,
    sortArray: string[],
    data: Record<string, any>,
    renderItem: (key: string, value: string, keyParts: ReturnType<typeof parseKey>) => JSX.Element
  ): JSX.Element[] | null => {
    const entries: [string, string][] = Object.entries(data)
      .filter(
        ([key, value]) => {
          if (!key.startsWith(base)) return false;
          if (value === null) return false;
          return value !== '';
        }
      )
      .sort(([aKey], [bKey]) => {
        const aIndex = sortArray.indexOf(aKey);
        const bIndex = sortArray.indexOf(bKey);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });

    const reversed = [...entries].reverse();
    const seen = new Set<string>();
    const deduped: [string, string][] = [];

    for (const [key, value] of reversed) {
      if (!seen.has(value)) {
        deduped.push([key, value]);
        seen.add(value);
      }
    }

    const topThree = deduped.reverse().slice(0, 3);
    if (!topThree.length) return null;

    try {
      return topThree.map(([key, value]) => {
        const keyParts = parseKey(key);
        return renderItem(key, value, keyParts);
      });
    } catch (e) {
      console.error('Failed to render Display Items', e, topThree);
      return null;
    }

  };


	const renderTopEmails =  (base: string, sortArray: string[], data: Record<string, any>) => {
    return renderTopThreeItems(base, sortArray, data, (key, value, keyParts) => {
      return value.length > 23 ? (
        <CopyableItem key={key} value={value}>
          @ <a href={`mailto:${value}`}>Email {keyParts.type?.toLowerCase()} </a>
        </CopyableItem>
      ) : (
        <CopyableItem key={key} value={value}>
          <a href={`mailto:${value}`}>{value}</a>
        </CopyableItem>
      )
    });
	}

	const renderTopPhones = (base: string, sortArray: string[], data: Record<string, any>) => {
    return renderTopThreeItems(base, sortArray, data, (key, value, keyParts) => (
      <CopyableItem key={key} value={value}>
        <a href={`tel:${value}`}>{keyParts.type?.toLowerCase()} {value}</a>
      </CopyableItem>
    ));
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
		for (let i = 0; i < prefix.length; i++) {
			const pre = prefix[i];
			if (values[`${pre}.STREET`]) {
				return (
					<CopyableItem value={[
						values[`${pre}.PO`],
						values[`${pre}.STREET`],
						values[`${pre}.EXT`],
						values[`${pre}.POSTAL`],
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
                  .map(uiSafeString)
                  .filter((value)=> value !== undefined)
									.join(' ')}
							</div>
						)}
						{(values[`${pre}.POSTAL`] || values[`${pre}.LOCALITY`]) && (
							<div>
								{[
									values[`${pre}.POSTAL`],
									values[`${pre}.LOCALITY`],
								]
                  .map(uiSafeString)
                  .filter((value)=> value !== undefined)
									.join(' ')}
							</div>
						)}
						{(values[`${pre}.REGION`] || values[`${pre}.COUNTRY`]) && (
							<div>
								{[
									values[`${pre}.REGION`],
									values[`${pre}.COUNTRY`]
								]
                  .map(uiSafeString)
                  .filter((value)=> value !== undefined)
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
												lastName={contact.data["N.FN"]} functionalName={contact.data["FN"]}/>
								<div className="biz-words-container">
									<div className="biz-name">
                    {getUiName(contact.data)}
                  </div>

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
								{renderTopPhones('TEL', ['TEL', 'TEL[CELL]', 'TEL[HOME]', 'TEL[WORK]'],  contact.data)}
                {renderTopEmails('EMAIL', ['TEL', 'EMAIL[HOME]', 'EMAIL[WORK]'],  contact.data)}
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
