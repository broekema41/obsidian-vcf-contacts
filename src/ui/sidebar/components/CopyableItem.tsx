import { Menu, Notice } from "obsidian";
import * as React from "react";

interface CopyableItemProps {
	value: string;
	children: React.ReactNode;
}

export const CopyableItem: React.FC<CopyableItemProps> = ({ value, children }) => {
	const handleCopy = () => {
		navigator.clipboard.writeText(value).then(() => {
			new Notice(`Copied "${value}" to clipboard`);
		}).catch(err => {
			new Notice("Failed to copy to clipboard");
		});
	};

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
        event.stopPropagation();
		const menu = new Menu();
		menu.addItem((item) =>
			item.setTitle("Copy to clipboard").setIcon("clipboard").onClick(handleCopy)
		);
		menu.showAtPosition({ x: event.pageX, y: event.pageY });
	};

	return (
		<div className="biz-item" onContextMenu={handleContextMenu}>
			{children}
		</div>
	);
};
