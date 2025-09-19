import { App, Modal, Notice } from "obsidian";
import { useState } from "react";
import * as React from "react";
import { createRoot, Root } from "react-dom/client"
import { VCardKind } from "src/contacts/vcard";
import { VCardKinds } from "src/contacts/vcard/shared/structuredFields";

type IndividualPayload = {
  kind: typeof VCardKinds.Individual;
  given: string;
  family: string;
};

type NonIndividualPayload = {
  kind:
    | typeof VCardKinds.Organisation
    | typeof VCardKinds.Group
    | typeof VCardKinds.Location;
  fn: string;
};

export type NamingPayload = IndividualPayload | NonIndividualPayload;

interface ContactNameModalProps {
	onClose: () => void;
	onSubmit: (nameData: NamingPayload) => void;
}

const ContactNameModalContent: React.FC<ContactNameModalProps> = ({ onClose, onSubmit }) => {
  const [kind, setKind] = useState<"individual" | "org" | "location" | "group">("individual");
  const givenRef = React.useRef<HTMLInputElement>(null);
	const familyRef = React.useRef<HTMLInputElement>(null);
  const fnRef = React.useRef<HTMLInputElement>(null);

	const handleSubmit = () => {
		const given = givenRef.current?.value.trim() ?? "";
		const family = familyRef.current?.value.trim() ?? "";
    const fn = fnRef.current?.value.trim() ?? "";

		if (kind === VCardKinds.Individual) {
      if(!given || !family) {
        new Notice("Please enter basic name information.");
        return;
      }
      onSubmit({
        kind: VCardKinds.Individual,
        given,
        family,
      });
		} else {
      if(!fn) {
        new Notice("Please enter basic name information.");
        return;
      }
      onSubmit({
        kind,
        fn
      });
    }


		onClose();
	};

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKind(e.target.value as VCardKind);
  };

	React.useEffect(() => {
		givenRef.current?.focus();
	}, []);

	return (
    <div className="contact-modal">

      <div className="contact-modal-field">
        <label className="contact-modal-label">
          Contact type:
        </label>
        <select
          id="kind-select"
          className="dropdown contact-modal-input"
          value={kind}
          onChange={handleChange}>
          {Object.entries(VCardKinds).map(([label, value]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {kind === VCardKinds.Individual ? (
        <>
          <div className="contact-modal-field">
            <label className="contact-modal-label">
              Given name:
            </label>
            <input
              ref={givenRef}
              type="text"
              className="contact-modal-input"
            />
          </div>
          <div className="contact-modal-field">
            <label className="contact-modal-label">
              Family name:
            </label>
            <input
              ref={familyRef}
              type="text"
              className="contact-modal-input"
            />
          </div>
        </>
        ) : (
        <div className="contact-modal-field">
        <label className="contact-modal-label">
          Functional name:
        </label>
        <input
          ref={fnRef}
          type="text"
          className="contact-modal-input"
        />
      </div>
)}
      <div className="contact-modal-buttons">
        <button className="mod-cta"
                onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
};


export class ContactNameModal extends Modal {
  private reactRoot: Root | null = null;
  private callback: (nameData: NamingPayload) => void;

	constructor(app: App, callback: (nameData: NamingPayload) => void) {
		super(app);
		this.callback = callback;
	}

	onOpen() {
		this.titleEl.setText(`Enter functional name`);

		this.reactRoot = createRoot(this.contentEl);
		this.reactRoot.render(
			<ContactNameModalContent
				onClose={() => this.close()}
				onSubmit={(nameData: NamingPayload) => this.callback(nameData)}
			/>
		);
	}

	onClose() {
		this.reactRoot?.unmount();
	}
}
