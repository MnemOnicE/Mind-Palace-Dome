import os
import difflib

# Configuration
INGEST_DIR = "ingest"
SNAPSHOT_FILE = os.path.join(INGEST_DIR, "codebase_snapshot.txt")
DELTA_FILE = os.path.join(INGEST_DIR, "delta_snapshot.txt")
EXCLUDED_DIRS = {'.git', 'node_modules', '__pycache__', 'dist', 'build', 'ingest', '.github'}
EXCLUDED_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.ico', '.pyc', '.DS_Store', '.woff', '.woff2', '.ttf', '.eot'}

def is_text_file(filepath):
    """Simple check to avoid reading binary files based on extension."""
    _, ext = os.path.splitext(filepath)
    if ext.lower() in EXCLUDED_EXTENSIONS:
        return False
    # Additional check: try reading a small chunk
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            f.read(1024)
        return True
    except UnicodeDecodeError:
        return False

def generate_codebase_string(root_dir):
    """Walks the directory and generates the snapshot string."""
    codebase_content = []

    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip ignored directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]

        # Sort for deterministic output
        dirs.sort()
        files.sort()

        for file in files:
            filepath = os.path.join(root, file)
            # Skip excluded files
            if any(filepath.endswith(ext) for ext in EXCLUDED_EXTENSIONS):
                continue

            # Skip the script itself if it's in the list (optional, but good practice)
            if filepath.endswith("generate_ingest.py"):
                 pass # We include it usually, unless specified otherwise.

            if is_text_file(filepath):
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()

                    codebase_content.append("=" * 64)
                    codebase_content.append(f"File: {filepath}")
                    codebase_content.append("=" * 64)
                    codebase_content.append(content)
                    codebase_content.append("\n") # Add newline between files
                except Exception as e:
                    print(f"Skipping file {filepath} due to error: {e}")

    return "\n".join(codebase_content)

def main():
    # Ensure ingest directory exists
    if not os.path.exists(INGEST_DIR):
        os.makedirs(INGEST_DIR)
        print(f"Created directory: {INGEST_DIR}")

    # Generate current state
    current_state = generate_codebase_string(".")

    # Read previous state if exists
    previous_state = ""
    if os.path.exists(SNAPSHOT_FILE):
        try:
            with open(SNAPSHOT_FILE, 'r', encoding='utf-8') as f:
                previous_state = f.read()
        except Exception as e:
            print(f"Could not read previous snapshot: {e}")

    # Calculate Diff
    if previous_state:
        print("Calculating diff...")
        diff = difflib.unified_diff(
            previous_state.splitlines(),
            current_state.splitlines(),
            fromfile='Previous Snapshot',
            tofile='Current Snapshot',
            lineterm=''
        )
        delta_content = "\n".join(diff)
        if not delta_content:
            delta_content = "No changes detected."
    else:
        delta_content = "Initial Snapshot - No previous state to diff against."

    # Write Snapshot
    print(f"Writing snapshot to {SNAPSHOT_FILE}...")
    with open(SNAPSHOT_FILE, 'w', encoding='utf-8') as f:
        f.write(current_state)

    # Write Delta
    print(f"Writing delta to {DELTA_FILE}...")
    with open(DELTA_FILE, 'w', encoding='utf-8') as f:
        f.write(delta_content)

    print("Ingest generation complete.")

if __name__ == "__main__":
    main()
