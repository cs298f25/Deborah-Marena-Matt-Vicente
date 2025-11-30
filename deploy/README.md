# BytePath EC2 Deployment Guide

This guide explains how to deploy BytePath on an Amazon EC2 instance.

## Prerequisites

- EC2 instance running Amazon Linux 2 or Amazon Linux 2023
- SSH access to the instance
- Root/sudo access

## Quick Deployment

1. **Clone the repository on your EC2 instance:**
   ```bash
   git clone <your-repo-url>
   cd Deborah-Marena-Matt-Vicente
   ```

2. **Run the deployment script:**
   ```bash
   sudo bash deploy/deploy.sh
   ```

The script will:
- Install system dependencies (Python, Node.js, npm)
- Set up Python virtual environment and install backend dependencies
- Install frontend dependencies and build the React app
- Create systemd service files for both backend and frontend
- Configure firewall rules
- Start both services

## Manual Setup (Alternative)

If you prefer to set up manually:

### Backend Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install gunicorn

# Create .env file
cat > .env << EOF
FLASK_ENV=production
BYTEPATH_SECRET_KEY=$(openssl rand -hex 32)
CORS_ORIGINS=http://YOUR_EC2_IP:5173
EOF
```

### Frontend Setup

```bash
npm install
npm install -g serve
npm run build
```

### Create Systemd Services

Copy the service files from `deploy/` directory or create them manually:

```bash
sudo cp deploy/bytepath-backend.service /etc/systemd/system/
sudo cp deploy/bytepath-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable bytepath-backend bytepath-frontend
sudo systemctl start bytepath-backend bytepath-frontend
```

## Service Management

### Check Status
```bash
sudo systemctl status bytepath-backend
sudo systemctl status bytepath-frontend
```

### View Logs
```bash
# Backend logs
sudo journalctl -u bytepath-backend -f

# Frontend logs
sudo journalctl -u bytepath-frontend -f
```

### Restart Services
```bash
sudo systemctl restart bytepath-backend
sudo systemctl restart bytepath-frontend
```

### Stop Services
```bash
sudo systemctl stop bytepath-backend bytepath-frontend
```

## Configuration

### Environment Variables

Edit `backend/.env` to configure:
- `FLASK_ENV`: Set to `production`
- `BYTEPATH_SECRET_KEY`: Secret key for Flask sessions (auto-generated)
- `CORS_ORIGINS`: Comma-separated list of allowed origins (configured as `http://44.200.81.23:5173`)

**Note:** The deployment script automatically configures CORS_ORIGINS with your EC2 IP (44.200.81.23). If you need to change it, edit `backend/.env` and restart:
```bash
sudo systemctl restart bytepath-backend
```

### Frontend API Configuration

The frontend API base URL is automatically set during deployment to `http://44.200.81.23:5000/api`. This is configured when building the frontend.

### Ports

- Backend: Port 5000
- Frontend: Port 5173

To change ports, edit the systemd service files and update the firewall rules.

### Database

The SQLite database is located at `backend/bytepath.db`. Make sure the `ec2-user` has write permissions.

## Updating the Application

1. **Pull latest changes:**
   ```bash
   git pull
   ```

2. **Update backend:**
   ```bash
   cd backend
   source .venv/bin/activate
   pip install -r requirements.txt
   sudo systemctl restart bytepath-backend
   ```

3. **Update frontend:**
   ```bash
   npm install
   npm run build
   sudo systemctl restart bytepath-frontend
   ```

## Troubleshooting

### Services won't start
- Check logs: `sudo journalctl -u bytepath-backend -n 50`
- Verify file permissions: `ls -la backend/`
- Check if ports are in use: `sudo netstat -tulpn | grep -E '5000|5173'`

### Database errors
- Ensure `backend/bytepath.db` exists and is writable
- Check permissions: `chown ec2-user:ec2-user backend/bytepath.db`

### CORS errors
- Update `CORS_ORIGINS` in `backend/.env` to include your frontend URL
- Restart backend: `sudo systemctl restart bytepath-backend`

### Firewall issues
```bash
# Check if ports are open
sudo firewall-cmd --list-ports

# Open ports manually if needed
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload
```

## Security Notes

⚠️ **This setup uses HTTP only** - For production, consider:
- Setting up HTTPS with Let's Encrypt
- Using nginx as a reverse proxy
- Implementing proper authentication
- Restricting firewall rules to specific IPs
- Using environment variables for sensitive data

