# écrit – Writing Without Friction

écrit is a minimal, distraction-free writing app built for people who just want to write. Most note apps become bloated over time and force you to navigate menus and interfaces before you can even start. écrit removes all of that.

**You open it and write instantly. The UI stays invisible until you call it.**

## Features

- **Instant Writing** – No menus, no setup. Just open and write.
- **Keyboard-First** – Everything is controlled via shortcuts.
- **Voice Transcription** – Speak and watch your words appear.
- **Autosave** – Your work is always safe.
- **Minimal UI** – The interface stays out of your way.

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut           | Action                                    |
| ------------------ | ----------------------------------------- |
| `Ctrl + K`         | Open notes search                         |
| `Ctrl + Alt + N`   | Create new note                           |
| `Ctrl + Shift + P` | Open settings                             |
| `Ctrl + Shift + D` | Delete current note (with confirmation)   |
| `Ctrl + Shift + S` | Share current note                        |

### Editor Shortcuts

| Shortcut           | Action                                    |
| ------------------ | ----------------------------------------- |
| `Ctrl + S`         | Save note                                 |
| `Esc` (single)     | Exit note (shows warning if unsaved)      |
| `Esc` (in warning) | Dismiss exit warning                      |
| `Esc` (recording)  | Stop voice recording                      |
| `Esc + Esc`        | Start voice recording (double-tap < 300ms)|

### Text Formatting

The editor supports standard rich text formatting shortcuts:

| Shortcut           | Action                                    |
| ------------------ | ----------------------------------------- |
| `Ctrl + B`         | Bold text                                 |
| `Ctrl + I`         | Italic text                               |
| `Ctrl + U`         | Underline text                            |
| `Ctrl + Shift + X` | Strikethrough text                        |
| `Ctrl + E`         | Inline code                               |
| `Ctrl + Alt + 1-6` | Heading levels 1-6                        |

> **Note:** On macOS, use `⌘` (Cmd) instead of `Ctrl`

Tech Stack

- **Framework** – Next.js 16 with React 19
- **Database** – PostgreSQL with Drizzle ORM
- **Auth** – Better Auth
- **Editor** – Novel (Tiptap-based)
- **Styling** – Tailwind CSS
- **State** – Zustand + TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database
- Docker (optional)

### Installation

1. Fork this repository.

2. Clone the repository:

```bash
git clone https://github.com/yourusername/ecrit.git
cd ecrit
```

3. First time setting up dev env, use the script

- make it executable
  ```bash
  chmod +x scripts/run-dev.sh
  ```
- run the script

  ```bash
  ./scripts/run-dev.sh
  ```

  this will setup the entire dev env for if this is the first time running it locally and from there if it's the second time, you can just run `bun run dev`

Open [http://localhost:3000](http://localhost:3000) to start writing.

### HTTPS Development (for voice recording)

Voice transcription requires HTTPS. Run with:

```bash
bun run dev:https
```

## Project Structure

```
ecrit/
├── app/                 # Next.js app router
│   ├── (app)/          # Authenticated routes
│   ├── (auth)/         # Auth routes
│   └── api/            # API routes
├── components/         # React components
│   ├── editor/         # Novel editor
│   ├── modals/         # Modal dialogs
│   └── ui/             # UI primitives
├── db/                 # Database schema
├── hooks/              # Custom hooks
├── lib/                # Utilities
└── contex/             # React contexts
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT

---

**écrit is writing the way it should be.**
