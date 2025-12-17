# Mind-Palace-Dome

# dome-icile 🧠🏰

**"Your Head is a Dome. Make it a Home."**

dome-icile is a web-based Mind Palace construction kit. It digitizes the Method of Loci, allowing users to design, populate, and navigate spatial memory systems. Inspired by the techniques of competitive memory champions, dome-icile helps you commit information to memory through spatial association, absurd visualization, and ritualized navigation.

## 🌟 Features

* **Architect Mode:** Design blueprints of your mind palace. Choose from pre-made templates (e.g., "Stormy Castle", " childhood home") or build from scratch.
* **The Foundry (AI Image Gen):** Integration with Gemini (Nano Banana via API) to generate "sticky" memory images. Includes a hidden prompt engineer that forces the AI to create absurd, vivid, and memorable visualizations based on user input.
* **Event Horizon:** Script "Events" into your rooms. Triggers audio descriptions, guided meditations, or specific scenarios when you enter a zone to reinforce retention.
* **Whisper Integration:** Upload or record voice notes describing your rooms; OpenAI's Whisper transcribes them to auto-populate room descriptions or create guided audio walkthroughs.
* **Ritual Mode:** A focused "Room View" for daily meditation and memory reinforcement walks.

## 🚀 Getting Started

### Prerequisites
* A modern web browser.
* An API Key for Google Gemini (for image generation).
* (Optional) OpenAI API Key for Whisper integration.

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/yourusername/dome-icile.git](https://github.com/yourusername/dome-icile.git)
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

## 🧠 How It Works

1.  **The Palace:** You define a "Room" (e.g., The Foyer).
2.  **The Loci:** You define specific spots (e.g., The Coat Rack).
3.  **The Encode:** You input a concept (e.g., "The periodic table").
4.  **The Image:** Our Prompt Engine refines your concept into something absurd (e.g., "A neon-glowing table made of periodic elements dancing the cha-cha").
5.  **The Placement:** You save this image to The Coat Rack.

## 🤝 Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🛡️ Security
See [SECURITY.md](SECURITY.md) for our security policy.

## 📜 License
MIT
