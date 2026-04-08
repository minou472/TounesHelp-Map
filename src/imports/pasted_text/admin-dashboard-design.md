Design a comprehensive admin dashboard for TounesHelpMap - a Tunisian community assistance platform that enables citizens to report cases of need, track their status, and connect with helpers. The dashboard must include an integrated AI chatbot for answering platform-related questions.

---

## Dashboard Layout Requirements

### 1. Sidebar Navigation

- **Logo Area**: TounesHelpMap branding at top
- **Navigation Items**:
  - Dashboard (home icon)
  - Cases Management (briefcase icon)
  - Users/People (users icon)
  - Places & Locations (map-pin icon)
  - Moderation Queue (shield icon)
  - Notifications (bell icon)
  - Settings (gear icon)
  - Chatbot (message-circle icon)
- **Admin Profile**: Bottom section with avatar and logout

### 2. Main Content Area - Dashboard Home

**Header Section**:

- Welcome message with admin name
- Current date and time
- Language switcher (AR/FR/EN)
- Quick search bar

**Metrics Cards (4-column grid)**:

- Total Active Cases (with trend indicator)
- Pending Review Cases
- Resolved Cases This Month
- Total Registered Users

**Charts Section**:

- Cases by Status (pie/donut chart)
- Cases by Governorate (bar chart)
- Activity Timeline (line chart - cases over time)

**Recent Activity Feed**:

- Latest case submissions
- Recent status changes
- New user registrations

### 3. Cases Management Page

**Features**:

- Filterable/sortable data table
- Status filter tabs (All, Pending, Active, In Progress, Resolved, Rejected)
- Search by case title, location, or ID
- Bulk actions (approve, reject, archive)
- Click to view case details in slide-out panel

**Case Card/Row Display**:

- Case ID
- Title
- Category
- Governorate/Location
- Status badge (color-coded)
- Date submitted
- Assigned admin (if any)
- Action buttons (view, edit, status)

### 4. Users/People Management Page

**Features**:

- User directory with search and filters
- User roles (Regular User, Case Contact, Assistant Organization, Admin)
- User activity history
- Account status (Active, Suspended, Pending Verification)

**Columns**:

- Avatar
- Full Name
- Email
- Role
- Cases Submitted
- Account Status
- Join Date
- Actions

### 5. Places & Locations Page

**Features**:

- Interactive map (Leaflet-based) showing all case locations
- Tunisia governorates layer
- Location markers with clustering
- GPS coordinates display for each location
- Add/Edit location functionality

**List View**:

- Governorate name
- Case count
- Coordinates (latitude/longitude)
- Last updated

### 6. Chatbot Panel/Section

**Design Requirements**:

- Floating chat widget (bottom-right corner) OR
- Dedicated chatbot page accessible from sidebar

**Chat Interface**:

- Chat header with bot name "TounesHelp Assistant"
- Message history area (scrollable)
- User input field with send button
- Typing indicator animation
- Quick question suggestions chips

**Chatbot Capabilities to Display**:

- Platform information (about TounesHelpMap)
- Case status inquiries
- User/account information
- Location/GPS information
- Help and support

**Message Bubbles**:

- User messages: right-aligned, primary color
- Bot messages: left-aligned, neutral gray
- Timestamp on each message
- Link/button integration for actions

---

## Visual Design Specifications

### Color Palette

| Color Role     | Hex Code  | Usage                          |
| -------------- | --------- | ------------------------------ |
| Primary        | `#1E88E5` | Buttons, links, active states  |
| Secondary      | `#43A047` | Success states, resolved cases |
| Accent         | `#FF9800` | Warnings, pending items        |
| Danger         | `#E53935` | Rejected cases, errors         |
| Background     | `#F5F7FA` | Main background                |
| Surface        | `#FFFFFF` | Cards, panels                  |
| Text Primary   | `#1A202C` | Headings, body text            |
| Text Secondary | `#718096` | Captions, labels               |
| Border         | `#E2E8F0` | Dividers, card borders         |

### Typography

- **Font Family**: "IBM Plex Sans" or "Inter" (clean, modern)
- **Headings**:
  - H1: 28px, Bold (600)
  - H2: 22px, Semi-bold (500)
  - H3: 18px, Medium (500)
- **Body**: 14px, Regular (400)
- **Small/Caption**: 12px, Regular (400)

### Spacing System

- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Component margins: 16px

### Components to Design

1. **Sidebar**: Collapsible, 260px width expanded, 72px collapsed
2. **Metric Cards**: Rounded corners (12px), subtle shadow, icon + number + label
3. **Data Tables**: Striped rows, hover highlight, sortable headers
4. **Status Badges**: Pill-shaped, color-coded (Pending=orange, Active=blue, Resolved=green, Rejected=red)
5. **Buttons**: Primary (filled), Secondary (outlined), Ghost (text only)
6. **Forms**: Floating labels, validation states, helper text
7. **Map Component**: Full-width, zoom controls, legend
8. **Chat Widget**: Rounded corners (16px), shadow, max-width 400px
9. **Notification Bell**: Badge with count, dropdown panel

---

## Chatbot Knowledge Base (For Reference)

The chatbot should be designed to answer questions about:

### Platform Information

- What is TounesHelpMap?
- How do I submit a case?
- How does the case approval process work?
- What are the case statuses?

### Cases

- How do I check my case status?
- How long does case review take?
- Can I update my submitted case?
- How do I upload photos of my case?

### People/Users

- How do I register as a helper?
- What is a Case Contact?
- How do I contact a person in need?

### Places & Locations

- Where are cases located?
- What governorates are covered?
- How do I get GPS coordinates for a location?
- Can I report a case for a specific address?

---

## Responsive Breakpoints

| Breakpoint | Width      | Layout Changes                   |
| ---------- | ---------- | -------------------------------- |
| Desktop    | ≥1280px    | Full sidebar, 4-column grid      |
| Tablet     | 768-1279px | Collapsed sidebar, 2-column grid |
| Mobile     | <768px     | Hamburger menu, single column    |

---

## Animations & Interactions

- Sidebar collapse: smooth width transition (300ms)
- Card hover: subtle lift with shadow increase
- Button press: scale down slightly (0.98)
- Page transitions: fade in (200ms)
- Chat widget: slide up from bottom-right
- Map markers: bounce on hover
- Status badge: pulse animation for pending

---

## Deliverable Requirements

Please create a Figma design that includes:

1. ✅ Admin dashboard home page with all metrics
2. ✅ Cases management page with data table
3. ✅ Users/people management page
4. ✅ Places & locations page with map
5. ✅ Chatbot interface (floating widget + expanded view)
6. ✅ Responsive mobile view
7. ✅ Component library (buttons, badges, inputs, cards)
8. ✅ Color and typography specifications