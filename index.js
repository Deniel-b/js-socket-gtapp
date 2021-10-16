const net = require('net');
var events = require('events');
var fs = require('fs');



/*var year = new Date().getFullYear
var month = new Date().getMonth
var day = new Date().getDay
var hour = new Date().getHours
var minutes = new Date().getMinutes
var seconds = new Date().getSeconds */


var date = new Date()
date = `${date}`.replace('GMT+0300 (Москва, стандартное время)', '').split(' ').join('-').slice(0, -1)
console.log(`current date ${date}`)


let arr = new Array();

client = net.createConnection(30000, "192.168.12.100", () => {
    console.log("CONNECTED")
});

var max = 0;

var all_bufs = new Array()

var size_ = 0

var byte_array = new Buffer.alloc(0)
var forw = 0

const path = 'D:/js projects/socket test/logs' // путь к файлам на пк, можешь убрать, да и в принципе всё что связанно с fs убрать



client.setTimeout(10000)  // TimeOut на 10 секунд
/*client.on('timeout', () => {
    console.log('socket timeout');
    if(byte_array.length == 0){
        console.log("no data") // можно поставить всплывающее уведомление что ошибка поключения и надо ещё раз делать сбор данных
        client.end() 
    }
    else{
        var last_buf = Buffer.from(byte_array) // это всё работа с файлом, можешь пока что убрать это условие до client.end()
        console.log(last_buf)
        console.log(Uint16Array.BYTES_PER_ELEMENT)
        //console.log(buf.length)
        var typedArray = new Uint16Array(last_buf.buffer, 0,
            last_buf.length / Uint16Array.BYTES_PER_ELEMENT)    
        console.log(typedArray)
        
        var file = fs.writeFile(path + '/file4.gtr', typedArray, function(error) {if(error) throw error})
        client.end(); // это если все данные или не полные
    }
    
  });*/




  client.on('timeout', () => {
    console.log('socket timeout');  // то же самое что и сверху только не закоменчено
    if(byte_array.length == 0){
        console.log("no data") // можно поставить всплывающее уведомление что ошибка поключения и надо ещё раз делать сбор данных
        client.end() 
    }
    else{
        var last_buf = Buffer.from(byte_array)
        console.log(last_buf)
        //console.log(Uint16Array.BYTES_PER_ELEMENT)
        //console.log(buf.length)]
        var arrayBuf = new ArrayBuffer(last_buf.length)
        //var typedArray = new Uint16Array(arrayBuf);
        console.log("arrayBuf: ", arrayBuf)
        
        var typedArray = new Uint16Array(Buffer.from(last_buf));
        console.log("typedArray: ", typedArray)
        for (var i = 0; i < last_buf.length; ++i) {
            typedArray[i] = last_buf[i];
            //console.log("typedArray: ", typedArray)
            //console.log("arrayBuf: ", arrayBuf)
        }  

        
        
        var dataview = new DataView(arrayBuf) 
        console.log("dataview: ", dataview)

        fs.open(path + `/${date}`+ '.gtr', "a+", (err, fd) => {
            console.log(err)
            var file = fs.write(fd, typedArray, function(error) {if(error) console.log(error)})
            // var file = fs.writeFile(path + '/file7  .gtr', dataview, "null", function(error) {if(error) throw error})
        })
        
        
        //var file = fs.writeFile(path + '/file5.gtr', dataview, function(error) {if(error) throw error})
        client.end(); // это если все данные или не полные
    }
    
  });

client.write("Start\0\r\n")

var buffull = new events.EventEmitter();

function parse(data){
    const lenghtBuffer = data.length;
    const offset = 2;
    //let index = 0
    let forwader = 0
    let counter = 0
    //здесь я так и не сделал, чёт туплю как сделать
    //надо разделить поток на X Y Z и для каждого из getPar брать чувствительность 
    let sens_X = 1 //чуствительность берётся из getPar (строки 28 - 33) т.е. надо будет её загонять в state
    let sens_Y = 1
    let sens_Z = 1

    var buf_X = new Array(); // наверное надо будет заменять на буфер
    var buf_Y = new Array(); // 
    var buf_Z = new Array(); //

    while(forwader < lenghtBuffer){
        if(counter == 0){
            const meas = data.readUInt16BE(forwader)
            let next_meas = meas * 2500 / 65536
            next_meas = next_meas / 2.72 / sens_X
            //console.log("parsed_X", next_meas)
            buf_X.push(next_meas)
            forwader += offset
            counter++;
        }
        if(counter == 1){
            const meas = data.readUInt16BE(forwader)
            let next_meas = meas * 2500 / 65536
            next_meas = next_meas / 2.72 / sens_Y
            //console.log("parsed_Y", next_meas)
            buf_Y.push(next_meas)
            forwader += offset
            counter++;
        }
        if(counter == 2){
            const meas = data.readUInt16BE(forwader)
            let next_meas = meas * 2500 / 65536
            next_meas = next_meas / 2.72 / sens_Z
            //console.log("parsed_Z", next_meas)
            buf_Z.push(next_meas)
            forwader += offset
            counter = 0;
        }



        //++index;
    }
}

buffull.on("isFull", (data) => {
    var fullBuffer = Buffer.concat(data, 14784)
    //var tmpBuf = new Buffer.alloc(0)
    //var tmpArr = new Array()
    
    byte_array = Buffer.concat(data, forw + 14784)
    forw += 14784
    console.log(byte_array)
    //console.log("full: ", fullBuffer) 
    try{
        parse(fullBuffer)
    }
    catch(err){
        console.log("Error " + err.name + " : " + err.message + "\n" + err.stask)
    }
    

})

client.on("data", (data) => {
    //console.log(data)
        //console.log("size: ", data.length);
        if (!fs.existsSync(path)){
            console.log('The path not exists.');
            fs.mkdirSync(path)
        }
        
        arr.push(data)
        size_ += data.length
        if(size_ >= 14784){
            buffull.emit("isFull", arr);
            buf = Buffer.concat(arr, size_)
            all_bufs.push(buf)
            size_ = 0
            arr = []
            //console.log("arr: ", all_bufs.length)
        }
        if(data.length > max){
            max = data.length
        }
        
        //console.log(all_bufs.length)
        //console.log("iter: ", i);
        //console.log("max: ", max);
});
