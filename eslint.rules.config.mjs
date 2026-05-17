import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*']
  },
  {
    files: ['**/*.rules', 'DRAFT_firestore.rules'],
    plugins: {
      'firebase-security-rules': firebaseRulesPlugin
    },
    rules: {
      // Basic rules setup, or use recommended
    }
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
