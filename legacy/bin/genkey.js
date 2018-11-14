const NodeRSA = require('node-rsa');

var key = new NodeRSA({ b: 1024 });

console.log('N: ' + key.keyPair.n.toString());
console.log('E: ' + key.keyPair.e.toString());
console.log('D: ' + key.keyPair.d.toString());