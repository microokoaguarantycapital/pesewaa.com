# Pesewa.com - Frontend PWA

Emergency Micro-Lending in Trusted Circles - Progressive Web App

## Overview
Pesewa.com is a corporate-grade peer-to-peer emergency micro-lending platform built as a Progressive Web App (PWA). The platform enables friends, families, churches, professionals, and communities to borrow short-term emergency consumption loans within trusted, referral-only groups.

## Features
- **12 Emergency Loan Categories**: Transport, Data, Cooking Gas, Food, Repairs, Water, Fuel, Medicine, Electricity, School Fees, TV Subscription
- **Trust-Based Groups**: Referral-only groups (5-1,000 members)
- **Country-Locked**: No cross-country borrowing/lending
- **Dual Roles**: Users can be both borrowers and lenders
- **Transparent Ledgers**: Auto-generated ledgers for every loan
- **Reputation System**: 5-star ratings and blacklist management
- **PWA Features**: Installable, offline-capable, push notifications

## Tech Stack
- HTML5
- CSS3 (Vanilla CSS with CSS Grid/Flexbox)
- Vanilla JavaScript (ES6+)
- Progressive Web App (PWA)
- Service Workers for offline functionality
- IndexedDB for local storage

## Project Structure
frontend/
├── index.html # Main landing page
├── manifest.json # PWA manifest
├── service-worker.js # Service worker for offline/PWA
├── README.md # This file
├── assets/
│ ├── css/ # All CSS files
│ └── js/ # All JavaScript files
├── pages/ # All HTML pages
│ ├── dashboard/ # Dashboard pages
│ ├── countries/ # Country-specific pages
│ └── *.html # Other pages
├── data/ # JSON data files
└── .nojekyll # GitHub Pages config

## Setup & Deployment

### Local Development
1. Clone the repository
2. Open `index.html` in a modern browser
3. No build process required - it's plain HTML/CSS/JS

### GitHub Pages Deployment
1. Push the code to a GitHub repository
2. Go to repository Settings → Pages
3. Select source: "Deploy from a branch"
4. Select branch: `main` (or your branch)
5. Select folder: `/` (root)
6. Click Save
7. Your site will be live at: `https://[username].github.io/[repository-name]`

### PWA Installation
1. Visit the site in Chrome, Edge, or Safari
2. Look for the install prompt or "+" icon in address bar
3. Click "Install" to add to home screen
4. The app will work offline after first visit

## Browser Support
- Chrome 60+
- Firefox 60+
- Safari 11.1+
- Edge 79+
- Opera 47+

## Data Structure
The frontend uses static JSON files for demo data. In production, this will be replaced with a backend API.

### Important Files
- `data/categories.json`: 12 emergency loan categories
- `data/countries.json`: 12 African countries with details
- `data/collectors.json`: 200+ debt collectors
- `data/subscriptions.json`: Tier subscription details
- `data/demo-*.json`: Demo data for users, groups, ledgers

## Color System
### Core Brand Colors (Trust & Stability)
- Primary Blue: `#0A65FC`
- Deep Navy: `#061257`
- Soft Blue: `#EAF1FF`

### Growth & Mutual Benefit
- Mutual Green: `#20BF6F`
- Trust Mint: `#E8F8F1`
- Stability Green: `#168F52`

### Warm Human Accents
- Friendly Highlight: `#FF9F1C`
- Human Background: `#FFF1E6`

### Alerts
- Gentle Alert: `#FF4401`
- Warning Background: `#FFE8E3`

### Neutrals
- Primary Text: `#0B0B0B`
- Body Text: `#333333`
- Muted Text: `#6B6B6B`
- Card Background: `#F7F9FC`
- Borders: `#E0E4EA`
- White: `#FFFFFF`

## Business Rules
1. **Groups**: 5-1,000 members, referral-only, country-locked
2. **Loans**: 7-day maximum, 15% weekly interest, 5% daily penalty after day 7
3. **Default**: After 2 months non-payment = blacklist
4. **Subscriptions**: Lenders only, expires 28th of each month
5. **Borrowing Limits**: Max 4 groups per borrower, 1 active loan per group
6. **Cross-group**: Borrow in Group A, repay in Group B/C/D
7. **Ledgers**: Auto-generated, manually updated by lenders
8. **Blacklist**: Admin-moderated, removal requires full repayment

## Testing
- Open browser developer tools
- Test responsive design (mobile/tablet/desktop)
- Test offline functionality (toggle offline in devtools)
- Test PWA installation
- Validate forms and calculators

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License
Proprietary - All rights reserved by Pesewa.com

## Support
For issues or questions:
1. Check the Q&A page
2. Use the contact form
3. Refer to country-specific contact information

## Roadmap
- Backend integration (Node.js/Express)
- Firebase authentication
- Real-time updates
- Mobile app (React Native)
- Payment integration
- Advanced analytics
- Multi-language support