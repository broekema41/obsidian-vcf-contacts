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

      const contactsFolder = plugin.settings.contactsFolder;
      new Setting(containerRef.current)
        .setName("Template folder location")
        .setDesc("Files in this folder will be available as templates.")
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

      const defaultHashtag = plugin.settings.defaultHashtag;
      new Setting(containerRef.current)
        .setName('Default hashtag')
        .setDesc('Hashtag to be used for every contact created')
        .addText(text => text
          .setPlaceholder('')
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


