#!/bin/bash

echo "🏰 Welcome to dome-icile..."
echo "🧠 Initializing Mind Palace protocols..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Please copy .env.example to .env and add your keys."
fi

# In a real scenario, this would start a local server (e.g., python -m http.server or npm start)
# For this structure, we'll just open the index.html
echo "🚀 Opening the gate..."

# Open based on OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open index.html
elif [[ "$OSTYPE" == "darwin"* ]]; then
    open index.html
elif [[ "$OSTYPE" == "cygwin" ]]; then
    start index.html
elif [[ "$OSTYPE" == "msys" ]]; then
    start index.html
else
    echo "Could not detect OS to open browser automatically. Please open index.html manually."
fi
