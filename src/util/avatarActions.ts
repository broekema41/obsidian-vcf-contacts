import { Notice } from "obsidian";
import { Contact, updateFrontMatterValue } from "src/contacts";
import { openFilePicker } from "src/file/file";
import { RunType } from "src/insights/insight.d";
import { insightService } from "src/insights/insightService";

const resizeAndCropImage = (img: HTMLImageElement, outputSize: number): HTMLCanvasElement => {
	const canvas = document.createElement('canvas');
	canvas.width = outputSize;
	canvas.height = outputSize;

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas context not available');

	const { naturalWidth: srcW, naturalHeight: srcH } = img;

	const scale = Math.max(outputSize / srcW, outputSize / srcH);
	const scaledW = srcW * scale;
	const scaledH = srcH * scale;

	const dx = (outputSize - scaledW) / 2;
	const dy = (outputSize - scaledH) / 2;

	ctx.drawImage(img, dx, dy, scaledW, scaledH);
	return canvas;
};

const base64EncodeImage = (canvas: HTMLCanvasElement, quality = 1): string => {
	return canvas.toDataURL('image/jpeg', quality);
};

const getImage = (url: string): Promise<HTMLImageElement> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = reject;
		img.src = url;
	});
};

function isHttpUrl(str: string): boolean {
	try {
		const url = new URL(str);
		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

export const processAvatar = async (contact: Contact) => {
	try {
		let rawImg :HTMLImageElement;
    await insightService.process(RunType.IMMEDIATELY)
		if (isHttpUrl(contact.data['PHOTO'])) {
			new Notice("Detected online photo url: Scaling and pulling into your local vault.");
			rawImg = await getImage(contact.data['PHOTO']);
		} else {
			const rawBlob = await openFilePicker('image/*');
			if (typeof rawBlob === 'string') {
				throw new Error('Process avatar can only use a online url or blob image');
			} else {
				const objectUrl  = URL.createObjectURL(rawBlob);
				rawImg = await getImage(objectUrl);
			}
		}

		await updateFrontMatterValue(contact.file, 'PHOTO', base64EncodeImage(resizeAndCropImage(rawImg, 120)));
	} catch (err) {
		throw new Error(
			"hmmm... Could not load or process the avatar image. The website hosting the image likely does not allow access from other apps (CORS restriction). " +
			"Try removing the 'PHOTO' property to upload a file from disk."
		);
	}
}


