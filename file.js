var date = new Date()
date = `${date}`.replace('GMT+0300 (Москва, стандартное время)', '').split(' ').join('-').slice(0, -1)
//console.log(`${date}`.replace('GMT+0300 (Москва, стандартное время)', '').split(' ').join('-'))
console.log(date + '.gtr')