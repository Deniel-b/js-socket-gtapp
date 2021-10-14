var fs = require('fs')

const path = "D:/js projects/socket test/test"

if (!fs.existsSync(path)){
    console.log('The path not exists.');
    fs.mkdirSync(path)
}

buffer_ = new Buffer.alloc(0)

buffer_ = Buffer.concat("hello world", 5555)


const typedArray1 = new Int8Array(8);
typedArray1[0] = "hi";

fs.writeFile(path + '/test.gtr', buffer_, function(error) {if(error) throw error})