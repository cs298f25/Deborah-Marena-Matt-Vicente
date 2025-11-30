# Quick Start - EC2 Deployment

## One-Command Deployment

```bash
# On your EC2 instance
git clone <your-repo-url>
cd Deborah-Marena-Matt-Vicente
sudo bash deploy/deploy.sh
```

That's it! The script handles everything.

## After Deployment

1. **Your EC2 IP is configured:** 44.200.81.23

2. **CORS is already configured** in `backend/.env` with your EC2 IP

3. **Access your application:**
   - Frontend: `http://44.200.81.23:5173`
   - Backend API: `http://44.200.81.23:5000`

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
- Access URLs: `http://44.200.81.23:5173` (frontend) and `http://44.200.81.23:5000` (backend)

**CORS errors?**
- CORS is pre-configured with `http://44.200.81.23:5173`
- If you still get errors, verify `CORS_ORIGINS` in `backend/.env`
- Restart backend: `sudo systemctl restart bytepath-backend`

