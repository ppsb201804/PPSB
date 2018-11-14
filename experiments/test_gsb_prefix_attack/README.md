# gsb-attack-demo

This simple application is to demonstrate that the 32-bit hash prefix (short hash) might suffice for URL tracking.

## How to run this?

```
$ go build
$ ./gsb-attack-demo
```

You can provide two arguments, `-p` that indicates your own url list, and `-n=1000` that limits the number of urls to be loaded, e.g.,

```
$ ./gsb-attack-demo -p=your_url_list.txt -n=1000
```

By default, the **urlList.txt** (that has six dummy urls) will be loaded, and the limited number will be the MAX of `uint` in Go. Here, we also provide a much larger dataset **shallalist.txt** (with 1785496 records) that combines all urls and domains from the [shallalist](http://www.shallalist.de/). And the result is as follows: (*you can test if a given url has matches in the inverted index*)

```
$ ./gsb-attack-demo -p=shallalist.txt
>>> Reading URL list shallalist.txt ...

    1785496 URLs are loaded!

>>> Computing unique URL patterns (decompositions) ...

    2048097 unique URL patterns are obtained!

>>> Building inverted index (key: hash prefix, value: decomposited URLs that share the hash prefix) ...

    9 % done ...
    19 % done ...
    29 % done ...
    39 % done ...
    49 % done ...
    59 % done ...
    69 % done ...
    79 % done ...
    89 % done ...
    99 % done ...
    100 % done

>>> Analyzing prefix index ...

    Done! key - #matches, value - #prefixs
    map[1:2047019 2:539]

>>> Testing collisions by a given URL ...

Please input a URL: (q - quit)
biglnk.com

Re-identified URLs:
    biglnk.com/

Please input a URL: (q - quit)
a.b.c

Re-identified URLs:
    No collision found!

Please input a URL: (q - quit)
q
Bye!
```

Note: **urls.go**, **urls_test.go**, **hash.go** are extracted from the [Google SafeBrowsing](https://github.com/google/safebrowsing) project on GitHub.

## Background:

Our implementation is insipred by the following two papers:

   1. T. Gerbet, A. Kumar, and C. Lauradoux, "A privacy analysis of google and yandex safe browsing," in *Proc. of IEEE/IFIP DSN*, pp. 347– 358, 2016.
   
   2. L. Demir, A. Kumar, M. Cunche, and C. Lauradoux, "The pitfalls of hashing for privacy," *IEEE Communications Surveys Tutorials*, vol. 20, no. 1, pp. 551–565, 2018.

They indicated that the underlying anonymization technique of hashing and truncation fails when the server receives multiple prefixes for a URL. 

For instance, given a particular URL (e.g., relating to some political news), the SB service provider could insert the hash prefixes of its (all) decompositions into the local filter. 

Later, once a user accesses the same URL (or the similar ones that share some decompositions, including the same domain), the matched prefixes would be sent to the remote server. 

And this kind of multiple prefix matching can **reduce the uncertainty** of URL re-identification (or inference), due to the fact that the total number of URLs (and domains) on the Internet is **finite** and even sub-domain information might suffice for user tracking.
