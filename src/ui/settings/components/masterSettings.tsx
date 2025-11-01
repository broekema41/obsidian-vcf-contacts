import { App, Setting } from "obsidian";
import * as React from "react";
import { getSettings, updateSetting } from "src/context/sharedSettingsContext";
import { FolderSuggest } from "src/settings/FolderSuggest";

interface MasterSettingProps {
  app: App;
}


export function MasterSetting({ app }: MasterSettingProps) {

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

      new Setting(containerRef.current)
        .setName("Contacts folder location")
        .setDesc(folderDesc)
        .addSearch((cb) => {
          new FolderSuggest(app, cb.inputEl);
          cb.setPlaceholder("Example: Contacts")
            .setValue(getSettings().contactsFolder)
            .onChange(async(value) => {
              if(value === '') {
                await updateSetting('contactsFolder', '');
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

      new Setting(containerRef.current)
        .setName("Default hashtags")
        .setDesc(hashtagDesc)
        .addText(text => text
          .setPlaceholder("")
          .setValue(getSettings().defaultHashtag)
          .onChange(async (value) => {
            await updateSetting('defaultHashtag', value);
          }));

    }
  }, []);

  return <div ref={containerRef} />;
}


