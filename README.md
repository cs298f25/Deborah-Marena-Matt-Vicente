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

1. **SSH into EC2 and clone:**
   ```bash
   ssh -i ~/.ssh/labsuser.pem ec2-user@publicIP
   sudo yum install -y git
   cd ~
   git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git
   cd Deborah-Marena-Matt-Vicente
   ```

2. **Deploy:**
   ```bash
   sudo bash deploy/deploy.sh
   ```

3. **Access:**
   - Frontend: `http://<EC2-IP>:5173`
   - Backend: `http://<EC2-IP>:5000`

**Note:** Ensure EC2 security group allows ports 5000 and 5173.

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
