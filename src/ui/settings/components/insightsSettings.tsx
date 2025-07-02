import { Setting } from "obsidian";
import * as React from "react";
import { setSettings } from "src/context/sharedSettingsContext";
import { InsighSettingProperties } from "src/insights/insight";
import { insightService } from "src/insights/insightService";
import ContactsPlugin from "src/main";

interface InsightSettingsProps {
  plugin: ContactsPlugin;
}

export function InsightSettings({ plugin }: InsightSettingsProps) {
  const insightsSetting = insightService.settings();
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (containerRef.current) {
      insightsSetting.forEach((settingProps :InsighSettingProperties) => {
        console.log(settingProps);
        const settingKey = settingProps.settingPropertyName;
        const currentValue = plugin.settings.processors[settingKey];
        console.log(currentValue, settingKey);
        if (typeof currentValue === 'boolean' && containerRef.current) {
          new Setting(containerRef.current)
            .setName(settingProps.name)
            .setDesc(settingProps.settingDescription)
            .addToggle(toggle =>
              toggle
                .setValue(currentValue)
                .onChange(async (value) => {
                  plugin.settings.processors[settingKey] = value;
                  await plugin.saveSettings();
                  setSettings(plugin.settings);
                }));
        }
      })

    }
  }, []);

  return (
    <div className="setting-item-spacer"  ref={containerRef}>
      <div className="setting-item setting-item-heading">
        <div className="setting-item-info">
          <div className="setting-item-name">Insights processors</div>
          <div className="setting-item-description"></div>
        </div>
        <div className="setting-item-control"></div>
      </div>
    </div>
  )

}


