# Fix pytest Installation Error

The error occurs because `pytest==9.0.1` requires Python 3.10+, but EC2 has Python 3.9.

## Quick Fix on EC2

### Option 1: Pull Latest Changes (if you've committed)

```bash
cd ~/Deborah-Marena-Matt-Vicente
git pull origin main
```

Then run the deployment again:
```bash
sudo bash deploy/deploy.sh
```

### Option 2: Manually Update requirements.txt

```bash
cd ~/Deborah-Marena-Matt-Vicente/backend
nano requirements.txt
```

Change line 4 from:
```
pytest==9.0.1
```

To:
```
pytest>=7.4.0,<8.5.0
```

Save and exit (Ctrl+X, then Y, then Enter).

Then continue with the deployment:
```bash
cd ~/Deborah-Marena-Matt-Vicente
sudo bash deploy/deploy.sh
```

### Option 3: Quick One-Liner Fix

```bash
cd ~/Deborah-Marena-Matt-Vicente/backend
sed -i 's/pytest==9.0.1/pytest>=7.4.0,<8.5.0/' requirements.txt
cd ~/Deborah-Marena-Matt-Vicente
sudo bash deploy/deploy.sh
```


