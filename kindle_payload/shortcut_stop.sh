#!/bin/bash
# Name: Stop Shortcut Browser
# Author: slyhype (Hardened by Antigravity)
# DontUseFBInk

refresh_screen(){
    eips -c &> /dev/null
    eips -c &> /dev/null
}

echo "Stopping browser..."
killall -TERM kindle_browser 2>/dev/null
usleep 1000000
killall -9 kindle_browser 2>/dev/null

# Clean stale lock files
rm -f /mnt/us/system/browser/Singleton* 2>/dev/null
rm -f /tmp/kindledash_exit 2>/dev/null

# Re-enable sleep
if which lipc-set-prop >/dev/null 2>&1; then
    lipc-set-prop com.lab126.powerd prevent_screen_saver 0 2>/dev/null
fi

refresh_screen

echo "Starting Kindle UI..."
if [ "${INIT_TYPE}" = "sysv" ]; then
    cd / && /etc/init.d/framework start
else
    cd / && start lab126_gui
    usleep 1250000
fi

refresh_screen
eips 1 1 "Kindle UI is reset."
refresh_screen
exit 0
