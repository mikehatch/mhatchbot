var moment = require('moment');

console.log(moment.now());
console.log(moment.unix(1478358000).toDate());
moment().utcOffset("-08:00");
console.log(moment.now());
console.log(moment.unix(1478358000).toDate());