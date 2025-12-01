# Quick Start - EC2 Deployment

## One-Command Deployment

### Step 1: Install Git (if not already installed)

**Amazon Linux 2:**
```bash
sudo yum update -y
sudo yum install -y git
```

**Amazon Linux 2023:**
```bash
sudo dnf update -y
sudo dnf install -y git
```

### Step 2: Clone and Deploy

```bash
# Clone the repository
cd ~
git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git
cd Deborah-Marena-Matt-Vicente

# Run deployment
sudo bash deploy/deploy.sh
```

**Or as a one-liner (if git is already installed):**
```bash
cd ~ && git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git && cd Deborah-Marena-Matt-Vicente && sudo bash deploy/deploy.sh
```

That's it! The script handles everything.

## After Deployment

1. **Your EC2 IP is configured:** 18.232.125.59

2. **CORS is already configured** in `backend/.env` with your EC2 IP

3. **Access your application:**
   - Frontend: `http://18.232.125.59:5173`
   - Backend API: `http://18.232.125.59:5000`

## EC2 Security Group Configuration

Make sure your EC2 security group allows inbound traffic on:
- **Port 5000** (Backend API) - TCP
- **Port 5173** (Frontend) - TCP

You can restrict these to specific IPs for better security.

## Common Commands

```bash
# Check if services are running
sudo systemctl status bytepath-backend
sudo systemctl status bytepath-frontend

# View logs
sudo journalctl -u bytepath-backend -f
sudo journalctl -u bytepath-frontend -f

# Restart services
sudo systemctl restart bytepath-backend bytepath-frontend

# Update application (after git pull)
bash deploy/update.sh
```

## Troubleshooting

**Services won't start?**
```bash
sudo journalctl -u bytepath-backend -n 50
sudo journalctl -u bytepath-frontend -n 50
```

**Can't access from browser?**
- Check EC2 security group rules (ports 5000 and 5173 must be open)
- Check firewall: `sudo firewall-cmd --list-ports`
- Verify services are running: `sudo systemctl status bytepath-backend`
- Access URLs: `http://18.232.125.59:5173` (frontend) and `http://18.232.125.59:5000` (backend)

**CORS errors?**
- CORS is pre-configured with `http://18.232.125.59:5173`
- If you still get errors, verify `CORS_ORIGINS` in `backend/.env`
- Restart backend: `sudo systemctl restart bytepath-backend`

