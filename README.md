<div align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&weight=600&size=40&pause=1000&color=007BFF&center=true&vCenter=true&width=600&lines=🚀+CodeQuantum;Your+AI+Coding+Assistant;Powered+by+Llama+3" alt="Typing SVG" />
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_OAuth-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</div>

<br>

CodeQuantum is a production-grade, full-stack AI coding assistant. It integrates local LLM processing (Llama 3) with a secure FastAPI backend and a responsive, vanilla web interface. 

## 🎥 Live Demonstration
<video src="https://github.com/user-attachments/assets/b3338d08-b23c-45c9-870c-d2b8db52ba3f" controls="controls" muted="muted" width="100%"></video>

## ✨ Core Features
* **🧠 Local AI Engine:** Real-time code generation and debugging powered by Llama 3 via Ollama.
* **🔒 Enterprise Security:** Fully verified Google OAuth integration and custom JWT email authentication.
* **⚡ Blazing Fast API:** Asynchronous Python backend utilizing FastAPI.
* **🌍 Public Tunneling:** Securely exposed to the web via custom-configured Cloudflare tunnels.

## 🏗️ Architecture Setup
This repository contains the application source code. **Note:** Environment variables (`.env`) and the SQLite database are strictly excluded from version control for security.

```bash
# 1. Clone the repository
git clone [https://github.com/MylavaramNagaSai/CodeQuantum.git](https://github.com/MylavaramNagaSai/CodeQuantum.git)

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI server
uvicorn backend.main:app --reload
