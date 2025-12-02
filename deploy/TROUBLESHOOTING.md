# EC2 Deployment Troubleshooting Guide

## ⚠️ IMPORTANT: Run on EC2 Only

**This deployment script is designed to run ON your EC2 instance, not locally.**

To deploy:
1. SSH into your EC2 instance: `ssh -i your-key.pem ec2-user@98.93.32.27`
2. Clone the repository: `git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git`
3. Run the script: `cd Deborah-Marena-Matt-Vicente && sudo bash deploy/deploy.sh`

## Common Issues and Solutions

### 1. IP Address Detection Failed

**Problem:** Script can't detect EC2 public IP address

**Solution:**
```bash
# Manually set the IP address
export EC2_PUBLIC_IP=your.instance.ip.address
sudo -E ./deploy/deploy.sh
```

**Note:** The `-E` flag preserves environment variables when using sudo.

### 2. Service User Not Found

**Problem:** Script can't find `ec2-user` or `ubuntu` user

**Solution:** The script will automatically fall back to the user who ran sudo. If you need to specify a different user, you can modify the script or ensure the standard user exists:
```bash
# For Amazon Linux
useradd -m -s /bin/bash ec2-user

# For Ubuntu
useradd -m -s /bin/bash ubuntu
```

### 3. Database Initialization Errors

**Problem:** Database schema is out of date or missing columns

**Solution:** The script automatically runs `backend/add_columns.py` to update the schema. If it fails:
```bash
cd /path/to/project
source backend/.venv/bin/activate
export PYTHONPATH=$(pwd)
python3 -m backend.add_columns
```

### 4. Backend Service Won't Start

**Problem:** `bytepath-backend` service fails to start

**Check logs:**
```bash
sudo journalctl -u bytepath-backend -n 50
```

**Common causes:**
- Missing dependencies: `pip install -r backend/requirements.txt`
- Database permissions: `sudo chown -R ec2-user:ec2-user backend/bytepath.db`
- Port already in use: `sudo lsof -ti:5000` and kill the process
- Python path issues: Check that `PYTHONPATH` is set correctly in the service file

**Restart service:**
```bash
sudo systemctl restart bytepath-backend
sudo systemctl status bytepath-backend
```

### 5. Frontend Service Won't Start

**Problem:** `bytepath-frontend` service fails to start

**Check logs:**
```bash
sudo journalctl -u bytepath-frontend -n 50
```

**Common causes:**
- `serve` package not installed: `npm install -g serve`
- Build directory missing: Run `npm run build` manually
- Port already in use: `sudo lsof -ti:5173` and kill the process

**Restart service:**
```bash
sudo systemctl restart bytepath-frontend
sudo systemctl status bytepath-frontend
```

### 6. CORS Errors in Browser

**Problem:** Frontend can't connect to backend API

**Solution:** Check that the EC2 IP in CORS_ORIGINS matches your actual IP:
```bash
# Check current CORS settings
sudo cat backend/.env | grep CORS_ORIGINS

# Update if needed (edit the .env file)
sudo nano backend/.env
# Update CORS_ORIGINS to include your IP
# Then restart backend:
sudo systemctl restart bytepath-backend
```

### 7. Port Already in Use

**Problem:** Port 5000 or 5173 is already in use

**Solution:**
```bash
# Find what's using the port
sudo lsof -ti:5000
sudo lsof -ti:5173

# Kill the process (replace PID with actual process ID)
sudo kill <PID>

# Or stop the services first
sudo systemctl stop bytepath-backend bytepath-frontend
```

### 8. Python Version Issues

**Problem:** Wrong Python version or Python not found

**Solution:**
```bash
# Check available Python versions
which python3.11
which python3

# The script should auto-detect, but you can manually specify:
# Edit the script to use a specific Python version
```

### 9. Permission Denied Errors

**Problem:** Service can't access files or directories

**Solution:**
```bash
# Fix ownership of project directory
sudo chown -R ec2-user:ec2-user /path/to/project

# Ensure service user has access
sudo chmod -R 755 /path/to/project
```

### 10. Firewall Blocking Ports

**Problem:** Can't access services from outside EC2

**Solution:**
```bash
# Check if firewalld is running
sudo systemctl status firewalld

# If running, ensure ports are open
sudo firewall-cmd --list-ports
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --permanent --add-port=5173/tcp
sudo firewall-cmd --reload

# Also check AWS Security Groups:
# - Go to EC2 Console > Security Groups
# - Ensure inbound rules allow ports 5000 and 5173
```

## Quick Diagnostic Commands

```bash
# Check service status
sudo systemctl status bytepath-backend bytepath-frontend

# View recent logs
sudo journalctl -u bytepath-backend -n 100
sudo journalctl -u bytepath-frontend -n 100

# Check if ports are listening
sudo netstat -tlnp | grep -E '5000|5173'
# or
sudo ss -tlnp | grep -E '5000|5173'

# Test backend API
curl http://localhost:5000/api/health

# Check environment variables
sudo cat backend/.env

# Verify file permissions
ls -la backend/bytepath.db
ls -la frontend/dist/
```

## Manual Deployment Steps

If the automated script fails, you can deploy manually:

1. **Setup Backend:**
   ```bash
   cd backend
   python3.11 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn
   export PYTHONPATH=$(pwd)/..
   python3 -m backend.init_db
   python3 -m backend.add_columns
   ```

2. **Setup Frontend:**
   ```bash
   cd ..
   npm install
   export VITE_API_BASE=http://YOUR_IP:5000/api
   npm run build
   npm install -g serve
   ```

3. **Create Services:**
   - Copy service files from `/etc/systemd/system/bytepath-*.service`
   - Adjust paths and user as needed
   - Enable and start: `sudo systemctl enable --now bytepath-backend bytepath-frontend`

## Getting Help

If you're still having issues:

1. Check all service logs: `sudo journalctl -u bytepath-* -n 200`
2. Verify your EC2 instance has internet access
3. Check AWS Security Group rules
4. Ensure you're using the correct IP address (public vs private)
5. Verify the project was cloned correctly: `ls -la backend/ frontend/`

