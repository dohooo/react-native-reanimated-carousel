const fs = require('fs');
const gifify = require('gifify');
const path = require('path');

const options = {
    resize: '441:235',
    colors: 255,
    fps: 60,
    speed: 0.5,
};

async function convertFile(input) {
    return new Promise((resolve, reject) => {
        const inputFileInfo = fs.statSync(input);
        const inputDir = path.dirname(input);
        const extName = path.extname(input);
        const baseName = path.basename(input, extName);
        if (extName !== '.mov') {
            console.error(
                `仅支持苹果默认的录屏软件所生成的mov文件 🙆‍♂️\n${input}`
            );
            reject();
        }
        console.log(
            `文件[${baseName}]开始转换\nSize:${Number(
                inputFileInfo.size / 1024000
            ).toFixed(2)}MB`
        );
        const output = path.join(inputDir, `${baseName}.gif`);
        const gif = fs.createWriteStream(output);
        gifify(input, options).pipe(gif);
        gif.on('close', function end() {
            const gifInfo = fs.statSync(output);
            console.log(
                `文件[${baseName}]转换完成\nSize:${Number(
                    gifInfo.size / 1024000
                ).toFixed(2)}MB`
            );
            resolve();
        });
    });
}

async function main() {
    /**
     * @param path(file/dir)
     */
    const [_p] = process.argv.slice(2);
    const sourceFilePath = path.resolve(_p);
    const isExists = fs.existsSync(sourceFilePath);

    if (!isExists) {
        console.log('目标目录不存在');
        return;
    }

    const sourceFileInfo = fs.statSync(sourceFilePath);

    if (sourceFileInfo.isFile()) {
        try {
            await convertFile(sourceFilePath);
        } catch (e) {}
    } else if (sourceFileInfo.isDirectory()) {
        const files = fs.readdirSync(sourceFilePath);
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path.join(sourceFilePath, file);
            if (filePath.includes('DS_Store')) {
                continue;
            }
            try {
                await convertFile(filePath);
            } catch (e) {}
        }

        console.log('任务结束');
    }
}

try {
    main();
} catch (e) {
    console.log(e);
}
