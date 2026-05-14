#!/bin/bash

# Quick deployment check script
# Run this on your EC2 instance to verify services are running

echo "=========================================="
echo "BytePath Deployment Status Check"
echo "=========================================="
echo ""

# Get EC2 IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "Could not detect")
echo "EC2 Public IP: $EC2_IP"
echo ""

# Check if services are running
echo "Service Status:"
echo "--------------"
systemctl is-active --quiet bytepath-backend && echo "✓ Backend service: RUNNING" || echo "✗ Backend service: NOT RUNNING"
systemctl is-active --quiet bytepath-frontend && echo "✓ Frontend service: RUNNING" || echo "✗ Frontend service: NOT RUNNING"
echo ""

# Check if ports are listening
echo "Port Status:"
echo "-----------"
if netstat -tlnp 2>/dev/null | grep -q ":5000"; then
    echo "✓ Port 5000 (backend): LISTENING"
else
    echo "✗ Port 5000 (backend): NOT LISTENING"
fi

if netstat -tlnp 2>/dev/null | grep -q ":5173"; then
    echo "✓ Port 5173 (frontend): LISTENING"
else
    echo "✗ Port 5173 (frontend): NOT LISTENING"
fi
echo ""

# Check service logs for errors
echo "Recent Backend Errors (last 10 lines):"
echo "--------------------------------------"
journalctl -u bytepath-backend -n 10 --no-pager | grep -i error || echo "No errors found"
echo ""

echo "Recent Frontend Errors (last 10 lines):"
echo "---------------------------------------"
journalctl -u bytepath-frontend -n 10 --no-pager | grep -i error || echo "No errors found"
echo ""

# Test backend health endpoint
echo "Backend Health Check:"
echo "-------------------"
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✓ Backend API is responding"
    curl -s http://localhost:5000/api/health | head -c 100
    echo ""
else
    echo "✗ Backend API is not responding"
fi
echo ""

# Check firewall
echo "Firewall Status:"
echo "---------------"
if systemctl is-active --quiet firewalld; then
    echo "Firewalld is running"
    firewall-cmd --list-ports 2>/dev/null | grep -E "5000|5173" && echo "✓ Ports 5000 and 5173 are open" || echo "✗ Ports may not be open in firewall"
else
    echo "Firewalld is not running"
fi
echo ""

# Display access URLs
echo "=========================================="
echo "Access URLs:"
echo "=========================================="
echo "Frontend: http://$EC2_IP:5173"
echo "Backend:  http://$EC2_IP:5000"
echo "API:      http://$EC2_IP:5000/api"
echo ""
echo "If you can't access from browser:"
echo "1. Check AWS Security Group - ports 5000 and 5173 must be open"
echo "2. Check service logs: sudo journalctl -u bytepath-backend -f"
echo "3. Verify services are running: sudo systemctl status bytepath-backend"
echo ""

