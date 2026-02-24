let timeOffset = parseInt(localStorage.getItem('clockTimeOffset') || '0'); // Difference between server time and local time in ms
const dateElement = document.getElementById('date');
const timeElement = document.getElementById('time');
const statusElement = document.getElementById('status');

// Helper to hide status after delay
function hideStatus() {
    setTimeout(function() {
        statusElement.style.opacity = '0';
    }, 3000);
}

// Function to save offset
function saveOffset(offset) {
    timeOffset = offset;
    localStorage.setItem('clockTimeOffset', offset.toString());
}

// Function to fetch time from an online source
async function syncTime() {
    statusElement.style.opacity = '1';
    statusElement.textContent = 'Syncing time...';
    
    // Try Primary Source: timeapi.io (UTC)
    try {
        const response = await fetch('https://timeapi.io/api/Time/current/zone?timeZone=Etc/UTC');
        if (response.ok) {
            const data = await response.json();
            // timeapi.io returns dateTime like "2026-02-16T04:12:47.6874662"
            // Treat as UTC by appending 'Z'
            const serverTime = new Date(data.dateTime + 'Z').getTime();
            
            // Calculate offset. Date.now() is UTC based.
            const newOffset = serverTime - Date.now();
            saveOffset(newOffset);
            
            statusElement.textContent = 'Synced with timeapi.io';
            console.log('Time synced with timeapi.io. Offset:', newOffset);
            hideStatus();
            return;
        }
    } catch (e) {
        console.warn('Primary sync failed (timeapi.io):', e);
    }

    // Try Secondary Source: WorldTimeAPI
    try {
        const response = await fetch('https://worldtimeapi.org/api/ip');
        if (response.ok) {
            const data = await response.json();
            const serverTime = new Date(data.datetime).getTime();
            const newOffset = serverTime - Date.now();
            saveOffset(newOffset);
            
            statusElement.textContent = 'Synced with WorldTimeAPI';
            console.log('Time synced with WorldTimeAPI. Offset:', newOffset);
            hideStatus();
            return;
        }
    } catch (e) {
        console.warn('Secondary sync failed (WorldTimeAPI):', e);
    }

    // Fallback: Use Cached Offset or System Time
    if (timeOffset !== 0) {
        console.warn('Sync failed. Using cached offset.');
        statusElement.textContent = 'Sync failed. Using cached time.';
    } else {
        console.error('All time syncs failed and no cache. Using local system time.');
        statusElement.textContent = 'Sync failed. Using system time.';
    }
    hideStatus();
}

// Function to get ordinal suffix for date
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return 'st';
        case 2:  return 'nd';
        case 3:  return 'rd';
        default: return 'th';
    }
}

// Function to update the clock display
function updateClock() {
    // Apply offset to current system time to get "real" time
    const now = new Date(Date.now() + timeOffset);
    
    // Format Date: "February 5th, 2026"
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const month = months[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    const suffix = getOrdinalSuffix(day);
    
    dateElement.textContent = month + ' ' + day + suffix + ', ' + year;
    
    // Format Time: "2:35 PM"
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const secondsStr = seconds < 10 ? '0' + seconds : seconds;
    
    timeElement.textContent = hours + ':' + minutesStr + ':' + secondsStr + ' ' + ampm;
}

// Initial sync
syncTime();

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// Resync every hour to keep accuracy
setInterval(syncTime, 3600000);
