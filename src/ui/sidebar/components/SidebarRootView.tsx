import { App, MarkdownView, normalizePath, Notice, TFile, TFolder } from "obsidian";
import * as React from "react";
import { Contact, getFrontmatterFromFiles, mdRender } from "src/contacts";
import { vcard } from "src/contacts/vcard";
import { getApp } from "src/context/sharedAppContext";
import { getSettings } from "src/context/sharedSettingsContext";
import {
  createContactFile,
  createFileName,
  findContactFiles, isFileInFolder,
  openFilePicker,
  saveVcardFilePicker
} from "src/file/file";
import { insightService } from "src/insights/insightService";
import { ContactsPluginSettings } from "src/settings/settings";
import { useSettings } from "src/ui/hooks/settingsHook";
import { ContactsListView } from "src/ui/sidebar/components/ContactsListView";
import { HeaderView } from "src/ui/sidebar/components/HeaderView";
import { InsightsView } from "src/ui/sidebar/components/InsightsView";
import { processAvatar } from "src/util/avatarActions";
import { Sort } from "src/util/constants";
import myScrollTo from "src/util/myScrollTo";

interface SidebarRootViewProps {
  sideBarApi: (api: { createNewContact: () => void }) => void;
  createDefaultPluginFolder: () => Promise<void>;
}

const importVCFContacts = async (fileContent: string, app: App, settings: ContactsPluginSettings) => {
  if (fileContent === '') return;

  let imported = 0;
  let skipped = 0;

  // Use generator to avoid double parsing and reduce memory usage
  for await (const [slug, record] of vcard.parse(fileContent)) {
    if (slug) {
      const mdContent = mdRender(record, settings.defaultHashtag);
      const filename = slug + '.md';
      await createContactFile(app, settings.contactsFolder, mdContent, filename);
      imported++;
    } else {
      // Contact has no valid name/slug
      console.warn("Skipping contact without name", record);
      skipped++;
    }
  }

  if (skipped > 0) new Notice(`Skipped ${skipped} contact(s) without name information`);
  if (imported > 0) new Notice(`Imported ${imported} contact(s)`);
};

export const SidebarRootView = (props: SidebarRootViewProps) => {
	const app = getApp();
  const { vault, workspace } = app;
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [displayInsightsView, setDisplayInsightsView] = React.useState<boolean>(false);
	const [sort, setSort] = React.useState<Sort>(Sort.NAME);
  let mySettings:ContactsPluginSettings = getSettings();
  const myHookSettings: ContactsPluginSettings|undefined = useSettings();

	const parseContacts = () => {
    if (!mySettings) {
      return;
    }

		const contactsFolder = vault.getAbstractFileByPath(
			normalizePath(mySettings.contactsFolder)
		)

		if (!(contactsFolder instanceof TFolder)) {
			setContacts([]);
			return;
		}

    const contactFiles = findContactFiles(contactsFolder);
		getFrontmatterFromFiles(contactFiles).then((contactsData) =>{
			setContacts(contactsData);
      insightService.setContacts(contactsData);
		});
	};

  React.useEffect(() => {
    if (myHookSettings !== undefined) {
      // Run your function here, e.g., parseContacts
      mySettings = myHookSettings;
      parseContacts();
    }
  }, [myHookSettings]);

  React.useEffect(() => {
    props.sideBarApi({ createNewContact });
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
	}, [vault, mySettings.contactsFolder]);


  React.useEffect(() => {

    const view = workspace.getActiveViewOfType(MarkdownView);
    myScrollTo.handleOpenWhenNoLeafEventYet(view?.leaf);

    workspace.on("active-leaf-change",  myScrollTo.handleLeafEvent);

    return () => {
      myScrollTo.clearDebounceTimer();
      workspace.off("active-leaf-change",  myScrollTo.handleLeafEvent);
    };
  }, [workspace]);

  async function createNewContact() {
      const records = await vcard.createEmpty();
      const mdContent = mdRender(records, mySettings.defaultHashtag);
      await createContactFile(app, mySettings.contactsFolder, mdContent, createFileName(records));
  }

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
                    await importVCFContacts(fileContent, app, mySettings);
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
                onCreateContact={createNewContact}
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
              {!mySettings.contactsFolder ?
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
