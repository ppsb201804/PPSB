var sizeof = require('object-sizeof');

var numberofElements = 5e4;

// var v8memoryUsage = process.memoryUsage().rss;
// var aBuffer = new ArrayBuffer( 4*numberofElements ); 
// var dataView = new DataView( aBuffer );  
// for (i = 0; i< numberofElements; ++i) {
//     //prefix = Math.random() * 0xffffffff;
//     dataView.setUint32(4*i,Math.random() * 0xffffffff);
// }
// console.log((process.memoryUsage().rss - v8memoryUsage)/1024/1024);
// console.log(dataView.getUint32(1));

// var tmp = new Uint32Array(numberofElements);
// var prefix;
// var i;
// var v8memoryUsage = process.memoryUsage().rss;
// for (i = 0; i< numberofElements; ++i) {
//     //prefix = Math.random() * 0xffffffff;
//     tmp[i] = Math.random() * 0xffffffff;
// }
// console.log((process.memoryUsage().rss - v8memoryUsage)/1024/1024);

//gc();
var arr = [];
for (var i = 0; i< numberofElements; ++i) {
    var tmp = Math.floor(Math.random() * 0xffffffff);
    arr.push(tmp);
}

var v8memoryUsage = process.memoryUsage().heapUsed;
var set = new Set();
//var prefix;
for (var i = 0; i< numberofElements; ++i) {
    // prefix = dataView.getUint32(4*i);
    // prefix = Math.random() * 0xffffffff;
    // if(i==0)
    //      console.log(Math.floor(Math.random() * 0xffffffff));
    // var tmp = Math.floor(Math.random() * 0xffffffff);
    set.add(arr[i]);
    tmp = null;
}
// var iterator1 = set.values();

// console.log(iterator1.next().value);
var memoryForObjects = (process.memoryUsage().heapUsed - v8memoryUsage)/1024/1024;
console.log(memoryForObjects);

var alldata = [];
for (var i = 0; i<numberofElements; i++){
    alldata.push((0xffffffff/numberofElements)*i+1);
}

for (var z = 0; z<5;z++){
    console.time("");
    for (var i=numberofElements/5*z;i<numberofElements/5+numberofElements/5*z;i++){      
        set.has(alldata[i]);
    }
    console.timeEnd("");
}
