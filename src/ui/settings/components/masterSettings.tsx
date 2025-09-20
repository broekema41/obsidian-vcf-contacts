import { App, Setting } from "obsidian";
import * as React from "react";
import { setSettings } from "src/context/sharedSettingsContext";
import ContactsPlugin from "src/main";
import { FolderSuggest } from "src/settings/FolderSuggest";

interface MasterSettingProps {
  plugin: ContactsPlugin;
  app: App;
}


export function MasterSetting({ plugin, app }: MasterSettingProps) {

  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = "";

      const folderDesc = document.createDocumentFragment();
      folderDesc.append(
        "New contacts will be saved here.",
        folderDesc.createEl("br"),
        "If empty, contacts will be created in the root of your vault."
      );

      const contactsFolder = plugin.settings.contactsFolder;
      new Setting(containerRef.current)
        .setName("Contacts folder location")
        .setDesc(folderDesc)
        .addSearch((cb) => {
          new FolderSuggest(app, plugin, cb.inputEl);
          cb.setPlaceholder("Example: Contacts")
            .setValue(contactsFolder)
            .onChange(async(value) => {
              if(value === '') {
                plugin.settings.contactsFolder = '';
                await plugin.saveSettings();
                setSettings(plugin.settings);
              }
            });
        });

      const hashtagDesc = document.createDocumentFragment();
      hashtagDesc.append(
        "New contacts are automatically tagged with this hashtags.",
        hashtagDesc.createEl("br"),
        "The hashtags are inserted at the end of the note.",
        hashtagDesc.createEl("br"),
        hashtagDesc.createEl("br"),
        hashtagDesc.createEl("strong", {
          text: "Attention: ",
        }),
        "You must include the ",
        hashtagDesc.createEl("code", { text: "#" }),
        "-sign"
      );

      const defaultHashtag = plugin.settings.defaultHashtag;
      new Setting(containerRef.current)
        .setName("Default hashtags")
        .setDesc(hashtagDesc)
        .addText(text => text
          .setPlaceholder("")
          .setValue(defaultHashtag)
          .onChange(async (value) => {
            plugin.settings.defaultHashtag = value;
            await plugin.saveSettings();
            setSettings(plugin.settings);
          }));
    }
  }, []);

  return <div ref={containerRef} />;
}


