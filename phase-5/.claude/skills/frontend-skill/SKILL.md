---
name: frontend-skill
description: Build responsive pages, components, layouts, and styling for web applications. Use for frontend development tasks.
---

# Frontend Skill – Pages, Components & Layouts

## Instructions

1. **Layout structure**
   - Use responsive design (mobile-first)
   - Flexbox/Grid for layout organization
   - Proper spacing, margins, and padding
   - Maintain semantic HTML structure

2. **Components**
   - Build reusable components (buttons, cards, forms, modals)
   - Modular CSS or Tailwind classes
   - Prop-driven customization for flexibility

3. **Styling**
   - Consistent color palette and typography
   - Use animations and transitions where appropriate
   - Ensure high accessibility (contrast, ARIA attributes)
   - Theme support (light/dark mode)

4. **Pages**
   - Assemble components into full pages
   - Keep navigation consistent and intuitive
   - Optimize for performance (minimize re-renders, lazy-load images)

## Best Practices
- Mobile-first and fully responsive
- Reusable, maintainable, and modular code
- Semantic HTML elements for accessibility
- Follow Tailwind / CSS best practices
- Avoid inline styles for components

## Example Structure
```html
<section class="page-section p-8">
  <div class="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="card p-6 shadow-lg rounded-lg">
      <h2 class="text-2xl font-bold mb-4">Card Title</h2>
      <p class="text-gray-700">Some descriptive content inside the card.</p>
      <button class="mt-4 btn-primary">Action</button>
    </div>
    <div class="card p-6 shadow-lg rounded-lg">
      <h2 class="text-2xl font-bold mb-4">Card Title</h2>
      <p class="text-gray-700">Some descriptive content inside the card.</p>
      <button class="mt-4 btn-primary">Action</button>
    </div>
  </div>
</section>
