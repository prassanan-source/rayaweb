@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :43127 ^| findstr LISTENING') do (
  taskkill /PID %%a /F
)
echo Stopped anything on port 43127.
