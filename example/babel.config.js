const pak = require('../package.json');

module.exports = function (api) {
    api.cache(true);

    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./src', '../src'],
                    extensions: ['.tsx', '.ts', '.js', '.json'],
                    alias: {
                        [pak.name]: '../src',
                        '@/utils': '../src/utils',
                    },
                },
            ],
            'react-native-reanimated/plugin',
            'inline-dotenv',
            '@babel/plugin-syntax-dynamic-import',
        ],
    };
};
