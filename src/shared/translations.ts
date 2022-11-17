import '../types.d'

declare let window: WindowWithKomojuGlobals;

// Call this to add messages to the registry.
// Individual payment method modules can do this to add their own messages.
// That way, we avoid needing to load all messages for every payment method upfront.
export function registerMessages(messages: I18n) {
  for (const lang of Object.keys(window.komojuTranslations)) {
    window.komojuTranslations[lang] = {
      ...window.komojuTranslations[lang],
      ...messages[lang],
    };
  }
}
