# Deborah-Marena-Matt-Vicente

## Contributors

- **Deborah Rabinovich**
- **Marena Abboud**
- **Matthew Krauss**
- **Vicente Rivera**

---

## Local Development

1. **Setup:**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r backend/requirements.txt
   npm install
   ```

2. **Run:**
   ```bash
   # Option 1: Automated (recommended)
   ./deploy/local-deploy.sh
   
   # Option 2: Manual
   python -m backend.app  # Terminal 1
   npm run dev            # Terminal 2
   ```

---

## EC2 Deployment

**Quick Start:**
```bash
# 1. SSH into your EC2 instance
ssh -i your-key.pem ec2-user@YOUR_EC2_IP

# 2. Clone and deploy (one command)
cd ~ && git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git && cd Deborah-Marena-Matt-Vicente && sudo bash deploy/deploy.sh
```

**The script automatically:**
- Detects your EC2 IP address
- Configures everything for your instance
- Sets up and starts all services

**Access your application:**
- Frontend: `http://YOUR_EC2_IP:5173`
- Backend: `http://YOUR_EC2_IP:5000`

**Important:** 
- Each team member will have a different EC2 IP
- The script auto-detects your IP 
- Ensure your EC2 security group allows ports 5000 and 5173

**For detailed instructions, see:** [`deploy/TEAM_DEPLOYMENT.md`](deploy/TEAM_DEPLOYMENT.md)

**Service Management:**
```bash
sudo systemctl status bytepath-backend bytepath-frontend
sudo systemctl restart bytepath-backend bytepath-frontend
sudo journalctl -u bytepath-backend -f
```

---

## System Diagram

```
┌─────────────────┐     ┌──────────────────────┐     ┌───────────────────┐
│  Frontend       │     │  Backend             │     │  Database         │
│  (TypeScript/   │◄───►│  (Python/Flask)      │◄───►│  (SQLite)         │
│   React)        │     │  - REST API          │     │  - users          │
└─────────────────┘     │  - Authentication    │     │  - topics         │
                        │  - CSV Upload        │     │  - progress       │
                        │  - Progress Tracking │     │  - responses      │
                        └──────────────────────┘     └───────────────────┘
```
