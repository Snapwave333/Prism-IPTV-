# User Manual: Interacting with Lumen

Lumen is more than a voice assistant; she is your companion for the ultimate viewing experience.

## 1. Getting Started

To begin, ensure your GPU is initialized and Ollama is running Llama3. Simply speak or type to Lumen through the chat interface.

## 2. Special Protocols

### 2.1 Hush Mode (Roommate Protocol)

- **Command**: "Shut up," "Be quiet," "Hush," or "Stop talking."
- **Effect**: Lumen immediately ducks volume, stops all current audio, and enters a silent listening state.

### 2.2 Spoiler Guard

Lumen automatically monitors EPG metadata. If she detects you are catching up on a show, she will:

- Blur thumbnails for future episodes.
- Avoid mentioning plot points in recommendations.
- Warn you if live subtitles contain high-impact spoilers.

### 2.3 Sports Shortcut

Track your favorite teams in real-time.

- **Example**: "What's the score of the Dortmund game?"
- **Effect**: Lumen polls the Sports API and keeps a live ticker in your session context.

## 3. UI Chameleon (Themes)

Change the entire look of the app with a single sentence.

- **Example**: "Make it look like a retro arcade."
- **Effect**: The Design Crew generates a new palette and background, applying it instantly.

## 4. Troubleshooting

| Issue | Resolution |
| :--- | :--- |
| **Lumen isn't speaking** | Check if "Hush Mode" is active or if GPU memory is full. |
| **Slow responses** | Ensure no other VRAM-heavy apps are running. |
| **Wrong Sports Score** | Verify the team name is spelled correctly. |
| **Permission Denied** | Lumen requires confirmation for destructive actions (e.g., deleting a playlist). |
