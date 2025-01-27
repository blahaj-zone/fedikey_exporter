#!/bin/bash

fetch_api() {
    curl "https://$1/api.json" | yq -oy -P > "$2.yaml"
}

fetch_api blahaj.zone sharkey
fetch_api misskey.io misskey
fetch_api miruku.cafe firefish
fetch_api moppels.bar calckey
