import { settings, AppSettings } from '../settings';

describe('settings', () => {
  const defaultSettings: AppSettings = {
    meditationDuration: 5,
    journalingDuration: 60,
    journalingBreakDuration: 10,
    language: 'en',
  };

  const customSettings: AppSettings = {
    meditationDuration: 10,
    journalingDuration: 120,
    journalingBreakDuration: 15,
    language: 'en',
  };

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('get', () => {
    it('データがない場合はデフォルト設定を返す', () => {
      expect(settings.get()).toEqual(defaultSettings);
    });

    it('保存された設定を返す', () => {
      localStorage.setItem('meditation-journaling-settings', JSON.stringify(customSettings));

      expect(settings.get()).toEqual(customSettings);
    });

    it('部分的な設定でもデフォルト値とマージされる', () => {
      const partialSettings = { meditationDuration: 15 };
      localStorage.setItem('meditation-journaling-settings', JSON.stringify(partialSettings));

      const result = settings.get();

      expect(result.meditationDuration).toBe(15);
      expect(result.journalingDuration).toBe(60); // デフォルト値
      expect(result.journalingBreakDuration).toBe(10); // デフォルト値
    });

    it('無効なJSONの場合はデフォルト設定を返す', () => {
      localStorage.setItem('meditation-journaling-settings', 'invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(settings.get()).toEqual(defaultSettings);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('save', () => {
    it('設定を保存する', () => {
      settings.save(customSettings);

      const saved = JSON.parse(localStorage.getItem('meditation-journaling-settings')!);
      expect(saved).toEqual(customSettings);
    });

    it('部分的な更新でも既存の設定を保持する', () => {
      settings.save(customSettings);
      settings.save({ meditationDuration: 7 });

      const result = settings.get();

      expect(result.meditationDuration).toBe(7);
      expect(result.journalingDuration).toBe(120); // customSettingsの値を保持
      expect(result.journalingBreakDuration).toBe(15); // customSettingsの値を保持
    });

    it('LocalStorageへの保存に失敗した場合はエラーをログ出力する', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      settings.save(customSettings);

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error));

      consoleSpy.mockRestore();
      jest.restoreAllMocks();
    });
  });
});
