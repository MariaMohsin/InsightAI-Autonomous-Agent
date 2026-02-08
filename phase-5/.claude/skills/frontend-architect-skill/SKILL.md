---
name: frontend-architect-skill
description: Plan frontend architecture, design component hierarchies, and create UI/UX specifications. Planning only, no implementation.
---

# Frontend Architect Skill

## Purpose
Design and plan comprehensive frontend architecture for web applications. Creates component hierarchies, design systems, UI/UX specifications, and architectural decisions WITHOUT writing actual implementation code.

## Instructions

### 1. Requirements Analysis
- Understand user stories and use cases
- Identify all user flows and interactions
- Map out page requirements
- Define responsive design breakpoints
- Identify accessibility requirements

### 2. Architecture Planning
- Choose appropriate frontend framework/library
- Plan state management strategy
- Design routing structure
- Plan API integration approach
- Define authentication flow (client-side)

### 3. Component Design
- Create component hierarchy (Atomic Design)
- Define reusable component library
- Plan component props and state
- Design component composition patterns
- Document component responsibilities

### 4. UI/UX Specification
- Create wireframes and mockups (ASCII/text-based)
- Define color palette and typography
- Plan responsive layouts
- Design user interaction patterns
- Specify animations and transitions

### 5. State Management
- Choose state management approach (Context, Redux, Zustand)
- Design global vs local state strategy
- Plan data fetching and caching
- Define state update patterns
- Design optimistic UI updates

### 6. Performance Planning
- Plan code splitting strategy
- Design lazy loading approach
- Plan image optimization
- Define caching strategy
- Plan bundle size optimization

## Atomic Design Methodology

### Level 1: Atoms
Smallest building blocks (cannot be broken down further)
```
Examples:
- Button
- Input
- Label
- Icon
- Typography (h1, h2, p)
- Link
- Badge
- Avatar
```

### Level 2: Molecules
Simple groups of atoms functioning together
```
Examples:
- Input Field (Label + Input + Error Message)
- Search Box (Input + Button)
- Form Group (Label + Input + Helper Text)
- Card Header (Avatar + Name + Icon)
```

### Level 3: Organisms
Complex components made of molecules and atoms
```
Examples:
- Navigation Bar (Logo + Menu Items + User Profile)
- Todo Item (Checkbox + Text + Actions + Tags)
- Form (Multiple Form Groups + Submit Button)
- Header (Logo + Navigation + Search + Profile)
```

### Level 4: Templates
Page layouts combining organisms
```
Examples:
- Dashboard Layout (Sidebar + Header + Main Content)
- Auth Layout (Centered Card + Background)
- App Layout (Navigation + Content + Footer)
```

### Level 5: Pages
Specific instances of templates with real content
```
Examples:
- Todo List Page
- Login Page
- User Profile Page
- Settings Page
```

## Component Architecture Plan Template

### Example: Todo Application

```
┌─────────────────────────────────────────────────┐
│              Component Hierarchy                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Pages (Level 5)                                │
│  ├── LoginPage                                  │
│  ├── SignupPage                                 │
│  ├── TodoListPage                               │
│  └── TodoDetailPage                             │
│                                                 │
│  Templates (Level 4)                            │
│  ├── AuthLayout                                 │
│  │   └── CenteredCard                           │
│  └── AppLayout                                  │
│      ├── Navbar                                 │
│      ├── Sidebar                                │
│      └── MainContent                            │
│                                                 │
│  Organisms (Level 3)                            │
│  ├── Navbar (Logo + Menu + UserMenu)            │
│  ├── TodoList (Search + Filter + TodoItems)     │
│  ├── TodoItem (Checkbox + Text + Actions)       │
│  ├── TodoForm (InputGroups + SubmitButton)      │
│  └── UserMenu (Avatar + Dropdown)               │
│                                                 │
│  Molecules (Level 2)                            │
│  ├── InputGroup (Label + Input + Error)         │
│  ├── SearchBox (Input + SearchIcon)             │
│  ├── FilterDropdown (Select + Icon)             │
│  └── ActionButtons (EditButton + DeleteButton)  │
│                                                 │
│  Atoms (Level 1)                                │
│  ├── Button                                     │
│  ├── Input                                      │
│  ├── Checkbox                                   │
│  ├── Label                                      │
│  ├── Icon                                       │
│  └── Badge                                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Page Architecture Planning

### Page 1: Login Page
```
Layout: AuthLayout (centered card)

Components:
  - LoginForm (organism)
    - Email InputGroup (molecule)
    - Password InputGroup (molecule)
    - Submit Button (atom)
    - Forgot Password Link (atom)
  - Signup Link (atom)

State:
  - email: string
  - password: string
  - isLoading: boolean
  - error: string | null

User Flow:
1. User enters email and password
2. Click submit
3. Show loading state
4. On success → redirect to /todos
5. On error → show error message

Validation:
  - Email: valid format, required
  - Password: min 8 chars, required
```

### Page 2: Todo List Page
```
Layout: AppLayout (navbar + sidebar + content)

Components:
  - Navbar (organism)
  - Sidebar (organism) - filters/categories
  - TodoList (organism)
    - SearchBox (molecule)
    - FilterDropdown (molecule)
    - TodoItem[] (organism)
    - Pagination (molecule)
  - AddTodoButton (atom)

State:
  - todos: Todo[]
  - searchQuery: string
  - filter: FilterType
  - isLoading: boolean
  - currentPage: number

User Flow:
1. Load todos from API
2. User can search/filter
3. User can create new todo
4. User can edit/delete todos
5. User can mark as complete

API Integration:
  - GET /api/todos?search=&filter=&page=
  - POST /api/todos
  - PUT /api/todos/:id
  - DELETE /api/todos/:id
```

## State Management Strategy

### Global State (Context/Redux/Zustand)
```
AuthState:
  - user: User | null
  - isAuthenticated: boolean
  - login()
  - logout()
  - signup()

TodosState:
  - todos: Todo[]
  - isLoading: boolean
  - error: string | null
  - fetchTodos()
  - addTodo()
  - updateTodo()
  - deleteTodo()

UIState:
  - theme: 'light' | 'dark'
  - sidebarOpen: boolean
  - toggleTheme()
  - toggleSidebar()
```

### Local State (Component-level)
```
Form Components:
  - formData
  - validation errors
  - submission state

Modal/Dialog:
  - isOpen
  - modalData

Dropdown/Menu:
  - isExpanded
```

## Routing Architecture

### Route Structure (Next.js App Router)
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          → /login
│   └── signup/
│       └── page.tsx          → /signup
│
├── (app)/
│   ├── layout.tsx            → App layout wrapper
│   ├── todos/
│   │   ├── page.tsx          → /todos (list)
│   │   ├── [id]/
│   │   │   └── page.tsx      → /todos/:id (detail)
│   │   └── new/
│   │       └── page.tsx      → /todos/new
│   │
│   └── profile/
│       └── page.tsx          → /profile
│
└── api/
    ├── auth/
    │   └── [...nextauth]/
    │       └── route.ts      → API: /api/auth/*
    └── todos/
        └── route.ts          → API: /api/todos
```

## Design System Specification

### Color Palette
```
Primary Colors:
  - primary-50:  #f0f9ff (lightest blue)
  - primary-500: #3b82f6 (main blue)
  - primary-900: #1e3a8a (darkest blue)

Neutral Colors:
  - gray-50:  #f9fafb (backgrounds)
  - gray-500: #6b7280 (text secondary)
  - gray-900: #111827 (text primary)

Semantic Colors:
  - success: #22c55e (green)
  - warning: #f59e0b (amber)
  - error:   #ef4444 (red)
  - info:    #3b82f6 (blue)
```

### Typography Scale
```
Headings:
  - h1: 2.5rem (40px) - font-bold
  - h2: 2rem (32px)   - font-bold
  - h3: 1.5rem (24px) - font-semibold
  - h4: 1.25rem (20px)- font-semibold

Body:
  - large:  1.125rem (18px) - font-normal
  - base:   1rem (16px)     - font-normal
  - small:  0.875rem (14px) - font-normal
  - xs:     0.75rem (12px)  - font-normal
```

### Spacing Scale (Tailwind)
```
0.5 → 2px
1   → 4px
2   → 8px
3   → 12px
4   → 16px
6   → 24px
8   → 32px
12  → 48px
16  → 64px
```

### Responsive Breakpoints
```
sm:  640px  (Mobile landscape, small tablets)
md:  768px  (Tablets)
lg:  1024px (Small laptops)
xl:  1280px (Desktops)
2xl: 1536px (Large desktops)
```

## UI Component Specifications

### Button Component
```
Variants:
  - primary:   blue background, white text
  - secondary: gray background, dark text
  - outline:   border only, transparent bg
  - ghost:     no border, transparent bg
  - danger:    red background, white text

Sizes:
  - sm:  py-1 px-3 text-sm
  - md:  py-2 px-4 text-base
  - lg:  py-3 px-6 text-lg

States:
  - default
  - hover (darker shade)
  - active (even darker)
  - disabled (opacity-50, cursor-not-allowed)
  - loading (spinner icon)

Props:
  - variant: ButtonVariant
  - size: ButtonSize
  - disabled: boolean
  - loading: boolean
  - onClick: () => void
  - children: ReactNode
```

### Input Component
```
Types:
  - text
  - email
  - password
  - number
  - date

States:
  - default
  - focus (border color change)
  - error (red border)
  - disabled (opacity-50)

Props:
  - type: InputType
  - placeholder: string
  - value: string
  - onChange: (value) => void
  - error: string | undefined
  - disabled: boolean
  - required: boolean
```

### Card Component
```
Variants:
  - default: white bg, shadow
  - outlined: border, no shadow
  - elevated: larger shadow

Sections:
  - CardHeader (title, description, actions)
  - CardBody (main content)
  - CardFooter (actions, metadata)

Props:
  - variant: CardVariant
  - padding: PaddingSize
  - children: ReactNode
```

## Data Flow Architecture

### Client-Side Data Flow
```
User Action
    ↓
Component Event Handler
    ↓
Dispatch Action / setState
    ↓
API Call (if needed)
    ↓
Update State
    ↓
Component Re-render
    ↓
UI Update
```

### API Integration Pattern
```typescript
// Custom hook pattern
useTodos() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const response = await api.get('/todos')
      setTodos(response.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { todos, loading, error, fetchTodos }
}
```

## Performance Optimization Plan

### Code Splitting
```
Page-level splitting:
  - Each route is a separate bundle
  - Lazy load with dynamic imports

Component-level splitting:
  - Heavy components (charts, editors)
  - Modal dialogs
  - Tabs content
```

### Image Optimization
```
Strategy:
  - Use Next.js Image component
  - Lazy load images below fold
  - Serve responsive sizes
  - Use modern formats (WebP, AVIF)
  - Implement blur placeholders
```

### Bundle Size Optimization
```
Techniques:
  - Tree shaking (remove unused code)
  - Minimize dependencies
  - Use lightweight alternatives
  - Code splitting
  - Lazy loading
```

## Accessibility Planning

### WCAG 2.1 Level AA Compliance
```
Keyboard Navigation:
  - All interactive elements accessible via keyboard
  - Visible focus indicators
  - Logical tab order

Screen Reader Support:
  - Semantic HTML elements
  - ARIA labels where needed
  - Alt text for images
  - Form field labels

Color Contrast:
  - Minimum 4.5:1 for normal text
  - Minimum 3:1 for large text
  - Don't rely solely on color

Forms:
  - Clear labels
  - Error messages
  - Required field indicators
  - Validation feedback
```

## Documentation Deliverables

### 1. Component Hierarchy Diagram
```
Visual representation of:
  - All components (atoms → pages)
  - Component relationships
  - Reusability patterns
```

### 2. Page Specifications
```
For each page:
  - Layout structure
  - Component breakdown
  - State requirements
  - User flows
  - API integrations
```

### 3. Design System Documentation
```
Complete specification:
  - Color palette
  - Typography scale
  - Spacing system
  - Component variants
  - Responsive breakpoints
```

### 4. State Management Plan
```
Detailed strategy:
  - Global state structure
  - Local state patterns
  - Data flow diagrams
  - API integration approach
```

### 5. Architecture Decision Records
```
Major decisions documented:
  - Framework choice rationale
  - State management selection
  - Routing approach
  - Styling methodology
```

## When to Use This Skill

✅ **Use For:**
- Planning new frontend applications
- Designing component architecture
- Creating design systems
- Architecture reviews before implementation
- Major refactoring planning

✅ **Use Before:**
- Writing component code
- Implementing pages
- Building UI libraries
- Setting up state management
- Creating routing structure

❌ **Don't Use For:**
- Writing actual component code
- Implementing styling
- Bug fixes in existing components
- Simple UI tweaks
- Component implementation details

## Example Output

```markdown
# Frontend Architecture Plan: Todo Application

## Overview
Next.js 16 (App Router) with React 19, Tailwind CSS, and Context API for state management.

## Component Architecture

5-Level Atomic Design:
- 6 Atoms (Button, Input, Checkbox, Label, Icon, Badge)
- 4 Molecules (InputGroup, SearchBox, FilterDropdown, ActionButtons)
- 4 Organisms (Navbar, TodoList, TodoItem, TodoForm)
- 2 Templates (AuthLayout, AppLayout)
- 4 Pages (Login, Signup, TodoList, TodoDetail)

## Page Structure

### Todo List Page
┌─────────────────────────────────────┐
│           Navbar                    │
├──────────┬──────────────────────────┤
│ Sidebar  │  Main Content            │
│          │  ┌─────────────────────┐ │
│ Filters  │  │ Search + Filter     │ │
│ - All    │  └─────────────────────┘ │
│ - Active │  ┌─────────────────────┐ │
│ - Done   │  │ □ Todo Item 1       │ │
│          │  │ □ Todo Item 2       │ │
│ Tags     │  │ ☑ Todo Item 3       │ │
│ - Work   │  └─────────────────────┘ │
│ - Personal│ [+ Add Todo Button]    │
└──────────┴──────────────────────────┘

## State Management
- AuthContext (user, login, logout)
- TodosContext (todos, CRUD operations)
- UIContext (theme, sidebar toggle)

## Routing (App Router)
- /login
- /signup
- /todos (list)
- /todos/[id] (detail)
- /profile

## Design System
- Colors: Blue primary (#3b82f6)
- Typography: Inter font family
- Spacing: Tailwind scale
- Breakpoints: sm(640) md(768) lg(1024)

## Performance Strategy
- Code splitting per route
- Lazy load modals
- Image optimization with next/image
- React.memo for expensive components

## Next Steps
1. Approve architecture design
2. Implement component library (atoms → molecules)
3. Build templates and layouts
4. Create pages
5. Integrate with backend API
```

## Best Practices

### Planning Phase
- Start with user flows before components
- Design mobile-first
- Plan for accessibility from the start
- Consider performance early

### Design Principles
- Keep components small and focused
- Design for reusability
- Maintain consistent design system
- Follow atomic design methodology

### Documentation
- Create visual component hierarchies
- Document all component props
- Specify responsive behavior
- Include accessibility requirements
