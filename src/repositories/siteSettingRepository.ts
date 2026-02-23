import SiteSettingModel from '../models/SiteSetting';

const SiteSetting = SiteSettingModel;

const KEY_DAILY_DIAGNOSTIC_MAX = 'daily_diagnostic_max';

export const SiteSettingRepo = {
  async getValue(key: string): Promise<string | null> {
    const row = await SiteSetting.findOne({ where: { key } });
    return row ? row.value : null;
  },

  async setValue(key: string, value: string): Promise<void> {
    const [row] = await SiteSetting.findOrCreate({
      where: { key },
      defaults: { key, value, updatedAt: new Date() },
    });
    if (row.value !== value) {
      await row.update({ value, updatedAt: new Date() });
    }
  },

  async getDailyDiagnosticMax(): Promise<number> {
    const raw = await this.getValue(KEY_DAILY_DIAGNOSTIC_MAX);
    if (raw == null) return 20;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) || n < 0 ? 20 : Math.min(999, n);
  },

  async setDailyDiagnosticMax(max: number): Promise<number> {
    const value = String(Math.max(0, Math.min(999, Math.floor(max))));
    await this.setValue(KEY_DAILY_DIAGNOSTIC_MAX, value);
    return parseInt(value, 10);
  },
};
