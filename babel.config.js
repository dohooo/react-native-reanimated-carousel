module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                root: './',
                extensions: ['.tsx', '.ts', '.js', '.json'],
                alias: {
                    '@/utils': './src/utils',
                },
            },
        ],
        'react-native-reanimated/plugin',
        'inline-dotenv',
        '@babel/plugin-syntax-dynamic-import',
    ],
};
