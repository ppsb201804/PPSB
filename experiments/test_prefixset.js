var indexs;
var deltas;

function buildPrefixSet(sorted_prefixes){
    // kmaxrun is used for reserve default space for index array
    kmaxrun = 100;
    if(sorted_prefixes.length){
        var min_runs = sorted_prefixes.length/kmaxrun;
        indexs = [];
        //deltas = new Uint16Array();
        deltas = [];

        // lead with the first prefix
        var prev_prefix = sorted_prefixes[0];
        var run_length = 0;
        indexs.push([prev_prefix, deltas.length]);

        for (var i = 1; i < sorted_prefixes.length; i++){
            if (sorted_prefixes[i] == prev_prefix)
                continue;
            
            var del = sorted_prefixes[i]-prev_prefix;

            // if delta does not fit 16-bit or if too many consecutive deltas have been encoded
            if (del > 65535 || run_length > kmaxrun){
                indexs.push([sorted_prefixes[i], deltas.length]);
                run_length = 0;
            }
            else {
                deltas.push(del);
                run_length++;
            }

            prev_prefix = sorted_prefixes[i];
        }
    }
}

function existPrefix(prefix){
    if (indexs.length == 0)
        return false;
    
    // find the first position after |prefix| in indexs
    var idx = indexs.findIndex(function(pair){
        return pair[0] > prefix;
    });

    // |prefix| comes before anything that is in the set
    if (idx == 0)
        return false;
        
    var bound = (idx == -1) ? deltas.length : indexs[idx][1];

    // back to the entry our target is in
    idx = (idx == -1) ? indexs.length-1 : idx-1;

    // all prefixes in |index_| are in the set
    var current = indexs[idx][0];
    if (current == prefix)
        return true;
    
    // scan forward accumulating deltas while a match is possible
    for (var d = indexs[idx][1]; d < bound && current < prefix; d++){
        current += deltas[d];
    }

    return current == prefix;
}

// buildPrefixSet([20, 25, 41, 65432, 150000, 160000]);
// console.log(existPrefix(15));
// console.log(existPrefix(20)); //
// console.log(existPrefix(22));
// console.log(existPrefix(25)); //
// console.log(existPrefix(27));
// console.log(existPrefix(41)); //
// console.log(existPrefix(55));
// console.log(existPrefix(65431));
// console.log(existPrefix(65432)); //
// console.log(existPrefix(140000));
// console.log(existPrefix(150000));
// console.log(existPrefix(155000)); //
// console.log(existPrefix(160000)); //
// console.log(existPrefix(170000));
// console.log(existPrefix(1600000));

numberofElements = 5e4;

var raw = [];
for (var i = 0; i< numberofElements; ++i) {
    var prefix = Math.floor(Math.random() * 0xffffffff);
    raw.push(prefix);
}

raw.sort(function(a, b){return a-b;});

var v8memoryUsage = process.memoryUsage().heapUsed;
buildPrefixSet(raw);
var memoryForObjects = (process.memoryUsage().heapUsed - v8memoryUsage)/1024/1024;
console.log(memoryForObjects);

var alldata = [];
for (var i = 0; i<numberofElements; i++){
    alldata.push((0xffffffff/numberofElements)*i+1);
}

for (var z = 0; z<5;z++){
    console.time("");
    for (var i=numberofElements/5*z;i<numberofElements/5+numberofElements/5*z;i++){      
        existPrefix(alldata[i]);
    }
    console.timeEnd("");
}

var memorysupposed = (indexs.length*2*8+deltas.length*2)/1024/1024;
console.log("prefixset: "+memorysupposed.toFixed(2)+"MB");
console.log("raw: "+(numberofElements*4/1024/1024).toFixed(2)+"MB");