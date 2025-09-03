import { MarkdownView, WorkspaceLeaf } from "obsidian";
import { fileId, isFileInFolder } from "src/file/file";

let debounceTimer: number
let lastContactLeaf: WorkspaceLeaf | null = null;

const handleOpenWhenNoLeafEventYet =  (leaf: WorkspaceLeaf | undefined):void => {
  if (leaf?.view instanceof MarkdownView && lastContactLeaf === null) {
    handleLeafEvent(leaf);
  }
}

const handleLeafEvent = (leaf: WorkspaceLeaf | null):void => {
  const viewType = leaf?.view?.getViewType?.();

  if (leaf?.view instanceof MarkdownView) {
    if (leaf.view && leaf.view.file) {
      lastContactLeaf = leaf;
      scrollToLeaf(lastContactLeaf);
    }
  } else if (viewType === 'contacts-view' && lastContactLeaf !== null) {
    scrollToLeaf(lastContactLeaf);
  } else if (leaf === null && lastContactLeaf !== null) {
    scrollToLeaf(lastContactLeaf);
  }
}

const scrollToLeaf = (leaf: WorkspaceLeaf):void => {
	clearTimeout(debounceTimer); // Reset debounce timer
  debounceTimer = window.setTimeout(() => {
		if (!(leaf?.view instanceof MarkdownView)) return;
        if (leaf.view.file === null) return;

		const contactElement = document.getElementById(fileId(leaf.view.file));
		if (!contactElement) return;


		const scrollContainer = document.querySelector(".contacts-view") as HTMLElement | null;
		if (!scrollContainer) return;

		const elementRect = contactElement.getBoundingClientRect();
		const containerRect = scrollContainer.getBoundingClientRect();

		const scrollOffset =
			elementRect.top - containerRect.top - scrollContainer.clientHeight / 2 + elementRect.height / 2;

		// Smoothly scroll to center the element
		requestAnimationFrame(() => {
			scrollContainer.scrollTo({
				top: scrollContainer.scrollTop + scrollOffset,
				behavior: "smooth",
			});
		});
	}, 50);
};

const scrollToTop = ():void => {
		const scrollContainer = document.querySelector(".contacts-view") as HTMLElement | null;
		if (!scrollContainer) return;
		requestAnimationFrame(() => {
			scrollContainer.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		});
};


const clearDebounceTimer = ():void => {
  window.clearTimeout(debounceTimer);
}

const reset = ():void => {
  clearDebounceTimer();
  lastContactLeaf = null;
}

export default {
	scrollToTop,
  handleLeafEvent,
  handleOpenWhenNoLeafEventYet,
	clearDebounceTimer,
	reset,
}
