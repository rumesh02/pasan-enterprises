# ⚡ QUICK FIX - 3 COMMANDS

Your dashboard is showing 404 errors because **production server has old code**.

## Run These 3 Commands on Your Server:

```bash
# 1. SSH to your server
ssh your-user@pasan-enterprises.me

# 2. Go to backend and pull code (CHANGE THE PATH!)
cd /var/www/pasan-enterprises/backend  # ← CHANGE THIS PATH!
git pull origin dulara01

# 3. Restart backend
pm2 restart pasan-enterprises-backend  # ← OR your restart command
```

## That's it! ✅

Test: https://main.d1ukwwdrgqtdby.amplifyapp.com/dashboard

---

## Don't Know the Path or Restart Command?

### Find your backend directory:
```bash
find / -name "server.js" 2>/dev/null | grep pasan
```

### Find how backend is running:
```bash
# Check PM2
pm2 list

# Check systemd
sudo systemctl list-units | grep pasan

# Check Docker
docker ps

# Check running processes
ps aux | grep node
```

---

## Still Not Working?

**Read:** `FIX_DASHBOARD_NOW.md` for detailed instructions.

**Or contact me** with:
1. Your server login method (SSH, cPanel, etc.)
2. Hosting provider (AWS, DigitalOcean, etc.)
3. How you deployed the backend originally

---

✅ **Code Status**: Pushed to GitHub (branch: dulara01)  
📅 **Date**: October 7, 2025  
🔗 **Commit**: c72026e
