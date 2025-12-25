# Pesewa.com - Emergency Micro-Lending Platform

![Pesewa Logo](assets/images/logo.svg)

## Overview

Pesewa.com is a revolutionary peer-to-peer emergency micro-lending platform built as a Progressive Web App (PWA). It enables trusted communities to lend and borrow for urgent consumption needs through a referral-only, group-based system.

**Live Demo:** [https://yourusername.github.io/pesewa-frontend](https://yourusername.github.io/pesewa-frontend)

## Features

### Core Functionality
- **12 Emergency Loan Categories**: Transport, Data, Cooking Gas, Food, Repairs, Water, Fuel, Medicine, Electricity, School Fees, TV Subscription
- **Dual Role System**: Users can be both borrowers and lenders
- **Trust-Based Groups**: Referral-only groups (5-1000 members per group)
- **Country-Specific Operations**: 12 African countries with local currency support
- **Subscription Model**: Lenders pay monthly subscriptions (borrowers pay nothing)

### Technical Features
- **Progressive Web App**: Installable, offline-capable, responsive
- **Modern UI/UX**: Built with vanilla HTML/CSS/JS, following WCAG 2.1
- **Service Worker**: Caches assets for offline use
- **GitHub Pages Ready**: Static hosting with PWA support

## Project Structure
frontend/
├── index.html # Main landing page
├── manifest.json # PWA manifest
├── service-worker.js # Service worker for offline functionality
├── README.md # This file
├── assets/
│ ├── css/ # Stylesheets
│ │ ├── main.css # Global styles
│ │ ├── components.css # Reusable components
│ │ ├── dashboard.css # Dashboard specific styles
│ │ ├── forms.css # Form styling
│ │ ├── tables.css # Table styling
│ │ └── animations.css # CSS animations
│ ├── js/ # JavaScript files
│ │ ├── app.js # Main application logic
│ │ ├── auth.js # Authentication handling
│ │ ├── roles.js # Role management
│ │ ├── groups.js # Groups functionality
│ │ ├── lending.js # Lending operations
│ │ ├── borrowing.js # Borrowing operations
│ │ ├── ledger.js # Ledger management
│ │ ├── blacklist.js # Blacklist system
│ │ ├── subscriptions.js # Subscription management
│ │ ├── countries.js # Country-specific logic
│ │ ├── collectors.js # Debt collectors
│ │ ├── calculator.js # Loan calculator
│ │ ├── pwa.js # PWA functionality
│ │ └── utils.js # Utility functions
│ └── images/ # Images and icons
│ ├── logo.svg # Main logo
│ ├── icons/ # SVG icons
│ ├── flags/ # Country flags
│ └── categories/ # Category icons
├── pages/ # All HTML pages
│ ├── dashboard/ # Dashboard pages
│ │ ├── borrower-dashboard.html
│ │ ├── lender-dashboard.html
│ │ └── admin-dashboard.html
│ ├── lending.html # Lending interface
│ ├── borrowing.html # Borrowing interface
│ ├── ledger.html # Ledger management
│ ├── groups.html # Groups management
│ ├── subscriptions.html # Subscription management
│ ├── blacklist.html # Blacklisted users
│ ├── debt-collectors.html # Debt collectors directory
│ ├── about.html # About page
│ ├── qa.html # Q&A page
│ ├── contact.html # Contact page (email + form)
│ └── countries/ # Country-specific pages
│ ├── index.html # Countries overview
│ ├── kenya.html # Kenya page
│ ├── uganda.html # Uganda page
│ ├── tanzania.html # Tanzania page
│ ├── rwanda.html # Rwanda page
│ ├── burundi.html # Burundi page
│ ├── somalia.html # Somalia page
│ ├── south-sudan.html # South Sudan page
│ ├── ethiopia.html # Ethiopia page
│ ├── congo.html # Congo page
│ ├── nigeria.html # Nigeria page
│ ├── south-africa.html # South Africa page
│ └── ghana.html # Ghana page
├── data/ # Static data files
│ ├── countries.json # Country data
│ ├── subscriptions.json # Subscription tiers
│ ├── categories.json # Loan categories
│ ├── collectors.json # Debt collectors (200+)
│ ├── demo-groups.json # Demo groups data
│ ├── demo-users.json # Demo users data
│ └── demo-ledgers.json # Demo ledgers data
└── .nojekyll # GitHub Pages config


## Business Rules

### Platform Hierarchy
1. **Country** → **Groups** → **Lenders** → **Borrowers** → **Ledgers**
2. No cross-country lending/borrowing
3. Groups are country-locked with flag badges

### Group Rules
- Minimum: 5 members
- Maximum: 1,000 members
- Referral-only entry
- Each group has an admin/founder
- Users can join max 4 groups (with good rating)

### Loan Terms
- **Repayment Period**: 7 days maximum
- **Interest**: 15% weekly (fixed)
- **Penalty**: 5% daily after day 7
- **Default**: After 2 months non-payment
- **Categories**: 12 specific emergency categories only

### Subscription System
- **Borrowers**: No subscription fee
- **Lenders**: Monthly subscription required (Basic: ₵50, Premium: ₵250, Super: ₵1,000)
- **Expiry**: 28th of each month
- **Lockout**: Expired subscription locks lender dashboard

### Reputation System
- **Ratings**: 1-5 stars (lenders rate borrowers)
- **Blacklist**: Admin-moderated, visible platform-wide
- **Removal**: Only by admin after full repayment

## Color System

### Core Brand Colors (Trust & Stability)
- Primary Blue: `#0A65FC` (CTAs, links, headers)
- Deep Navy: `#061257` (nav bars, footers, key text)
- Soft Blue: `#EAF1FF` (section backgrounds, info cards)

### Growth & Mutual Benefit Colors
- Mutual Green: `#20BF6F` (loan approved, balances, success)
- Trust Mint: `#E8F8F1` (status panels, positive feedback)
- Stability Green: `#168F52` (icons, badges, progress bars)

### Warm Human Accents
- Friendly Highlight: `#FF9F1C` (feature highlights, onboarding)
- Human Background: `#FFF1E6` (empty states, illustrations)

### Alert Colors (Minimal Use)
- Gentle Alert: `#FF4401` (errors only)
- Warning Background: `#FFE8E3` (alert containers)

### Neutral & UI Foundation
- Primary Text: `#0B0B0B` (headings)
- Body Text: `#333333` (paragraphs)
- Muted Text: `#6B6B6B` (metadata)
- Card Background: `#F7F9FC` (cards)
- Borders: `#E0E4EA` (dividers)
- White: `#FFFFFF` (base)

## Setup & Deployment

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pesewa-frontend.git
   cd pesewa-frontend