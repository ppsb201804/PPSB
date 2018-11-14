var sizeof = require('object-sizeof');
var bloomfilter = require('bloomfilter').BloomFilter;
 
// convenient method to initialize the filter 
var numberofElements = 5e4;

var falsepositiverate = 0.001;
// optimal parameters -> cuckoo filter paper
var numberofBits = Math.round(1.44*Math.log2(1/falsepositiverate*numberofElements));     
var numberofHashfunc = Math.round(Math.log2(1/falsepositiverate));

var arr = [];
for (var i = 0; i< numberofElements; ++i) {
    var tmp = Math.floor(Math.random() * 0xffffffff);
    arr.push(tmp);
}

var v8memoryUsage = process.memoryUsage().heapUsed;
var bloom = new bloomfilter(numberofBits, numberofHashfunc);
for (var i = 0; i< numberofElements; ++i) {
    // var tmp = Math.floor(Math.random() * 0xffffffff);
    bloom.add(arr[i]);
    //tmp = null;
}
var memoryForObjects = (process.memoryUsage().heapUsed - v8memoryUsage)/1024/1024;
console.log(memoryForObjects);
//console.log(sizeof(bloom)/1024/1024+'MB');

var alldata = [];
for (var i = 0; i<numberofElements; i++){
    alldata.push((0xffffffff/numberofElements)*i+1);
}

for (var z = 0; z<5;z++){
    console.time("");
    for (var i=numberofElements/5*z;i<numberofElements/5+numberofElements/5*z;i++){      
        bloom.test(alldata[i]);
    }
    console.timeEnd("");
}
 
//console.log(Math.pow(1-Math.exp(-numberofHashfunc*numberofElements/numberofBits), numberofHashfunc));

// var BloomFilter = require('bloom-filter');
 
// // convenient method to initialize the filter 
// var numberofElements = 5e4;
// var falsePositiveRate = 0.005;

// var arr = [];
// for (var i = 0; i< numberofElements; ++i) {
//     var tmp = Math.floor(Math.random() * 0xffffffff);
//     arr.push(tmp);
// }

// var v8memoryUsage = process.memoryUsage().heapUsed;
// var bloom = BloomFilter.create(numberofElements, falsePositiveRate);
// for (var i = 0; i< numberofElements; ++i) {
//     // var tmp = Math.floor(Math.random() * 0xffffffff);
//     bloom.insert(arr[i]);
//     //tmp = null;
// }
// var memoryForObjects = (process.memoryUsage().heapUsed - v8memoryUsage)/1024/1024;
// console.log(memoryForObjects);
// //console.log(sizeof(bloom)/1024/1024+'MB');

// var alldata = [];
// for (var i = 0; i<numberofElements; i++){
//     alldata.push((0xffffffff/numberofElements)*i+1);
// }

// for (var z = 0; z<5;z++){
//     console.time("");
//     for (var i=numberofElements/5*z;i<numberofElements/5+numberofElements/5*z;i++){      
//         bloom.contains(alldata[i]);
//     }
//     console.timeEnd("");
// }