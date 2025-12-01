# EC2 Initial Setup Commands

## Step 1: Install Git

For **Amazon Linux 2**:
```bash
sudo yum update -y
sudo yum install -y git
```

For **Amazon Linux 2023**:
```bash
sudo dnf update -y
sudo dnf install -y git
```

Verify installation:
```bash
git --version
```

## Step 2: Clone the Repository

```bash
cd ~
git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git
cd Deborah-Marena-Matt-Vicente
```

## Step 3: Verify Clone

```bash
ls -la
# You should see: backend, deploy, src, package.json, etc.
```

## Step 4: Run Deployment

```bash
sudo bash deploy/deploy.sh
```

## Complete One-Liner (if git is already installed)

```bash
cd ~ && git clone https://github.com/cs298f25/Deborah-Marena-Matt-Vicente.git && cd Deborah-Marena-Matt-Vicente && sudo bash deploy/deploy.sh
```

## Troubleshooting

**If git is not found:**
- Make sure you're using the correct package manager for your Amazon Linux version
- Try: `which git` to check if it's installed but not in PATH

**If clone fails:**
- Check your internet connection: `ping github.com`
- Verify the repository URL is correct
- If you need authentication, you may need to set up SSH keys or use a personal access token

