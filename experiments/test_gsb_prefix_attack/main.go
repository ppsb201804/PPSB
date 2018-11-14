package main

import (
	"bufio"
	"flag"
	"fmt"
	"io"
	"log"
	"os"
)

// This function is used for reading original URLs from a text file.
func readURLFromFile(filePath string, numOfURLs uint) ([]string, error) {

	fmt.Printf(">>> Reading URL list %s ...\n\n", filePath)

	oriURLs := []string{}

	fi, err := os.Open(filePath)

	if err != nil {

		fmt.Printf("Error: %s\n", err)
		return nil, err
	}
	defer fi.Close()

	br := bufio.NewReader(fi)

	var i uint
	for i = 0; ; i++ {

		a, _, c := br.ReadLine()
		if c == io.EOF || i == numOfURLs {

			break
		}

		if string(a) == "" {

			continue
		}

		oriURLs = append(oriURLs, string(a))
	}

	fmt.Printf("    %d URLs are loaded!\n\n", len(oriURLs))

	return oriURLs, nil
}

// This function is used for pre-processing the list of "malicious" URLs, i.e.,
// obtaining URL patterns (decompositions).
func getAllUniquePatterns(oriURLs []string) []string {

	fmt.Printf(">>> Computing unique URL patterns (decompositions) ...\n\n")

	uniquePatterns := []string{}

	tempMap := make(map[string]int)

	for i := 0; i < len(oriURLs); i++ {

		curOriURL := oriURLs[i]

		patterns, err := generatePatterns(curOriURL)

		// simply skip a url that cannot obtain valid patterns via GSB api
		if err != nil {
			continue
		}

		for _, p := range patterns {
			tempMap[p] = 1
		}
	}

	for k := range tempMap {
		uniquePatterns = append(uniquePatterns, k)
	}

	fmt.Printf("    %d unique URL patterns are obtained!\n\n", len(uniquePatterns))

	return uniquePatterns
}

// This function is used for computing SHA-256 hashs, extracting 32-bit hash
// prefixs (short hash), and finally inserting them into an Inverted Index
// (key: hash prefix, value: decomposited URLs that share the hash prefix).
func buildShortHashIndex(uniquePatterns []string) map[string][]string {

	fmt.Printf(">>> Building inverted index (key: hash prefix, value: decomposited URLs that share the hash prefix) ...\n\n")

	shortHashIndex := make(map[string][]string)

	numOfUniquePatterns := len(uniquePatterns)

	for ctr, up := range uniquePatterns {

		hash := hashFromPattern(up)

		sh := fmt.Sprintf("%x", ([]byte(hash))[0:4])
		//fmt.Printf("256-bit hash:  %x\n32-bit prefix: %s, value: %s\n", hash, sh, up)

		urls, ok := shortHashIndex[sh]
		if ok {

			urls = append(urls, up)
			shortHashIndex[sh] = urls
		} else {

			shortHashIndex[sh] = []string{up}
		}

		if ctr != 0 && ctr%(numOfUniquePatterns/10) == 0 {

			fmt.Printf("    %d %% done ...\n", ctr*100/numOfUniquePatterns)
		}
	}

	fmt.Printf("    100 %% done \n\n")

	return shortHashIndex
}

func testCollisionByURL(index map[string][]string) {

	var qURL string

	fmt.Printf(">>> Testing collisions by a given URL ...\n")

	for {
		fmt.Println("\nPlease input a URL: (q - quit)")

		fmt.Scanln(&qURL)

		if qURL == "q" || qURL == "quit" {

			fmt.Println("Bye!")
			break
		}

		fmt.Println("\nRe-identified URLs:")

		hashes, err := generateHashes(qURL)
		if err != nil {

			log.Fatal("Come with fatal,exit with 1 \n")
		}

		hasCollision := false

		for k := range hashes {

			sh := fmt.Sprintf("%x", ([]byte(k))[0:4])

			// output the matched URLs (decompositions)
			urls, ok := index[sh]
			if ok {

				hasCollision = true
				for _, url := range urls {
					fmt.Println("   ", url)
				}
			}
		}

		if !hasCollision {
			fmt.Print("    No collision found!\n")
		}
	}
}

func analyzeShortHashIndex(index map[string][]string) {

	fmt.Printf(">>> Analyzing prefix index ...\n")

	numOfMatchesMap := make(map[int]int)

	for k := range index {

		numOfMatches := len(index[k])

		ctr, ok := numOfMatchesMap[numOfMatches]
		if ok {
			ctr++
			numOfMatchesMap[numOfMatches] = ctr
		} else {

			numOfMatchesMap[numOfMatches] = 1
		}
	}

	fmt.Println("\n    Done! key - #matches, value - #prefixs")
	fmt.Println("   ", numOfMatchesMap)
	fmt.Println()
}

// Main function
func main() {

	const UintMax = ^uint(0)

	filePath := flag.String("p", "urlList.txt", "input file path")
	numOfURLs := flag.Uint("n", UintMax, "number of URLs")

	flag.Parse()

	oriURLs, err := readURLFromFile(*filePath, *numOfURLs)

	if err != nil {

		fmt.Printf("Error: %s\n", err)
		return
	}

	uniquePatterns := getAllUniquePatterns(oriURLs)

	shortHashIndex := buildShortHashIndex(uniquePatterns)

	analyzeShortHashIndex(shortHashIndex)

	testCollisionByURL(shortHashIndex)
}
