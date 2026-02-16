let timeOffset = 0; // Difference between server time and local time in ms
const dateElement = document.getElementById('date');
const timeElement = document.getElementById('time');
const statusElement = document.getElementById('status');

// Function to fetch time from an online source
async function syncTime() {
    try {
        statusElement.textContent = 'Syncing time...';
        // Primary source: WorldTimeAPI
        const response = await fetch('https://worldtimeapi.org/api/ip');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        const serverTime = new Date(data.datetime).getTime();
        const localTime = Date.now();
        timeOffset = serverTime - localTime;
        
        statusElement.textContent = 'Synced with WorldTimeAPI';
        console.log('Time synced. Offset:', timeOffset);
        
        // Hide status after a few seconds
        setTimeout(function() {
            statusElement.style.opacity = '0';
        }, 3000);
        
    } catch (error) {
        console.error('Failed to sync time:', error);
        statusElement.textContent = 'Sync failed. Using local time.';
        // Fallback: use local time (offset 0)
        timeOffset = 0;
        
        setTimeout(function() {
            statusElement.style.opacity = '0';
        }, 3000);
    }
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
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    
    timeElement.textContent = hours + ':' + minutesStr + ' ' + ampm;
}

// Initial sync
syncTime();

// Update clock immediately and then every second
updateClock();
setInterval(updateClock, 1000);

// Resync every hour to keep accuracy
setInterval(syncTime, 3600000);
