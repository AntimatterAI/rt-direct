# RT Direct Brand Guidelines

## 🎯 **Brand Mission**
*Connecting radiologic technologists with their ideal career opportunities through innovative technology and human-centered design.*

---

## 🎨 **Color Palette**

### **Primary Healthcare Colors**

#### **Medical Blue**
- `#0A58CA` - Primary brand color (trust, professionalism)
- `#3B82F6` - Interactive elements, buttons
- `#60A5FA` - Hover states, accents
- `#DBEAFE` - Light backgrounds, subtle highlights

#### **Clinical Green** 
- `#059669` - Success states, positive actions
- `#10B981` - Secondary actions, confirmations
- `#6EE7B7` - Success backgrounds
- `#D1FAE5` - Light success backgrounds

#### **Precision Gray**
- `#374151` - Primary text, headers
- `#6B7280` - Secondary text, descriptions
- `#9CA3AF` - Placeholder text, disabled states
- `#F3F4F6` - Card backgrounds, dividers
- `#FFFFFF` - Main backgrounds

#### **Accent Colors**
- `#7C3AED` - Premium features, highlights (Purple)
- `#F59E0B` - Warnings, attention states (Amber)
- `#EF4444` - Errors, critical states (Red)
- `#8B5CF6` - Interactive hover states (Light Purple)

### **Gradient System**
```css
/* Hero Gradients */
.gradient-hero: linear-gradient(135deg, #0A58CA 0%, #7C3AED 100%)
.gradient-card: linear-gradient(135deg, #3B82F6 0%, #10B981 100%)
.gradient-accent: linear-gradient(135deg, #60A5FA 0%, #8B5CF6 100%)

/* Background Gradients */
.gradient-subtle: linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)
.gradient-warm: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)
```

---

## 📝 **Typography**

### **Font Stack**
- **Primary**: `Inter` - Modern, clean, highly legible
- **Headings**: `Inter` (600-700 weight)
- **Body**: `Inter` (400-500 weight)
- **Code**: `JetBrains Mono` - For technical content

### **Type Scale**
```css
/* Headers */
.text-hero: 3.5rem (56px) - Hero headlines
.text-h1: 2.5rem (40px) - Page titles
.text-h2: 2rem (32px) - Section headers
.text-h3: 1.5rem (24px) - Subsections
.text-h4: 1.25rem (20px) - Card titles

/* Body Text */
.text-lg: 1.125rem (18px) - Large body text
.text-base: 1rem (16px) - Default body text
.text-sm: 0.875rem (14px) - Small text, captions
.text-xs: 0.75rem (12px) - Fine print, labels
```

### **Font Weights**
- `400` - Regular body text
- `500` - Medium emphasis
- `600` - Semibold headers
- `700` - Bold emphasis

---

## 🏥 **Healthcare Icons**

### **Icon Library: Lucide React**
Consistent, modern, and healthcare-focused icons.

#### **Core Healthcare Icons**
- `Stethoscope` - Medical professionals
- `Activity` - Health monitoring, vital signs
- `Heart` - Patient care, wellness
- `Shield` - Safety, protection, verification
- `Users` - Teams, community
- `MapPin` - Location services
- `Clock` - Scheduling, time-sensitive
- `Star` - Quality, ratings, favorites
- `Award` - Certifications, achievements
- `TrendingUp` - Growth, career advancement

#### **Professional Icons**
- `Building` - Healthcare facilities
- `GraduationCap` - Education, certifications
- `FileText` - Documents, applications
- `Search` - Job search, discovery
- `Filter` - Sorting, preferences
- `Bell` - Notifications, alerts
- `Settings` - User preferences
- `Plus` - Add new, create

---

## 🎯 **UI Components Style Guide**

### **Buttons**

#### **Primary Buttons**
```css
/* Style */
background: #3B82F6
color: white
padding: 12px 24px
border-radius: 8px
font-weight: 500
box-shadow: 0 1px 3px rgba(0,0,0,0.1)

/* Hover */
background: #2563EB
transform: translateY(-1px)
box-shadow: 0 4px 12px rgba(59,130,246,0.4)
```

#### **Secondary Buttons**
```css
/* Style */
border: 1px solid #D1D5DB
background: white
color: #374151
padding: 12px 24px
border-radius: 8px

/* Hover */
background: #F9FAFB
border-color: #9CA3AF
```

### **Cards**
```css
/* Standard Card */
background: white
border-radius: 12px
border: 1px solid #E5E7EB
box-shadow: 0 1px 3px rgba(0,0,0,0.1)
padding: 24px

/* Hover State */
box-shadow: 0 4px 12px rgba(0,0,0,0.15)
transform: translateY(-2px)
```

### **Form Elements**
```css
/* Input Fields */
border: 1px solid #D1D5DB
border-radius: 6px
padding: 12px 16px
font-size: 16px
background: white

/* Focus State */
border-color: #3B82F6
box-shadow: 0 0 0 3px rgba(59,130,246,0.1)
```

### **Badges**
```css
/* Primary Badge */
background: #DBEAFE
color: #1E40AF
padding: 4px 12px
border-radius: 16px
font-size: 14px
font-weight: 500

/* Success Badge */
background: #D1FAE5
color: #047857

/* Warning Badge */
background: #FEF3C7
color: #92400E
```

---

## 📐 **Spacing System**

### **Standard Spacing Scale**
- `4px` - xs (fine adjustments)
- `8px` - sm (tight spacing)
- `16px` - md (default spacing)
- `24px` - lg (comfortable spacing)
- `32px` - xl (section spacing)
- `48px` - 2xl (large section gaps)
- `64px` - 3xl (page section dividers)

### **Component Spacing**
- **Card padding**: 24px
- **Button padding**: 12px 24px
- **Input padding**: 12px 16px
- **Section margins**: 48px
- **Container max-width**: 1200px

---

## 🎭 **Animation Guidelines**

### **Transition Timing**
```css
/* Standard transitions */
transition: all 0.2s ease-out

/* Hover effects */
transition: transform 0.2s ease-out, box-shadow 0.2s ease-out

/* Page transitions */
transition: opacity 0.3s ease-in-out
```

### **GSAP Animation Principles**
- **Duration**: 0.6-1.2s for entrance animations
- **Easing**: `power3.out` for natural feel
- **Stagger**: 0.1-0.2s between elements
- **Scroll trigger**: Start at 80% viewport height

---

## 🎨 **Healthcare UI Patterns**

### **Trust Indicators**
- Verification badges for healthcare facilities
- Security icons for data protection
- Professional certifications display
- Success metrics and testimonials

### **Accessibility Focus**
- High contrast ratios (WCAG AA compliant)
- Large touch targets (44px minimum)
- Clear focus states
- Screen reader friendly

### **Professional Tone**
- Clean, minimal layouts
- Plenty of whitespace
- Professional imagery
- Clear hierarchy and navigation

---

## 📱 **Responsive Breakpoints**
```css
/* Mobile First Approach */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

## 🏥 **Healthcare-Specific Considerations**

### **Trust & Security**
- Always display security badges
- Show verification status clearly
- Use shield icons for protection
- Highlight HIPAA compliance where relevant

### **Professional Standards**
- Display certifications prominently
- Show experience levels clearly
- Use medical terminology appropriately
- Maintain clinical, professional tone

### **User Experience**
- Fast loading times (critical for busy professionals)
- Mobile-first design (techs often on mobile)
- Clear call-to-actions
- Simplified forms and processes

---

## ✅ **Brand Checklist**

### **Every Page Should Have:**
- [ ] Consistent color usage
- [ ] Proper typography hierarchy
- [ ] Healthcare-appropriate icons
- [ ] Professional, clean layout
- [ ] Trust indicators
- [ ] Mobile-responsive design
- [ ] Proper spacing and alignment
- [ ] Accessible contrast ratios

### **Interactive Elements:**
- [ ] Smooth hover animations
- [ ] Clear focus states
- [ ] Consistent button styles
- [ ] Proper loading states
- [ ] Error handling with helpful messages

---

**RT Direct** - *Professional. Trusted. Connected.* 