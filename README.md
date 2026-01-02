# Mind-Palace-Dome

# dome-icile 🧠🏰

**"Your Head is a Dome. Make it a Home."**

dome-icile is a web-based Mind Palace construction kit. It digitizes the Method of Loci, allowing users to design, populate, and navigate spatial memory systems. Inspired by the techniques of competitive memory champions, dome-icile helps you commit information to memory through spatial association, absurd visualization, and ritualized navigation.

## 📚 Documentation

For developers (and curious users), we have extensive documentation in the `dev/` directory:

*   **[System Architecture](dev/architecture/system_overview.md):** High-level diagrams and component breakdowns.
*   **[Getting Started Guide](dev/guides/getting_started.md):** Setup instructions and "How to Add a Feature".
*   **[SRS Logic Deep Dive](dev/guides/srs_logic.md):** The math behind the Spaced Repetition algorithms.
*   **[Gatekeeper Logic](dev/guides/gatekeeper_logic.md):** How the quizzes and fuzzy matching work.
*   **[Agents Protocol](dev/guides/agents_protocol.md):** The persona-based development workflow.

## 🌟 Features

*   **Architect Mode:** Design blueprints of your mind palace. Create rooms and organize your loci.
*   **The Foundry (AI Image Gen):** Integration with Google Gemini to generate "sticky" memory images. Includes a prompt engine (`src/prompt_engine.js`) that forces absurd visualizations.
*   **Gatekeeper (Quizzes):** A robust active recall system with three modes:
    *   *Input:* Type the answer (Fuzzy matching enabled).
    *   *Choice:* Multiple choice.
    *   *Dynamic:* Scales difficulty based on your streak.
*   **Ritual Mode:** A focused "Room View" for daily meditation and spaced repetition reviews.
*   **Whisper Integration (Planned/Experimental):** The codebase contains placeholders for OpenAI Whisper (Speech-to-Text), but it is not yet fully implemented.

## 🚀 Getting Started

### Prerequisites
*   A modern web browser.
*   An API Key for Google Gemini (Optional, for image generation).
*   Python 3 (for local serving).

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/dome-icile.git
    cd dome-icile
    ```
2.  Set up your environment:
    ```bash
    cp .env.example .env
    # Edit .env with your API keys
    ```
3.  Launch the application:
    ```bash
    ./startup.sh
    ```
    *Note: This script simply runs `python3 -m http.server`.*

## 🧠 How It Works

1.  **The Palace:** You define a "Room" (e.g., The Foyer).
2.  **The Loci:** You define specific spots (e.g., The Coat Rack).
3.  **The Encode:** You input a concept (e.g., "The periodic table").
4.  **The Image:** Our Prompt Engine refines your concept into something absurd (e.g., "A neon-glowing table made of periodic elements dancing the cha-cha").
5.  **The Placement:** You save this image to The Coat Rack.
6.  **The Review:** The **SRS Engine** schedules reviews to ensure long-term retention.

## 🤝 Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🛡️ Security
See [SECURITY.md](SECURITY.md) for our security policy.

## 📜 License
MIT
