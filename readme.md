# CodeSpace - A Replit Clone
CodeSpace is a web-based IDE that allows you to write, run, and collaborate on code in real-time, similar to Replit. Write, compile, and execute code directly in your browser without any local setup.


## 🚀 Quick Start

### Prerequisites
- Web browser (Chrome, Firefox, Safari, or Edge)
- No additional software required!

## 📦 Installation & Setup

### Method 1: For Beginners (Simple Double-Click)
1. Download the project
2. Find the appropriate server starter for your system:
   - **Windows**: Double-click `start_server.bat`
   - **Mac/Linux**: Double-click `start_server.sh`
3. Open your web browser and visit:
   ```
   http://localhost:8000/app.html
   ```

### Method 2: For Developers (Command Line)
1. Clone the repository:
   ```bash
   git clone [your-repository-url]
   cd [project-folder]
   ```

2. Start the server:
   - **Windows**:
     ```bash
     .\start_server.bat
     ```
   - **Mac/Linux**:
     ```bash
     chmod +x start_server.sh
     ./start_server.sh
     ```

3. Access the application at `http://localhost:8000/app.html`

## 🔍 Troubleshooting

### Common Issues

1. **"Server not starting"**
   - Make sure no other application is using port 8000
   - Try running as administrator/with sudo

2. **"Permission Denied" (Mac/Linux)**
   ```bash
   chmod +x start_server.sh
   ```

3. **"Page not found"**
   - Verify the server is running (terminal window should be open)
   - Check if you're using the correct URL

## 🛠️ For Advanced Users

### Custom Configuration
- Server runs on port 8000 by default
- Modify port in server configuration if needed

### Manual Server Start