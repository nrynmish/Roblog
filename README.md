# Roblog

Roblog is a full-stack AI application that converts a keyword into a fully SEO-optimized blog post. It uses a local LLM (TinyLlama/Mistral) for content generation, calculates SEO metrics, stores results in MongoDB Atlas, and exposes a clean REST API for frontend consumption.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Python FastAPI |
| AI Model | TinyLlama 1.1B / Mistral 7B (HuggingFace Transformers) |
| Database | MongoDB Atlas |
| Deployment | Docker |

---

## How It Works

```
User enters keyword
      ↓
Prompt is built for the LLM
      ↓
LLM generates blog content
      ↓
Text is parsed into structured fields
      ↓
SEO metrics are calculated
      ↓
Blog is stored in MongoDB
      ↓
JSON response returned to frontend
```

---

## Project Structure

```
Roblog/
├── requirements.txt             # Python dependencies
├── docker-compose.yml           # Spins up frontend + backend together
├── .gitignore
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── Dockerfile
│   ├── .env.example
│   ├── config/
│   │   └── settings.py          # App configuration
│   ├── routers/
│   │   └── blog.py              # API endpoints
│   ├── services/
│   │   ├── model_service.py     # LLM loading and inference
│   │   ├── seo_service.py       # SEO metrics calculation
│   │   └── blog_service.py      # Pipeline orchestrator
│   ├── database/
│   │   └── mongo.py             # MongoDB connection and CRUD
│   ├── models/
│   │   └── blog_model.py        # MongoDB document schema
│   ├── schemas/
│   │   └── blog_schema.py       # Pydantic request/response models
│   └── utils/
│       ├── prompt_builder.py    # LLM prompt templates
│       └── text_parser.py       # Parse raw LLM output
└── frontend/
    ├── Dockerfile
    ├── next.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    ├── package.json
    ├── .env.local.example
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx         # Main dashboard page
        │   └── globals.css
        ├── components/
        │   ├── dashboard/
        │   │   ├── BlogCard.tsx         # Blog list item
        │   │   ├── BlogDetail.tsx       # Slide-in detail panel
        │   │   ├── GeneratePanel.tsx    # Keyword input + generate
        │   │   ├── MetricsSummary.tsx   # Aggregate stats tiles
        │   │   └── SeoChart.tsx         # Score history bar chart
        │   └── ui/
        │       ├── ScoreRing.tsx        # Animated SVG score ring
        │       └── StatBar.tsx          # Metric progress bar
        ├── hooks/
        │   └── useBlogs.ts      # useBlogs and useGenerate hooks
        └── lib/
            └── api.ts           # Typed API client
```

---

## Running with Docker (recommended)

### 1. Clone the repository
```bash
git clone https://github.com/nrynmish/Roblog.git
cd Roblog
```

### 2. Set up environment variables
```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Fill in your values:
```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=SEO
MONGO_DB_NAME=seo_blog_db
MODEL_NAME=TinyLlama/TinyLlama-1.1B-Chat-v1.0
MAX_NEW_TOKENS=500
TEMPERATURE=0.7
TOP_P=0.9
DEVICE=cpu
APP_ENV=development
DEBUG=True
```

### 3. Set up MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free account
2. Create a free M0 cluster
3. Go to **Database Access** and create a user with read/write permissions
4. Go to **Network Access** and add `0.0.0.0/0` to allow all IPs
5. Click **Connect** on your cluster and copy the connection string into your `.env`

### 4. Build and run
```bash
docker compose up --build
```

Then open:
- Frontend: `http://localhost:3000`
- Backend API docs: `http://localhost:8000/docs`

The first run will download the model automatically (~2GB for TinyLlama). Subsequent runs are fast thanks to the cached Docker volume.

---

## Running Locally (without Docker)

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas account (free tier works)
- HuggingFace account (free)
- 8GB+ RAM recommended

### Backend
```bash
# From project root
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Set up env
cp backend/.env.example backend/.env
nano backend/.env

# Run
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### HuggingFace login (first time only)
```bash
pip install huggingface_hub
huggingface-cli login
```

Paste your token from [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### Frontend
```bash
# In a new terminal, from project root
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Then open `http://localhost:3000`.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | App health check |
| GET | `/api/v1/health/model` | Model and DB status |
| POST | `/api/v1/generate-blog` | Generate a blog from keyword |
| GET | `/api/v1/blogs` | Get all generated blogs |
| GET | `/api/v1/blogs/{id}` | Get one blog by ID |
| DELETE | `/api/v1/blogs/{id}` | Delete a blog |

### Generate Blog — Example Request
```bash
curl -X POST http://localhost:8000/api/v1/generate-blog \
  -H "Content-Type: application/json" \
  -d '{"keyword": "AI marketing"}'
```

### Generate Blog — Example Response
```json
{
  "id": "69c5c1a5ce3b145658935f62",
  "keyword": "ai marketing",
  "title": "The Complete Guide to AI Marketing",
  "content": "...",
  "seo_score": 72,
  "readability_score": 61.4,
  "keyword_density": 2.09,
  "word_count": 1243,
  "heading_structure": {
    "h1": 1,
    "h2": 6,
    "h3": 3,
    "has_proper_structure": true
  },
  "status": "generated",
  "created_at": "2026-03-27T23:30:45.159390+00:00"
}
```

---

## SEO Metrics Explained

| Metric | Ideal Range | Description |
|---|---|---|
| `seo_score` | 70-100 | Overall score out of 100 |
| `keyword_density` | 1.0% - 2.5% | How often keyword appears |
| `readability_score` | 60-80 | Flesch Reading Ease score |
| `word_count` | 1200+ | Total word count |
| `heading_structure` | h1≥1, h2≥2, h3≥1 | Markdown heading breakdown |

---

## Model Options

| Model | Size | RAM Required | Quality | Best For |
|---|---|---|---|---|
| TinyLlama 1.1B | 2GB | 4GB | Good | Development and demos |
| Mistral 7B GGUF (4-bit) | 4GB | 6GB | Excellent | Production demos |
| Mistral 7B Full | 14GB | 28GB | Best | GPU machines only |

To switch models, update `MODEL_NAME` in your `backend/.env` file.

---

## Troubleshooting

**MongoDB SSL error:**
Go to MongoDB Atlas → Network Access → Add `0.0.0.0/0`

**CUDA out of memory:**
Set `DEVICE=cpu` in your `.env` file, or run with:
```bash
CUDA_VISIBLE_DEVICES="" uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Model returns empty output:**
The prompt format differs between models. TinyLlama uses chat format, Mistral uses `[INST]` format. Both are handled automatically in `prompt_builder.py`.

**Docker build fails on `networkx`:**
Ensure the backend Dockerfile uses `python:3.11-slim` or later — `networkx==3.6.1` requires Python 3.11+.

---

## Team

Built for a hackathon by team Roblog.

---

## License

MIT