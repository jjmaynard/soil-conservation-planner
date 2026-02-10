# Design Specifications Document
## NextJS Application Design System

**Version:** 1.0  
**Date:** February 3, 2026  
**Application:** Soil Interpretation Explorer  
**Purpose:** Reference guide for building standalone NextJS applications with consistent design

---

## Table of Contents

1. [Overview](#overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Layout & Spacing](#layout--spacing)
5. [Component Patterns](#component-patterns)
6. [UI Elements](#ui-elements)
7. [Animation & Transitions](#animation--transitions)
8. [Responsive Design](#responsive-design)
9. [Implementation Guide](#implementation-guide)

---

## Overview

### Design Philosophy
- **Natural & Earthy**: Inspired by soil and environmental themes
- **Professional**: Clean, modern interfaces suitable for scientific/technical applications
- **Accessible**: High contrast, clear hierarchy, readable typography
- **Consistent**: Reusable patterns and components across modules

### Tech Stack
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS + Custom CSS Variables
- **Icons**: Lucide React
- **Font**: Catamaran (sans-serif)

---

## Color System

### Core Philosophy
The color system is built around **natural color families** representing earth, water, sky, and vegetation themes. All colors are defined as CSS variables for consistency and easy theming.

### Color Families

#### 1. Earth Tones (Grounded, Professional)
```css
--color-earth-50: #F7F4F0;   /* Lightest - backgrounds */
--color-earth-100: #EDE6DC;
--color-earth-200: #DDD0BD;
--color-earth-300: #C9B799;
--color-earth-400: #B29D7A;
--color-earth-500: #8B6F47;   /* Base - primary brand */
--color-earth-600: #7A5F3D;
--color-earth-700: #684F33;
--color-earth-800: #563F29;
--color-earth-900: #442F1F;   /* Darkest - text */
```

**Usage**: Primary brand color, professional headers, grounded UI elements

#### 2. Ocean Blue (Information, Trust)
```css
--color-ocean-50: #F0F6F9;
--color-ocean-100: #DCE9F1;
--color-ocean-200: #BDD7E5;
--color-ocean-300: #99C0D6;
--color-ocean-400: #7AA8C4;
--color-ocean-500: #4A7C9E;   /* Base - information/links */
--color-ocean-600: #3F6A87;
--color-ocean-700: #345770;
--color-ocean-800: #294559;
--color-ocean-900: #1E3342;
```

**Usage**: Information states, links, data visualization, primary buttons
**Gradients**: `linear-gradient(135deg, #4A7C9E 0%, #345770 100%)`

#### 3. Sky Blue (Secondary, Calm)
```css
--color-sky-50: #F2F7F9;
--color-sky-100: #E2ECF1;
--color-sky-200: #C7DBE5;
--color-sky-300: #A7C6D6;
--color-sky-400: #8CB0C4;
--color-sky-500: #7BA4B5;   /* Base */
--color-sky-600: #6A8F9E;
--color-sky-700: #597A87;
--color-sky-800: #486570;
--color-sky-900: #375059;
```

**Usage**: Secondary elements, supporting UI, calm backgrounds
**Gradients**: `linear-gradient(135deg, #7BA4B5 0%, #6A8F9E 100%)`

#### 4. Forest Green (Success, Growth)
```css
--color-forest-50: #F2F6F2;
--color-forest-100: #E2EBE1;
--color-forest-200: #C7D9C6;
--color-forest-300: #A7C2A5;
--color-forest-400: #8CAB89;
--color-forest-500: #5C8D5A;   /* Base - success/conservation */
--color-forest-600: #4F7A4D;
--color-forest-700: #426740;
--color-forest-800: #355433;
--color-forest-900: #284126;
```

**Usage**: Success states, conservation themes, positive actions, environmental features
**Gradients**: `linear-gradient(135deg, #5C8D5A 0%, #4F7A4D 100%)`

#### 5. Moss Green (Soil Health)
```css
--color-moss-50: #F6F7F2;
--color-moss-100: #ECEEE1;
--color-moss-200: #D6DABF;
--color-moss-300: #BBC298;
--color-moss-400: #9BA56F;
--color-moss-500: #6B7F39;   /* Base - soil health */
--color-moss-600: #5C6F32;
--color-moss-700: #4D5E2B;
--color-moss-800: #3E4D24;
--color-moss-900: #2F3C1D;
```

**Usage**: Soil health assessments, natural growth indicators
**Gradients**: `linear-gradient(135deg, #6B7F39 0%, #5C6F32 100%)`

#### 6. Sunset Orange (Warnings, Energy)
```css
--color-sunset-50: #FAF6F2;
--color-sunset-100: #F3EAE2;
--color-sunset-200: #E9D7C7;
--color-sunset-300: #DBC0A7;
--color-sunset-400: #CAA98C;
--color-sunset-500: #B8794F;   /* Base - warnings */
--color-sunset-600: #A06843;
--color-sunset-700: #885737;
--color-sunset-800: #70462B;
--color-sunset-900: #58351F;
```

**Usage**: Erosion warnings, attention-grabbing elements, warm accents
**Gradients**: `linear-gradient(135deg, #B8794F 0%, #A06843 100%)`

#### 7. Lavender Purple (Creative, Suitability)
```css
--color-lavender-50: #F8F7FB;
--color-lavender-100: #EFECF5;
--color-lavender-200: #DDD7EA;
--color-lavender-300: #C7BDDB;
--color-lavender-400: #ADA0C8;
--color-lavender-500: #8B7AA8;   /* Base - suitability/creative */
--color-lavender-600: #7A6B92;
--color-lavender-700: #685C7C;
--color-lavender-800: #564D66;
--color-lavender-900: #443E50;
```

**Usage**: Land suitability, creative tools, interpretations
**Gradients**: `linear-gradient(135deg, #8B7AA8 0%, #7A6B92 100%)`

#### 8. Sage Green (Balanced, Environmental)
```css
--color-sage-50: #F6F8F7;
--color-sage-100: #EBF0ED;
--color-sage-200: #D4E1DB;
--color-sage-300: #B8CFC5;
--color-sage-400: #9EBDAD;
--color-sage-500: #87A096;   /* Base - environmental */
--color-sage-600: #748B81;
--color-sage-700: #61756C;
--color-sage-800: #4E5F57;
--color-sage-900: #3B4942;
```

**Usage**: Environmental tools, balanced elements, tertiary actions
**Gradients**: `linear-gradient(135deg, #87A096 0%, #748B81 100%)`

#### 9. Slate Gray (UI Elements, Text)
```css
--color-slate-50: #F7F8F8;
--color-slate-100: #EDEEEE;
--color-slate-200: #D8DBDB;
--color-slate-300: #BFC4C4;
--color-slate-400: #A1A9A9;
--color-slate-500: #6B7D7D;   /* Base - UI elements */
--color-slate-600: #5C6C6C;   /* Secondary text */
--color-slate-700: #4D5B5B;
--color-slate-800: #3E4A4A;   /* Body text */
--color-slate-900: #2F3939;
```

**Usage**: Text, borders, neutral UI elements, assessment tools

#### 10. Charcoal (Primary Text)
```css
--color-charcoal-50: #F6F6F7;
--color-charcoal-100: #EBEBED;
--color-charcoal-200: #D2D2D7;
--color-charcoal-300: #B5B5BD;
--color-charcoal-400: #94949F;
--color-charcoal-500: #4A4A52;
--color-charcoal-600: #404047;
--color-charcoal-700: #36363C;
--color-charcoal-800: #2C2C31;   /* Primary text */
--color-charcoal-900: #222226;   /* Headings */
```

**Usage**: Primary headings, body text, high contrast elements

#### 11. Cream (Warm Backgrounds)
```css
--color-cream-50: #FEFDFB;
--color-cream-100: #FCFAF6;
--color-cream-200: #F8F4ED;   /* Primary background */
--color-cream-300: #F2EBE0;
--color-cream-400: #EADFD0;
--color-cream-500: #F5F1E8;
--color-cream-600: #DDD3C5;
--color-cream-700: #C5B5A2;
--color-cream-800: #AD977F;
--color-cream-900: #95795C;
```

**Usage**: Page backgrounds, warm neutral surfaces

#### 12. Clay Red (Errors)
```css
--color-clay-50: #FDF7F6;
--color-clay-100: #F9EDEC;
--color-clay-200: #F1D7D5;
--color-clay-300: #E6BCB9;
--color-clay-400: #D69E99;
--color-clay-500: #A0453D;   /* Base - errors */
--color-clay-600: #8B3C35;
--color-clay-700: #75332D;
--color-clay-800: #5F2A25;
--color-clay-900: #49211D;
```

**Usage**: Error states, destructive actions, critical warnings

#### 13. Amber (Caution)
```css
--color-amber-50: #FDFCF7;
--color-amber-100: #F9F5E8;
--color-amber-200: #F2EAD3;
--color-amber-300: #E8DBB8;
--color-amber-400: #DBC898;
--color-amber-500: #D4A853;   /* Base - caution */
--color-amber-600: #BE9548;
--color-amber-700: #A07F3C;
--color-amber-800: #826930;
--color-amber-900: #645324;
```

**Usage**: Caution states, moderate warnings, attention needs

### Semantic Color Assignments

```css
/* Primary Actions & Links */
--color-primary: var(--color-ocean-500);
--color-primary-hover: var(--color-ocean-600);
--color-primary-light: var(--color-ocean-100);
--color-primary-dark: var(--color-ocean-800);

/* Secondary Actions */
--color-secondary: var(--color-sky-500);
--color-secondary-hover: var(--color-sky-600);
--color-secondary-light: var(--color-sky-100);

/* Success States */
--color-success: var(--color-forest-500);
--color-success-hover: var(--color-forest-600);
--color-success-light: var(--color-forest-100);

/* Information */
--color-info: var(--color-ocean-500);
--color-info-light: var(--color-ocean-100);

/* Warnings */
--color-warning: var(--color-sunset-500);
--color-warning-light: var(--color-sunset-100);

/* Errors */
--color-error: var(--color-clay-500);
--color-error-light: var(--color-clay-100);

/* Conservation/Environmental Themes */
--color-conservation: var(--color-forest-500);
--color-soil-health: var(--color-moss-500);
--color-environmental: var(--color-sage-500);
--color-assessment: var(--color-slate-600);
--color-mapping: var(--color-ocean-700);
```

### Background Colors

```css
/* Primary Page Background */
background-color: #F8F4ED;  /* Warm cream */

/* Card/Panel Backgrounds */
background-color: #FFFFFF;  /* White */
background-color: #FEFDFB;  /* Off-white/cream */

/* Accent Backgrounds */
background-color: #F9FAFB;  /* Cool light gray */
```

---

## Typography

### Font Family
```css
--font-catamaran: 'Catamaran', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                  'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 
                  'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes & Hierarchy

```css
/* Headings */
h1: 4xl-6xl (2.25rem - 3.75rem)  /* Hero titles */
h2: 3xl-4xl (1.875rem - 2.25rem) /* Section headers */
h3: 2xl (1.5rem)                  /* Subsection headers */
h4: xl (1.25rem)                  /* Card titles */
h5: lg (1.125rem)                 /* Small headings */
h6: base (1rem)                   /* Labels */

/* Body Text */
Base: 18px / 24px (1.125rem)     /* Primary body text */
lg: 1.125rem - 1.25rem            /* Larger body */
sm: 0.875rem                      /* Secondary text */
xs: 0.75rem                       /* Labels, captions */

/* Base configuration (Tailwind) */
fontSize: {
  base: ['18px', '24px'],
}
```

### Font Weights
```css
font-weight: 400;  /* Regular - body text */
font-weight: 500;  /* Medium - emphasis */
font-weight: 600;  /* Semibold - labels */
font-weight: 700;  /* Bold - headings */
```

### Text Colors
```css
/* Primary Text */
color: #2C2C31;  /* --color-charcoal-800 */
color: #3E4A4A;  /* --color-slate-800 */

/* Secondary Text */
color: #5C6C6C;  /* --color-slate-600 */
color: #6B7D7D;  /* --color-slate-500 */

/* Muted Text */
color: #A1A9A9;  /* --color-slate-400 */

/* Headings */
color: #222226;  /* --color-charcoal-900 */
color: #2C3E50;  /* Custom dark blue-gray */
```

---

## Layout & Spacing

### Container System

```jsx
/* Standard Container */
<div className="container mx-auto px-4">
  {/* Content */}
</div>

/* Page Layout */
<div className="min-h-screen" style={{ backgroundColor: '#F8F4ED' }}>
  {/* Header */}
  {/* Main Content */}
</div>

/* Content Padding */
<div className="p-4 md:p-6">  /* Mobile: 16px, Desktop: 24px */
```

### Spacing Scale (Tailwind)
```css
p-1:  0.25rem (4px)
p-2:  0.5rem  (8px)
p-3:  0.75rem (12px)
p-4:  1rem    (16px)  /* Standard small spacing */
p-6:  1.5rem  (24px)  /* Standard medium spacing */
p-8:  2rem    (32px)  /* Standard large spacing */
p-12: 3rem    (48px)  /* Extra large spacing */
p-16: 4rem    (64px)  /* Section spacing */

/* Gaps (for flex/grid) */
gap-2: 0.5rem  (8px)
gap-3: 0.75rem (12px)
gap-4: 1rem    (16px)  /* Standard */
gap-6: 1.5rem  (24px)
gap-8: 2rem    (32px)
```

### Grid Systems

```jsx
/* Module Grid (Dashboard) */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Cards */}
</div>

/* Two Column Layout */
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Items */}
</div>

/* Three Column Layout */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>

/* Stat Cards */
<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
  {/* Stats */}
</div>
```

### Section Spacing
```jsx
/* Hero Section */
<section className="py-16 md:py-24">

/* Content Section */
<section className="py-12 md:py-16">

/* Compact Section */
<section className="py-8 md:py-12">
```

---

## Component Patterns

### 1. Hero Section

```jsx
<section
  className="relative text-white overflow-hidden"
  style={{
    background: 'linear-gradient(135deg, #1a4d2e, #2d6a4f, #1b4965)',
  }}
>
  {/* Background Pattern (Optional) */}
  <div className="absolute inset-0 opacity-10">
    {/* SVG pattern or decorative elements */}
  </div>

  <div className="relative container mx-auto px-4 py-16 md:py-24">
    <div className="max-w-4xl">
      {/* Badge/Logo */}
      <div className="inline-flex items-center gap-2 bg-white bg-opacity-20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
        <Image src="/logo.png" alt="Logo" width={32} height={32} />
        <span className="text-sm font-semibold">Organization Name</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        Page Title
      </h1>

      {/* Subheading */}
      <p className="text-xl md:text-2xl mb-8 leading-relaxed" 
         style={{ color: '#E2EBE1' }}>
        Descriptive subtitle
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <Link
          href="/primary-action"
          className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          style={{ backgroundColor: '#ffffff', color: '#355433' }}
        >
          <Icon className="mr-2 w-5 h-5" />
          Primary Action
        </Link>

        <Link
          href="/secondary-action"
          className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:bg-opacity-10 hover:scale-105 transition-all duration-200 backdrop-blur-sm"
        >
          <Icon className="mr-2 w-5 h-5" />
          Secondary Action
        </Link>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" 
           style={{ color: '#E2EBE1' }}>
        <div className="flex flex-col items-center text-center">
          <div className="bg-white bg-opacity-10 rounded-full p-3 mb-2 backdrop-blur-sm">
            <Icon className="w-6 h-6" />
          </div>
          <div className="text-sm font-medium">Feature Name</div>
        </div>
        {/* Repeat for other features */}
      </div>
    </div>
  </div>
</section>
```

### 2. Module/Feature Card

```jsx
<Link
  href={path}
  className="group rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
  style={{ backgroundColor: '#FEFDFB' }}
>
  {/* Gradient Header with Icon */}
  <div
    className="p-6 text-white relative overflow-hidden"
    style={{
      background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
    }}
  >
    {/* Decorative Background */}
    <div className="absolute -right-4 -top-4 opacity-10">
      <Icon className="w-32 h-32" />
    </div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-3">
        <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
          <Icon className="w-8 h-8" />
        </div>
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
  </div>

  {/* Content */}
  <div className="p-6 flex-1 flex flex-col">
    <p className="mb-4 text-sm leading-relaxed flex-1" 
       style={{ color: '#5C6C6C' }}>
      {description}
    </p>

    {/* Features List */}
    <ul className="space-y-1 mb-4">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-center text-xs" 
            style={{ color: '#3E4A4A' }}>
          <svg className="w-3 h-3 mr-2 flex-shrink-0" 
               style={{ color: '#5C8D5A' }}
               fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" />
          </svg>
          {feature}
        </li>
      ))}
    </ul>

    {/* Stats Footer */}
    <div className="pt-3" style={{ borderTop: '1px solid #D8DBDB' }}>
      <div className="flex justify-between items-center text-xs">
        <span style={{ color: '#6B7D7D' }}>{statLabel}</span>
        <span className="font-semibold text-sm" 
              style={{ color: '#3E4A4A' }}>{statValue}</span>
      </div>
    </div>
  </div>
</Link>
```

### 3. Stat Card

```jsx
<div 
  className="group relative rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-8 text-center border border-gray-100 overflow-hidden" 
  style={{ background: gradientBg }}
>
  {/* Top Accent Line */}
  <div 
    className="absolute top-0 left-0 right-0 h-1 opacity-60" 
    style={{ background: accentColor }}
  />
  
  {/* Icon */}
  <div
    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300"
    style={{ backgroundColor: iconBg, color: iconColor }}
  >
    <Icon className="w-8 h-8" />
  </div>
  
  {/* Value */}
  <div className="text-2xl md:text-3xl font-bold mb-2" 
       style={{ color: textColor }}>
    {value}
  </div>
  
  {/* Label */}
  <div className="text-sm font-medium" style={{ color: labelColor }}>
    {label}
  </div>
</div>
```

### 4. Page Header

```jsx
<div 
  className="mb-6 rounded-lg shadow-lg text-white"
  style={{ 
    background: 'linear-gradient(to right, var(--color-conservation), var(--color-forest-700), var(--color-forest-800))' 
  }}
>
  <div className="px-6 py-4">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-forest-100)' }}>
          Subtitle or description
        </p>
      </div>
    </div>
  </div>
</div>
```

### 5. Action Button

```jsx
/* Primary Button */
<button
  className="px-6 py-3 text-white rounded-lg shadow-md transition-colors"
  style={{ 
    background: 'linear-gradient(to right, #16a34a, #15803d)' 
  }}
  onMouseEnter={(e) => 
    e.currentTarget.style.background = 'linear-gradient(to right, #15803d, #166534)'
  }
  onMouseLeave={(e) => 
    e.currentTarget.style.background = 'linear-gradient(to right, #16a34a, #15803d)'
  }
>
  Button Text
</button>

/* Secondary Button */
<button
  className="px-6 py-3 rounded-lg transition-colors"
  style={{ backgroundColor: '#f3f4f6', color: '#374151' }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
>
  Button Text
</button>

/* Outline Button */
<button
  className="px-6 py-3 rounded-lg transition-colors border-2"
  style={{ 
    borderColor: 'var(--color-conservation)', 
    color: 'var(--color-conservation)' 
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--color-conservation)'
    e.currentTarget.style.color = '#ffffff'
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'transparent'
    e.currentTarget.style.color = 'var(--color-conservation)'
  }}
>
  Button Text
</button>
```

### 6. Info Alert/Banner

```jsx
<div className="alert-info rounded-lg p-4">
  <div className="flex items-start">
    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 text-info" />
    <div className="text-sm text-info-dark">
      <p className="font-medium mb-1">Alert Title</p>
      <p>Alert message content goes here.</p>
    </div>
  </div>
</div>
```

### 7. Modal Pattern

```jsx
<div className="fixed inset-0 z-50 overflow-y-auto">
  {/* Backdrop */}
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
    onClick={onClose}
  />
  
  {/* Modal */}
  <div className="flex min-h-screen items-center justify-center p-4">
    <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div 
        className="p-6 sticky top-0 z-10"
        style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Icon className="mr-3 text-white w-8 h-8" />
              Modal Title
            </h2>
          </div>
          <button
            onClick={onClose}
            className="transition-colors text-white hover:text-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        {/* Content here */}
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 px-6 py-4" 
           style={{ backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
        <button
          onClick={onClose}
          className="w-full px-6 py-2 rounded-lg shadow-md transition-colors text-white"
          style={{ background: 'linear-gradient(to right, #16a34a, #15803d)' }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
</div>
```

### 8. Tab Navigation

```jsx
<div className="grid grid-cols-3 border-b border-gray-200" 
     style={{ backgroundColor: '#ffffff' }}>
  <button
    onClick={() => setTab('tab1')}
    className="px-4 py-3 text-sm font-medium transition-all border-b-2"
    style={{
      color: activeTab === 'tab1' ? '#1f2937' : '#6b7280',
      borderBottomColor: activeTab === 'tab1' ? 'var(--color-conservation)' : 'transparent',
      backgroundColor: activeTab === 'tab1' ? '#ffffff' : '#f3f4f6'
    }}
  >
    Tab 1
  </button>
  {/* Repeat for other tabs */}
</div>
```

---

## UI Elements

### Border Radius
```css
rounded-sm:   0.125rem (2px)
rounded:      0.25rem  (4px)
rounded-md:   0.375rem (6px)
rounded-lg:   0.5rem   (8px)   /* Standard cards */
rounded-xl:   0.75rem  (12px)  /* Feature cards */
rounded-2xl:  1rem     (16px)  /* Hero elements */
rounded-full: 9999px           /* Pills, badges, icons */
```

### Shadows
```css
/* Light Shadows */
shadow-sm:  0 1px 2px 0 rgba(0, 0, 0, 0.05)
shadow:     0 1px 3px 0 rgba(0, 0, 0, 0.1)

/* Standard Shadows */
shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1)  /* Cards */
shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1) /* Headers */

/* Heavy Shadows */
shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1)  /* Modals */
shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25) /* Hover states */
```

### Borders
```css
/* Border Width */
border:   1px
border-2: 2px
border-4: 4px

/* Border Colors */
border-gray-100: #f3f4f6  /* Subtle */
border-gray-200: #e5e7eb  /* Standard */
border-gray-300: #d1d5db  /* Visible */

/* Custom Border Colors */
style={{ borderColor: '#D8DBDB' }}  /* Slate-200 */
style={{ borderColor: '#BFC4C4' }}  /* Slate-300 */
```

### Opacity
```css
opacity-10: 10%  /* Decorative elements */
opacity-20: 20%  /* Overlays */
opacity-30: 30%
opacity-50: 50%
opacity-60: 60%
opacity-80: 80%
```

### Backdrop Blur
```css
backdrop-blur-sm: blur(4px)   /* Glassmorphism */
backdrop-blur:    blur(8px)
backdrop-blur-md: blur(12px)
```

---

## Animation & Transitions

### Standard Transitions
```css
transition-all duration-200     /* Quick interactions */
transition-all duration-300     /* Standard (cards, buttons) */
transition-colors duration-300  /* Color changes only */
transition-transform duration-300 /* Transform only */
```

### Hover Effects

```jsx
/* Card Hover */
className="hover:shadow-2xl hover:scale-105 transition-all duration-300"

/* Button Hover */
className="hover:scale-105 transition-transform duration-200"

/* Icon Hover */
className="group-hover:scale-110 transition-transform duration-300"

/* Background Hover */
onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hoverColor}
onMouseLeave={(e) => e.currentTarget.style.backgroundColor = normalColor}
```

### Loading Spinner

```jsx
<div className="flex items-center justify-center p-12">
  <div 
    className="animate-spin rounded-full h-12 w-12 mx-auto mb-4" 
    style={{ 
      border: '3px solid #e5e7eb', 
      borderTopColor: 'var(--color-conservation)' 
    }}
  />
  <p style={{ color: '#5C6C6C' }}>Loading...</p>
</div>
```

### Fade In
```css
/* CSS */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}
```

---

## Responsive Design

### Breakpoints (Tailwind)
```css
sm:   640px   /* Small tablets */
md:   768px   /* Tablets */
lg:   1024px  /* Desktops */
xl:   1280px  /* Large desktops */
2xl:  1536px  /* Extra large */
```

### Responsive Patterns

```jsx
/* Text Sizing */
<h1 className="text-3xl md:text-4xl lg:text-6xl">Heading</h1>

/* Padding/Spacing */
<div className="p-4 md:p-6 lg:p-8">Content</div>
<section className="py-8 md:py-12 lg:py-16">Section</section>

/* Grid Columns */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
  {/* Items */}
</div>

/* Flex Direction */
<div className="flex flex-col sm:flex-row gap-4">
  {/* Items */}
</div>

/* Hidden/Visible */
<div className="hidden md:block">Desktop Only</div>
<div className="block md:hidden">Mobile Only</div>
```

---

## Implementation Guide

### 1. Project Setup

```bash
# Create Next.js app
npx create-next-app@latest my-app --typescript --tailwind --app

# Install dependencies
npm install lucide-react
```

### 2. Configure Tailwind (tailwind.config.js)

```javascript
const colors = require('tailwindcss/colors')
const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color system
        ocean: {
          50: 'var(--color-ocean-50)',
          100: 'var(--color-ocean-100)',
          200: 'var(--color-ocean-200)',
          300: 'var(--color-ocean-300)',
          400: 'var(--color-ocean-400)',
          500: 'var(--color-ocean-500)',
          600: 'var(--color-ocean-600)',
          700: 'var(--color-ocean-700)',
          800: 'var(--color-ocean-800)',
          900: 'var(--color-ocean-900)',
        },
        forest: {
          50: 'var(--color-forest-50)',
          100: 'var(--color-forest-100)',
          200: 'var(--color-forest-200)',
          300: 'var(--color-forest-300)',
          400: 'var(--color-forest-400)',
          500: 'var(--color-forest-500)',
          600: 'var(--color-forest-600)',
          700: 'var(--color-forest-700)',
          800: 'var(--color-forest-800)',
          900: 'var(--color-forest-900)',
        },
        // Add other color families as needed
        conservation: 'var(--color-conservation)',
        'soil-health': 'var(--color-soil-health)',
      },
      fontSize: {
        base: ['18px', '24px'],
      },
      fontFamily: {
        sans: ['var(--font-catamaran)', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
}
```

### 3. Create Color System CSS (src/styles/color-system.css)

Copy the complete color system from the Color System section above.

### 4. Import Styles (src/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './styles/color-system.css';

body {
  background-color: var(--color-background);
}

/* Add custom scrollbar styles, etc. */
```

### 5. App Layout (src/app/layout.tsx)

```tsx
import { Catamaran } from 'next/font/google'
import './globals.css'

const catamaran = Catamaran({ 
  subsets: ['latin'],
  variable: '--font-catamaran',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={catamaran.variable}>
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
```

### 6. Example Page Implementation

```tsx
import Link from 'next/link'
import { Globe, Map, Sprout } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F4ED' }}>
      {/* Hero Section */}
      <section
        className="relative text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a4d2e, #2d6a4f, #1b4965)',
        }}
      >
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Application Title
          </h1>
          <p className="text-xl mb-8" style={{ color: '#E2EBE1' }}>
            Your subtitle here
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-lg hover:scale-105 transition-all duration-200 shadow-lg"
              style={{ backgroundColor: '#ffffff', color: '#355433' }}
            >
              <Globe className="mr-2 w-5 h-5" />
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature cards here */}
        </div>
      </section>
    </div>
  )
}
```

---

## Module-Specific Color Schemes

When building standalone apps from modules, use these gradient combinations:

### Soil Maps & Data
- **Primary**: Ocean Blue
- **Gradient**: `linear-gradient(135deg, #4A7C9E 0%, #3F6A87 100%)`
- **Accent**: Sky Blue (#7BA4B5)

### Field Analysis
- **Primary**: Sky Blue
- **Gradient**: `linear-gradient(135deg, #7BA4B5 0%, #6A8F9E 100%)`
- **Accent**: Ocean Blue (#4A7C9E)

### Conservation Practices
- **Primary**: Forest Green
- **Gradient**: `linear-gradient(135deg, #5C8D5A 0%, #4F7A4D 100%)`
- **Accent**: Moss Green (#6B7F39)

### Soil Health
- **Primary**: Moss Green
- **Gradient**: `linear-gradient(135deg, #6B7F39 0%, #5C6F32 100%)`
- **Accent**: Forest Green (#5C8D5A)

### Erosion/RUSLE Tools
- **Primary**: Sunset Orange
- **Gradient**: `linear-gradient(135deg, #B8794F 0%, #A06843 100%)`
- **Accent**: Amber (#D4A853)

### Land Suitability
- **Primary**: Lavender Purple
- **Gradient**: `linear-gradient(135deg, #8B7AA8 0%, #7A6B92 100%)`
- **Accent**: Sage Green (#87A096)

### Environmental/Assessment
- **Primary**: Sage Green
- **Gradient**: `linear-gradient(135deg, #87A096 0%, #748B81 100%)`
- **Accent**: Slate Gray (#6B7D7D)

---

## Best Practices

### 1. Color Usage
- Always use CSS variables for colors (e.g., `var(--color-forest-500)`)
- Maintain consistent semantic meanings (green = success, red = error)
- Use light backgrounds (#F8F4ED, #FFFFFF) with dark text (#2C2C31)
- Apply gradients to headers and primary CTAs for visual interest

### 2. Typography
- Keep line heights comfortable (1.5-1.75 for body text)
- Limit line length to 60-80 characters for readability
- Use hierarchy: h1 → h2 → h3 with consistent sizing jumps
- Reserve bold weights for headings and emphasis

### 3. Spacing
- Use consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px)
- Apply more padding on larger screens (p-4 md:p-6)
- Use gap utilities for flex/grid layouts
- Maintain vertical rhythm with consistent section spacing

### 4. Components
- Build reusable components for common patterns
- Use inline styles sparingly (prefer Tailwind classes)
- Keep components focused and single-purpose
- Implement responsive behavior with mobile-first approach

### 5. Accessibility
- Maintain WCAG AA contrast ratios (4.5:1 for text)
- Include hover and focus states for interactive elements
- Use semantic HTML (header, nav, main, section, article)
- Add alt text for images, aria-labels for icons

### 6. Performance
- Lazy load images and heavy components
- Use Next.js Image component for optimization
- Minimize inline styles (prefer CSS variables)
- Keep bundle size small with tree-shaking

---

## Quick Reference

### Common Gradients
```css
/* Primary Hero */
background: linear-gradient(135deg, #1a4d2e, #2d6a4f, #1b4965);

/* Ocean/Info */
background: linear-gradient(135deg, #4A7C9E 0%, #345770 100%);

/* Forest/Success */
background: linear-gradient(to right, #16a34a, #15803d, #166534);

/* Sunset/Warning */
background: linear-gradient(135deg, #B8794F 0%, #A06843 100%);
```

### Common Text Colors
```css
/* Headings */
color: #222226;  /* Charcoal-900 */
color: #2C2C31;  /* Charcoal-800 */

/* Body Text */
color: #3E4A4A;  /* Slate-800 */
color: #2C3E50;  /* Custom dark */

/* Secondary Text */
color: #5C6C6C;  /* Slate-600 */
color: #6B7D7D;  /* Slate-500 */

/* Muted Text */
color: #A1A9A9;  /* Slate-400 */
```

### Common Backgrounds
```css
/* Page Background */
backgroundColor: #F8F4ED;  /* Cream */

/* Card Background */
backgroundColor: #FFFFFF;  /* White */
backgroundColor: #FEFDFB;  /* Off-white */

/* Accent Backgrounds */
backgroundColor: #F9FAFB;  /* Cool gray */
```

---

## AI Agent Instructions

When building a new application using this design system:

1. **Start with the color system**: Copy the complete `color-system.css` file
2. **Configure Tailwind**: Use the provided tailwind.config.js setup
3. **Choose a module theme**: Select appropriate colors from Module-Specific Color Schemes
4. **Build from patterns**: Use the Component Patterns as templates
5. **Maintain consistency**: Reference this document for spacing, typography, and UI elements
6. **Test responsively**: Use the responsive patterns for mobile-first design
7. **Follow best practices**: Adhere to the accessibility and performance guidelines

### Example Prompt for AI Agent:
"Build a NextJS application for [module name]. Use the Ocean Blue color scheme (#4A7C9E) with the gradient pattern. Include a hero section, feature cards using the module card pattern, and a stats section. Follow the typography hierarchy with Catamaran font. Use the cream background (#F8F4ED) and maintain all spacing conventions from the design system."

---

**End of Design Specifications Document**

*This document should be provided to AI agents or developers building new standalone applications derived from the Soil Interpretation Explorer modules. All color values, patterns, and code examples are production-ready and tested.*
