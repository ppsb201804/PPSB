var process = require('./processingURL.js');

console.log(process.getCanonicalizedURL("content.yudu.com/Library/A1e6j2/RoyalAugustSeptember/resources/index.htm?referrerUrl=http://www.yudu.com/item/details/76249/Royal-August---September-2009--Issue-15-"));

console.log(process.getCanonicalizedURL("162.127.32.6/%7Emadison/girlstracksite.html"));
console.log(process.getCanonicalizedURL("162.127.32.6:8080/~madison"));

console.log(process.getCanonicalizedURL("https://comunicaprime.com.br/wp-login.php?redirect_to=https://comunicaprime.com.br:8080/wp-includes/js/a"));
console.log(process.getCanonicalizedURL("https://comunicaprime.com.br/wp-login.php?redirect_to=https%3A%2F%2Fcomunicaprime.com.br%3A8080%2Fwp-includes%2Fjs%2Fa"));
console.log(process.getLookupExpressions(process.getCanonicalizedURL("https://comunicaprime.com.br/wp-login.php?redirect_to=https%3A%2F%2Fcomunicaprime.com.br%3A8080%2Fwp-includes%2Fjs%2Fa")));

console.log(process.getCanonicalizedURL("de.wikipedia.org/wiki/Portal:Fechten"));
console.log(process.getCanonicalizedURL("de.wikipedia.org/wiki/Portal%3AFechten"));

console.log(process.getCanonicalizedURL("https://de.wikipedia.org/wiki/Portal%3AFechten"));
console.log(process.getLookupExpressions(process.getCanonicalizedURL("de.wikipedia.org/wiki/Portal%3AFechten")));

