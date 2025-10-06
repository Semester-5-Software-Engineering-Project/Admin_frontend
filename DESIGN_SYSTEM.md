# 🎨 TutorVerse Design System

## Color Palette

Our design system is built on a carefully crafted color scheme that ensures visual hierarchy, accessibility, and aesthetic appeal.

### Primary Colors

#### White (Primary)
- **Primary Use**: Main backgrounds, cards, and content areas
- **Shades**: #FFFFFF, #FAFAFA, #F5F5F5
- **Usage**: Creates clean, spacious layouts with excellent readability

#### Yellow (Secondary) 
- **Primary Use**: Call-to-action buttons, active states, highlights
- **Main Color**: #FBBF24 (Amber 400)
- **Gradient**: `from-yellow-400 to-yellow-500`
- **Usage**: Draws attention, energetic accents, success indicators

#### Grey (Tertiary)
- **Primary Use**: Text, borders, secondary elements
- **Main Color**: #6B7280 (Gray 500)
- **Range**: From #F9FAFB to #111827
- **Usage**: Typography hierarchy, subtle backgrounds, borders

#### Black (Quaternary)
- **Primary Use**: Headlines, strong contrast, premium feel
- **Main Color**: #000000
- **Usage**: Primary text, dark mode backgrounds, bold statements

## Typography

### Font Families
- **Display Font**: Poppins (Headings, Logos, Important CTAs)
- **Body Font**: Inter (Body text, UI elements)

### Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Component Styling

### Cards
```tsx
// Default Card
<Card variant="default" hoverable>
  // White background, subtle shadow, yellow border on hover
</Card>

// Elevated Card
<Card variant="elevated">
  // Enhanced shadow, premium feel
</Card>

// Bordered Card
<Card variant="bordered">
  // Visible border, minimal shadow
</Card>
```

### Buttons
```tsx
// Primary Yellow Button
<Button variant="primary">
  // Gradient from yellow-400 to yellow-500
  // Black text, bold font, shadow-lg
</Button>

// Secondary Black Button
<Button variant="secondary">
  // Black background, white text
  // 2px border, shadow-md
</Button>

// Outline Button
<Button variant="outline">
  // Yellow border, transparent background
  // Fills with yellow on hover
</Button>
```

### Badges
- **Default**: Grey background with darker text
- **Success**: Green accent with subtle background
- **Warning**: Yellow gradient with bold text
- **Danger**: Red accent with soft background
- **Info**: Blue accent with light background

## Animations

### Standard Animations
- **Fade In**: 0.4s ease-in-out
- **Slide In**: 0.4s ease-out
- **Slide Up**: 0.4s ease-out
- **Hover Scale**: 1.05 to 1.1
- **Shadow Transitions**: 200-300ms

### Special Effects
- **Shimmer**: Loading states with yellow highlight
- **Pulse**: Yellow notification badges
- **Gradient Animation**: 3s infinite background shift
- **Bounce**: Subtle attention-grabbing elements

## Shadows

- **Soft**: `0 2px 8px rgba(0, 0, 0, 0.06)` - Subtle elevation
- **Medium**: `0 4px 16px rgba(0, 0, 0, 0.1)` - Card hover states
- **Strong**: `0 8px 24px rgba(0, 0, 0, 0.15)` - Modals, dropdowns
- **Yellow**: `0 4px 20px rgba(251, 191, 36, 0.3)` - Yellow accent glow
- **Yellow-lg**: `0 8px 30px rgba(251, 191, 36, 0.4)` - Strong yellow emphasis

## Border Radius

- **sm**: 0.5rem (8px)
- **md**: 0.75rem (12px)
- **lg**: 1rem (16px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 2rem (32px)
- **4xl**: 2.5rem (40px)
- **full**: 9999px (Circular)

## Spacing Scale

Following Tailwind's standard spacing scale:
- 1 = 0.25rem (4px)
- 2 = 0.5rem (8px)
- 3 = 0.75rem (12px)
- 4 = 1rem (16px)
- 6 = 1.5rem (24px)
- 8 = 2rem (32px)
- 12 = 3rem (48px)
- 16 = 4rem (64px)

## Gradients

### Yellow Gradient
```css
bg-gradient-to-r from-yellow-400 to-yellow-500
```
**Usage**: Primary buttons, active nav items, highlights

### Black Gradient
```css
bg-gradient-to-br from-black via-gray-900 to-gray-800
```
**Usage**: Premium cards, dark sections, contrast areas

### Background Gradients
```css
bg-gradient-to-br from-gray-50 via-white to-gray-100
```
**Usage**: Page backgrounds, subtle depth

## Best Practices

### Accessibility
- Maintain WCAG AA contrast ratios (4.5:1 for normal text)
- Use yellow on white or black for maximum visibility
- Provide focus states with yellow ring
- Include proper ARIA labels

### Visual Hierarchy
1. **Primary Action**: Yellow gradient button
2. **Secondary Action**: Black button or outline
3. **Tertiary Action**: Ghost button

### Hover States
- Scale: 1.05 to 1.1
- Shadow increase: soft → medium → strong
- Color shifts: grey → yellow accent
- Border: transparent → yellow

### Layout Patterns
- Consistent card spacing: 1.5rem (24px)
- Grid gaps: 1.5rem (24px)
- Section padding: 2rem (32px) mobile, 3rem (48px) desktop
- Max content width: 1280px

## Icon System

Using **Lucide React** for consistent, modern icons
- Icon size: 20px (default), 24px (headers), 16px (inline)
- Icon color: Inherits from parent or grey-500
- Icon animations: Scale on hover, rotate on interaction

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Mobile-First Approach
Design for mobile, enhance for desktop
- Stack cards on mobile
- Grid layouts on tablet+
- Full sidebar on desktop

## Motion Principles

1. **Purposeful**: Every animation serves a function
2. **Subtle**: Smooth, not distracting (200-400ms)
3. **Consistent**: Same timing functions throughout
4. **Responsive**: Respect user's motion preferences

## Component Examples

### Stat Card
```tsx
<Card hoverable className="group">
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-600 text-sm font-semibold">Total Students</p>
        <h3 className="text-3xl font-bold text-black group-hover:text-yellow-600">2,847</h3>
        <span className="text-sm font-bold text-green-600">+12.5%</span>
      </div>
      <div className="p-3 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform">
        <Users size={24} className="text-blue-500" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Hero Card
```tsx
<Card className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black">
  <CardContent className="p-8">
    <h1 className="text-4xl font-display font-bold mb-2">
      Welcome back, Admin! 👋
    </h1>
    <p className="text-black/80 text-lg font-semibold">
      Here's what's happening today.
    </p>
  </CardContent>
</Card>
```

## Maintenance

### Adding New Colors
1. Update `tailwind.config.ts`
2. Document in this guide
3. Test contrast ratios
4. Update component examples

### Version Control
Current Version: 1.0.0
Last Updated: October 2025
Maintained by: TutorVerse Team
