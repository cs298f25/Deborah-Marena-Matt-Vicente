# Troubleshooting Connection Issues

## Test 1: Check if service is running locally (from EC2)

```bash
# Test backend from within EC2
curl http://localhost:5000/api/topics

# Or test with 127.0.0.1
curl http://127.0.0.1:5000/api/topics
```

If this works, the service is running but the security group is blocking external access.

## Test 2: Check if port is listening

```bash
sudo netstat -tulpn | grep 5000
# or
sudo ss -tulpn | grep 5000
```

You should see something like:
```
tcp  0  0  0.0.0.0:5000  0.0.0.0:*  LISTEN  27968/python
```

## Test 3: Check service status

```bash
sudo systemctl status bytepath-backend
```

## Test 4: Check logs for errors

```bash
sudo journalctl -u bytepath-backend -n 50
```

## Fix: Configure EC2 Security Group

1. Go to AWS Console → EC2 → Instances
2. Select your instance (the one with IP 18.232.125.59)
3. Click on the Security Group (e.g., `sg-xxxxx`)
4. Click "Edit inbound rules"
5. Click "Add rule"
6. Add:
   - **Type**: Custom TCP
   - **Port**: 5000
   - **Source**: 0.0.0.0/0 (or your specific IP for security)
   - **Description**: BytePath Backend API
7. Add another rule for port 5173 (Frontend)
8. Click "Save rules"

After saving, wait 10-20 seconds and try again.

## Alternative: Test from within EC2

If you're SSH'd into the EC2 instance, test locally first:

```bash
curl http://localhost:5000/api/topics
```

If this works, the issue is definitely the security group.


