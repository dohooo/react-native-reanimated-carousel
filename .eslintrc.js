module.exports = {
    root: true,
    extends: ['@react-native-community', 'prettier'],
    rules: {
        'prettier/prettier': [
            'error',
            {
                quoteProps: 'consistent',
                singleQuote: true,
                tabWidth: 4,
                trailingComma: 'es5',
                useTabs: false,
            },
        ],
    },
};
