const fs = require('fs');
const filePath = '.i-am-still-alive';
const isExists = fs.existsSync(filePath);
if (isExists) {
    fs.unlinkSync(filePath);
} else {
    fs.writeFileSync(filePath);
}
