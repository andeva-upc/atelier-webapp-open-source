#!/bin/bash
cd "$(dirname "$0")"
npx json-server --watch db.json --port 3000
