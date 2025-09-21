# Screenshots Directory

This directory is for storing application screenshots for the GitHub README.

## How to Add Screenshots:

1. Take screenshots of each main page in the MoneyLens application:
   - Dashboard (`/`)
   - Transactions (`/transactions`)
   - Budget (`/budget`)
   - Goals (`/goals`)
   - Debts (`/debts`)
   - Analytics (`/analytics`)
   - Calendar (`/calendar`)
   - Settings (`/settings`)

2. Save screenshots with the following naming convention:
   - `dashboard.png` - Main dashboard overview
   - `transactions.png` - Transactions management page
   - `budget.png` - Budget tracking page
   - `goals.png` - Financial goals page
   - `debts.png` - Debt management page
   - `analytics.png` - Analytics & reports page
   - `calendar.png` - Calendar view page
   - `settings.png` - Settings & preferences page

3. Replace the placeholder image references in the main README.md file with your actual screenshots.

## Recommended Screenshot Guidelines:
- Use PNG format for best quality
- Capture at 1280x720 resolution or similar
- Show the application in both light and dark modes if possible
- Ensure screenshots are clear and well-composed
- Consider adding annotations or highlights for key features

## Example Screenshot Command (macOS):
```bash
# Take screenshot after 5 seconds delay (time to navigate to page)
screencapture -T 5 -P src/screenshots/dashboard.png
```

## Example Screenshot Command (Windows):
Use the Snipping Tool or Windows + Shift + S shortcut, then save to this directory.

## Example Screenshot Command (Linux):
```bash
# Using gnome-screenshot (Ubuntu/Debian)
gnome-screenshot -d 5 -f src/screenshots/dashboard.png
