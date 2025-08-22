import { MarkdownView, normalizePath, Notice, TFile, TFolder } from "obsidian";
import * as React from "react";
import { Contact, getFrontmatterFromFiles, mdRender } from "src/contacts";
import { vcard } from "src/contacts/vcard";
import { getApp } from "src/context/sharedAppContext";
import { getSettings, onSettingsChange } from "src/context/sharedSettingsContext";
import {
  createContactFile,
  createFileName,
  findContactFiles, isFileInFolder,
  openFilePicker,
  saveVcardFilePicker
} from "src/file/file";
import { ContactsListView } from "src/ui/sidebar/components/ContactsListView";
import { HeaderView } from "src/ui/sidebar/components/HeaderView";
import { InsightsView } from "src/ui/sidebar/components/InsightsView";
import { processAvatar } from "src/util/avatarActions";
import { Sort } from "src/util/constants";
import myScrollTo from "src/util/myScrollTo";

interface SidebarRootViewProps {
  createDefaultPluginFolder: () => Promise<void>;
}

export const SidebarRootView = (props: SidebarRootViewProps) => {
	const app = getApp();
  const { vault, workspace } = app;
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [displayInsightsView, setDisplayInsightsView] = React.useState<boolean>(false);
	const [sort, setSort] = React.useState<Sort>(Sort.NAME);
	let settings = getSettings();

	const parseContacts = () => {
		const contactsFolder = vault.getAbstractFileByPath(
			normalizePath(settings.contactsFolder)
		)

		if (!(contactsFolder instanceof TFolder)) {
			setContacts([]);
			return;
		}

    const contactFiles = findContactFiles(contactsFolder);
		getFrontmatterFromFiles(contactFiles).then((contactsData) =>{
			setContacts(contactsData);
		});
	};

	React.useEffect(() => {
		parseContacts();
    const offSettings = onSettingsChange(() => {
      settings = getSettings();
      parseContacts.call(this);
    });

    return () => {
      offSettings();
    };
	}, []);

	React.useEffect(() => {
		const updateFiles = (file: TFile) => {
			setTimeout(() => {
				if (isFileInFolder(file)) {
					parseContacts();
				}
			}, 450); // place our update after obsidian has a opportunity to run some code
		};

		vault.on("create", updateFiles);
		vault.on("modify", updateFiles);
		vault.on("rename", updateFiles);
		vault.on("delete", updateFiles);

		return () => {
			vault.off("create", updateFiles);
			vault.off("modify", updateFiles);
			vault.off("rename", updateFiles);
			vault.off("delete", updateFiles);
		};
	}, [vault, settings.contactsFolder]);


  React.useEffect(() => {

    const view = workspace.getActiveViewOfType(MarkdownView);
    myScrollTo.handleOpenWhenNoLeafEventYet(view?.leaf);

    workspace.on("active-leaf-change",  myScrollTo.handleLeafEvent);

    return () => {
      myScrollTo.clearDebounceTimer();
      workspace.off("active-leaf-change",  myScrollTo.handleLeafEvent);
    };
  }, [workspace]);

	return (
		<div className="contacts-sidebar">
      { displayInsightsView ?
        <InsightsView
          setDisplayInsightsView={setDisplayInsightsView}
          processContacts={contacts}
        />
      :
        <>
        <div className="contacts-menu">
          <div className="nav-header">
              <HeaderView
                onSortChange={setSort}
                importVCF={() => {
                  openFilePicker('.vcf').then(async (fileContent: string) => {
                    if (fileContent === '') {
                      return;
                    } else {
                      const records = await vcard.parse(fileContent);
                      for (const record of records) {
                        const mdContent = mdRender(record, settings.defaultHashtag);
                        createContactFile(app, settings.contactsFolder, mdContent, createFileName(record))
                      }
                    }
                  })
                }}
                exportAllVCF={async() => {
                  const allContactFiles = contacts.map((contact)=> contact.file)
                  const {vcards, errors} = await vcard.toString(allContactFiles);
                  errors.forEach((err) => {
                    new Notice(`${err.message} in file skipping ${err.file}`);
                  })
                  saveVcardFilePicker(vcards)
                }}
                onCreateContact={async () => {
                  const records = await vcard.createEmpty();
                  const mdContent = mdRender(records, settings.defaultHashtag);
                  createContactFile(app, settings.contactsFolder, mdContent, createFileName(records))
                }}
                setDisplayInsightsView={setDisplayInsightsView}
                sort={sort}
              />
            <div className="nav-actionable-container">

            </div>
          </div>
        </div>
        <div className="contacts-view">
          { contacts.length > 0 ?
            <ContactsListView
              contacts={contacts}
              sort={sort}
              processAvatar={(contact :Contact) => {
                (async () => {
                  try {
                    await processAvatar(contact);
                    setTimeout(() => { parseContacts() }, 50);
                  } catch (err) {
                    new Notice(err.message);
                  }
                })();
              }}
              exportVCF={(contactFile: TFile) => {
                (async () => {
                  const {vcards, errors} = await vcard.toString([contactFile])
                  errors.forEach((err) => {
                    new Notice(`${err.message} in file skipping ${err.file}`);
                  })
                  saveVcardFilePicker(vcards, contactFile)
                })();
              }} />
          :
            <>
              {!settings.contactsFolder ?
                <div className="action-card">
                  <div className="action-card-content">
                    <p>
                      Your contacts folder is currently set to the <strong>root of your vault</strong>. We recommend setting to a specific folder to reduce processing requirements.
                    </p>
                    <p>
                      <button onClick={props.createDefaultPluginFolder} className="mod-cta action-card-button">Make Contacts folder</button>
                    </p>
                  </div>
                </div>
              : null }

              <div className="action-card">
                <div className="action-card-content">
                  <p><b>No contacts found</b> It looks like you haven’t added any contacts yet. Use the icons above to:</p>
                  <ul>
                    <li>Create a new contact manually</li>
                    <li>Import a <code>.vcf</code> file from another app</li>
                  </ul>
                </div>
              </div>
            </>
          }
        </div>
        </>
      }
    </div>
  );
};
