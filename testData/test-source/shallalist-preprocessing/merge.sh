cd ~/Downloads/BL && find . -type f -name "domains" -exec cat {} \; | grep -v -e '^$' | cat > alldomains.txt
cd ~/Downloads/BL && find . -type f -name "urls" -exec cat {} \; | grep -v -e '^$' |cat > allurls.txt

