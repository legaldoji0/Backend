#!/bin/bash

file_url="https://raw.githubusercontent.com/servedbyskull/scripts/main/src/git.src.sh"
store="$HOME/.sbs"
lu="$store/lu"

if [ ! -d "$store" ]; then
    mkdir "$store"
fi

if [ ! -f "$lu" ]; then
    touch "$lu"
    echo 0 >"$lu"
fi

if [ "$1" = "-u" ] || [ "$(($(date +%s) - $(cat "$lu")))" -gt 86400 ]; then
    echo "" && echo -e "\e[32mUpdating file...\e[0m" && echo ""
    curl -s "$file_url" >"$store/$(basename "$file_url")"
    echo "$(date +%s)" >"$lu"
fi

bash "$store/$(basename "$file_url")" "$@"
