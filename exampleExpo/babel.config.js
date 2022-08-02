const path = require('path');
const pak = require('../package.json');
const { isProd } = require('./constants');

module.exports = function (api) {
    api.cache(true);
    const plugins = [
        'react-native-reanimated/plugin',
        'inline-dotenv',
        '@babel/plugin-syntax-dynamic-import',
    ];

    if (!isProd) {
        return {
            presets: ['babel-preset-expo'],
            plugins,
        };
    }

    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    extensions: ['.tsx', '.ts', '.js', '.json'],
                    alias: {
                        [pak.name]: path.join(__dirname, '..', pak.main),
                    },
                },
            ],
            ...plugins,
        ],
    };
};
