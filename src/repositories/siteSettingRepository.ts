import SiteSettingModel from '../models/SiteSetting';

const SiteSetting = SiteSettingModel;

const KEY_DAILY_DIAGNOSTIC_MAX = 'daily_diagnostic_max';

export const SiteSettingRepo = {
  async getValue(key: string): Promise<string | null> {
    const row = await SiteSetting.findOne({
      where: { key },
      useMaster: true,
    });
    if (!row) return null;

    // Avoid direct property access (`row.value`) because class field emission can
    // shadow Sequelize attribute getters at runtime.
    const value = row.getDataValue('value');
    return typeof value === 'string' ? value : null;
  },

  async setValue(key: string, value: string): Promise<void> {
    await SiteSetting.upsert({
      key,
      value,
      updatedAt: new Date(),
    });
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
    // Read after write from the same durable store.
    const persisted = await this.getDailyDiagnosticMax();
    return persisted;
  },
};
