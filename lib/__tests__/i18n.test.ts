import { translations, LANGUAGES } from '@/lib/i18n';

describe('i18n 辞書', () => {
  it('全言語が同一キーを持つ', () => {
    const enKeys = Object.keys(translations.en).sort();
    const jaKeys = Object.keys(translations.ja).sort();
    expect(enKeys).toEqual(jaKeys);
  });

  it('全値が空でない文字列であること', () => {
    LANGUAGES.forEach(lang => {
      Object.entries(translations[lang]).forEach(([, value]) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });

  it('英語辞書に期待される主要キーが含まれること', () => {
    const expectedKeys = [
      // page
      'page.heading',
      'page.description',
      'page.loading',
      'page.tab.meditation',
      'page.tab.journaling',
      'page.tab.history',
      'page.button.settings',
      'page.button.logout',
      'page.footer',
      // meditation
      'meditation.heading',
      'meditation.hint',
      'meditation.button.start',
      'meditation.button.pause',
      'meditation.button.resume',
      'meditation.button.stop',
      // journaling
      'journaling.heading',
      'journaling.hint',
      'journaling.button.start',
      'journaling.button.end',
      'journaling.phase.break',
      'journaling.hint.write',
      'journaling.hint.rest',
      'journaling.confirm.end',
      // history
      'history.stat.streak',
      'history.stat.meditation',
      'history.stat.journaling',
      'history.stat.total',
      'history.heading',
      'history.empty',
      'history.type.meditation',
      'history.type.journaling',
      'history.button.delete',
      'history.confirm.delete',
      // settings
      'settings.heading',
      'settings.label.meditation',
      'settings.label.journaling',
      'settings.label.break',
      'settings.label.language',
      'settings.button.save',
      'settings.button.cancel',
      'settings.alert.saved',
      // auth
      'auth.heading.login',
      'auth.heading.signup',
      'auth.description.login',
      'auth.description.signup',
      'auth.label.email',
      'auth.label.password',
      'auth.button.login',
      'auth.button.signup',
      'auth.button.submitting',
      'auth.error.invalid',
      'auth.error.server',
      'auth.link.signup',
      'auth.link.login',
      'auth.text.nosignup',
      'auth.text.withsignup',
    ];

    expectedKeys.forEach(key => {
      expect(translations.en).toHaveProperty([key]);
    });
  });
});
