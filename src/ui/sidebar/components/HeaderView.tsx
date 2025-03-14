import { setIcon } from "obsidian";
import * as React from "react";
import { Sort } from "src/util/constants";


type HeaderProps = {
	onSortChange: React.Dispatch<React.SetStateAction<Sort>>;
	sort: Sort;
	onCreateContact: () => void;
	importVCF: () => void;
	exportAllVCF: () => void;
};

export const HeaderView = (props: HeaderProps) => {
	const buttons = React.useRef<(HTMLElement | null)[]>([]);

	React.useEffect(() => {
		buttons.current.forEach(setIconForButton);
	}, [buttons]);

	return (
		<div className="contacts-menu">
			<div className="nav-header">
				<div className="nav-buttons-container">
					<div
						id="create-btn"
						className="clickable-icon nav-action-button"
						data-icon="contact"
						aria-label="Create New Contact"
						ref={(element) => (buttons.current[1] = element)}
						onClick={props.onCreateContact}
					/>

					<div
						id="import-vcf-btn"
						data-icon="file-down"
						className={
							"clickable-icon nav-action-button "
						}
						aria-label="import VCF"
						ref={(element) => (buttons.current[2] = element)}
						onClick={ props.importVCF }
					/>
					<div
						id="import-vcf-btn"
						data-icon="file-up"
						className={
							"clickable-icon nav-action-button "
						}
						aria-label="export VCF"
						ref={(element) => (buttons.current[3] = element)}
						onClick={ props.exportAllVCF }
					/>

					<div className="menu-vert"></div>
					<div
						id="sort-by-name-btn"
						data-icon="baseline"
						className={
							"clickable-icon nav-action-button " +
							(props.sort === Sort.NAME && "is-active")
						}
						aria-label="Sort By Name"
						ref={(element) => (buttons.current[4] = element)}
						onClick={() => props.onSortChange(Sort.NAME)}
					/>
					<div
						id="sort-by-birthday-btn"
						data-icon="cake"
						className={
							"clickable-icon nav-action-button " +
							(props.sort === Sort.BIRTHDAY && "is-active")
						}
						aria-label="Sort By Birthday"
						ref={(element) => (buttons.current[6] = element)}
						onClick={() => props.onSortChange(Sort.BIRTHDAY)}
					/>
					<div
						id="sort-by-organization-btn"
						data-icon="building"
						className={
							"clickable-icon nav-action-button " +
							(props.sort === Sort.ORG && "is-active")
						}
						aria-label="Sort By Organization"
						ref={(element) => (buttons.current[7] = element)}
						onClick={() => props.onSortChange(Sort.ORG)}
					/>
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
