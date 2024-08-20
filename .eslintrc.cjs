module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    "plugin:react-hooks/recommended",
    '@electron-toolkit/eslint-config-ts/recommended',
    // '@electron-toolkit/eslint-config-prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    'prefer-const': ['warn']
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
