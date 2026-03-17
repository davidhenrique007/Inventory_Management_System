module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:prettier/recommended',
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    // Regras personalizadas
    'prettier/prettier': 'error',
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'consistent-return': 'off',
    'func-names': 'off',
    'class-methods-use-this': 'off',
    
    // Ignorar caracteres especiais (acentos)
    'no-control-regex': 'off',
    'no-useless-escape': 'off',
    
    // Regras de importação
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.js', '**/*.spec.js', 'tests/**/*.js'],
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js'],
      },
    },
  },
};
