#!/bin/bash

echo "===== Testing parsechatter.js ====="
echo "Running basic tests..."
node --experimental-modules test-parser.js

echo -e "\n\n===== Comparing parsers ====="
echo "Running comparison between parsers..."
node --experimental-modules compare-parsers.js

echo -e "\nTests completed!"
