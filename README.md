# Responsive Scenic Clock App

A production-ready clock application designed for digital signage.

## Features
- **Accurate Time Sync**: Synchronizes with online time APIs (`timeapi.io`, `worldtimeapi.org`) to ensure precision.
- **Offline Reliability**: Saves time offsets to `localStorage` and relies on system-provided caching for offline operation.
- **Dynamic Display**: Shows current date, time (with seconds), and AM/PM in a large, readable format.
- **Scenic UI**: High-quality scenic background with readability-enhancing overlays.
- **Responsive Design**: Adapts typography and layout to any screen size.
- **Cache Control**: Implements mandatory cache-busting and fresh-fetch strategies.

## Technologies Used
- HTML5 / CSS3 (Flexbox, Viewport Units)
- Vanilla JavaScript (Async/Await, localStorage)
- TimeAPI.io / WorldTimeAPI
