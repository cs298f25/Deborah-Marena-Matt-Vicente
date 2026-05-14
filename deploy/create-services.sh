BP_USER=bytepath
BP_DIR=/home/$BP_USER/BytePath

sudo tee /etc/systemd/system/bytepath-backend.service > /dev/null <<EOL
[Unit]
Description=Bytepath Backend Service
After=network.target

[Service]
ExecStart=$BP_DIR/backend/.venv/bin/python3 -m backend.app
WorkingDirectory=$BP_DIR
User=$BP_USER
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOL

sudo tee /etc/systemd/system/bytepath-frontend.service > /dev/null <<EOL
[Unit]
Description=Bytepath Frontend Service
After=network.target

[Service]
ExecStart=/usr/bin/npm run dev
WorkingDirectory=$BP_DIR
User=$BP_USER
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOL

sudo systemctl daemon-reload
sudo systemctl enable --now bytepath-backend
sudo systemctl enable --now bytepath-frontend
