#!/bin/bash
# Complete fix for the backend service

sudo tee /etc/systemd/system/bytepath-backend.service > /dev/null << 'EOF'
[Unit]
Description=BytePath Backend API (Gunicorn)
After=network.target

[Service]
Type=simple
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/Deborah-Marena-Matt-Vicente
Environment="PATH=/home/ec2-user/Deborah-Marena-Matt-Vicente/backend/.venv/bin"
EnvironmentFile=/home/ec2-user/Deborah-Marena-Matt-Vicente/backend/.env
ExecStart=/home/ec2-user/Deborah-Marena-Matt-Vicente/backend/.venv/bin/gunicorn \
    --bind 0.0.0.0:5000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --pythonpath /home/ec2-user/Deborah-Marena-Matt-Vicente \
    backend.app:application
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl restart bytepath-backend
sleep 2
sudo systemctl status bytepath-backend --no-pager -l


