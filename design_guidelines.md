# Food Cost Manager Design Guidelines

## Design Approach
**Selected Approach**: Design System (Utility-Focused)
**System**: Material Design with custom restaurant industry adaptations
**Justification**: This is a productivity tool for restaurant management requiring efficiency, data clarity, and frequent daily use by kitchen staff and managers.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Light Mode: 25 85% 47% (deep green - representing freshness and profitability)
- Dark Mode: 25 60% 35% (muted green for reduced eye strain)

**Accent Colors:**
- Warning: 45 90% 55% (amber for waste alerts and cost warnings)
- Success: 120 50% 45% (forest green for positive metrics)
- Neutral: 220 15% 25% (charcoal for text and borders)

**Background Colors:**
- Light Mode: 0 0% 98% (near white)
- Dark Mode: 220 15% 12% (dark charcoal)

### Typography
**Font Families:** Inter (primary), JetBrains Mono (numbers/data)
**Hierarchy:**
- Headers: 600 weight, sizes from text-2xl to text-lg
- Body text: 400 weight, text-base
- Data/numbers: JetBrains Mono, 500 weight for emphasis
- Small labels: 400 weight, text-sm

### Layout System
**Spacing Units:** Tailwind units 2, 4, 6, and 8 (p-2, m-4, gap-6, h-8)
**Grid:** 12-column responsive grid with consistent gutters
**Component spacing:** 6-unit spacing between major sections, 4-unit within components

### Component Library

**Navigation:**
- Sidebar navigation with clear icons and labels
- Tab-based navigation within sections
- Breadcrumb navigation for deep sections

**Data Display:**
- Tables with alternating row colors and hover states
- Cards for recipe items and inventory summaries
- Progress bars for cost tracking and waste metrics
- Dashboard widgets with clear metric displays

**Forms:**
- Single-column layouts for data entry
- Grouped related fields with subtle borders
- Inline validation with immediate feedback
- Large touch targets for mobile use

**Actions:**
- Primary buttons: Filled with primary color
- Secondary buttons: Outline variant with primary border
- Destructive actions: Red color for delete/waste operations
- FAB (Floating Action Button) for quick "Add Item" actions

**Overlays:**
- Modal dialogs for recipe creation and editing
- Toast notifications for save confirmations
- Dropdown menus for filtering and sorting

### Responsive Design
**Mobile-first approach** with emphasis on:
- Single-column layouts on mobile
- Large tap targets (minimum 44px)
- Simplified navigation with hamburger menu
- Swipe gestures for table interactions

### Data Visualization
- Simple bar charts for cost trends
- Pie charts for waste distribution
- Color-coded indicators for cost alerts
- Progress indicators for inventory levels

## Restaurant Industry Adaptations

**Kitchen-Friendly Features:**
- High contrast for visibility in various lighting
- Large, clear numbers for quick scanning
- Minimal scrolling for frequently accessed data
- Quick-add buttons for common ingredients

**Manager Dashboard:**
- Cost alerts prominently displayed
- Profit margin indicators with traffic light colors
- Daily/weekly summary cards
- Export buttons clearly labeled and accessible

**Consistent Dark Mode:**
- All form inputs with dark backgrounds
- Maintained contrast ratios for accessibility
- Consistent styling across all interactive elements

This design prioritizes functionality and data clarity while maintaining a professional appearance suitable for daily restaurant operations.