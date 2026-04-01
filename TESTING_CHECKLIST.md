# CanvasFlow - Production Testing Checklist

## 🎯 Quick Test (5 minutes)

### 1. **Page Load & Initial Checks**
- [ ] Site loads at https://canvasflow.pro.bd/
- [ ] No console errors (F12 → Console)
- [ ] Theme loads correctly (dark/light)
- [ ] No 404 errors in Network tab

### 2. **Sentry Error Monitoring**
- [ ] Open browser console
- [ ] Type: `throw new Error('Test Sentry error')`
- [ ] Check [Sentry Dashboard](https://sentry.io) → Issues
- [ ] Should see error within 30 seconds

### 3. **Google Analytics**
- [ ] Open [GA4 Realtime](https://analytics.google.com/analytics/web/)
- [ ] Refresh canvasflow.pro.bd
- [ ] Should see active user: 1
- [ ] Page views should update

---

## 🎨 Core Features Test (15 minutes)

### 4. **Canvas Tools**

#### Select Tool (V)
- [ ] Click select tool
- [ ] Select elements on canvas
- [ ] Move elements around
- [ ] Resize elements

#### Rectangle Tool (R)
- [ ] Select rectangle tool
- [ ] Draw rectangle on canvas
- [ ] Check if it appears in layers panel

#### Circle Tool (C)
- [ ] Select circle tool
- [ ] Draw circle
- [ ] Verify it's selectable

#### Line Tool (L)
- [ ] Draw a line
- [ ] Check line endpoints

#### Arrow Tool (A)
- [ ] Draw an arrow
- [ ] Verify arrowhead renders

#### Text Tool (T)
- [ ] Add text element
- [ ] Type some text
- [ ] Click outside to save
- [ ] Edit text again

#### Pen/Pencil Tool
- [ ] Draw freehand
- [ ] Check smoothness

#### Eraser Tool (E)
- [ ] Select eraser
- [ ] Erase an element

### 5. **Canvas Navigation**
- [ ] Pan around (Space + drag or H key)
- [ ] Zoom in (Ctrl + = or mouse wheel)
- [ ] Zoom out (Ctrl + -)
- [ ] Reset zoom (Ctrl + 0)
- [ ] Center canvas (Ctrl + 1)

### 6. **Layers Panel** (Left Sidebar)
- [ ] Layers panel opens/closes
- [ ] Shows all created elements
- [ ] Can select element from layer
- [ ] Can hide/show layer (eye icon)
- [ ] Can lock/unlock layer (lock icon)
- [ ] Can delete layer (trash icon)
- [ ] Can reorder layers (drag)

### 7. **Properties Panel** (Right Sidebar)
- [ ] Properties panel opens/closes
- [ ] Shows selected element properties
- [ ] Can change fill color
- [ ] Can change stroke color
- [ ] Can adjust stroke width
- [ ] Can change opacity
- [ ] Changes apply to element

### 8. **Top Toolbar**
- [ ] Logo visible
- [ ] All tool buttons visible
- [ ] Undo/Redo buttons work
- [ ] Export button works
- [ ] Theme toggle works (light/dark)
- [ ] Help/shortcuts button works

---

## ⌨️ Keyboard Shortcuts Test (5 minutes)

### Tools
- [ ] `V` - Select tool
- [ ] `Q` - Lasso tool
- [ ] `E` - Eraser
- [ ] `R` - Rectangle
- [ ] `C` - Circle
- [ ] `T` - Text
- [ ] `L` - Line
- [ ] `A` - Arrow
- [ ] `H` - Pan tool

### Edit Operations
- [ ] `Ctrl+Z` - Undo
- [ ] `Ctrl+Y` - Redo
- [ ] `Ctrl+A` - Select all
- [ ] `Ctrl+D` - Duplicate
- [ ] `Ctrl+C` - Copy
- [ ] `Ctrl+X` - Cut
- [ ] `Ctrl+V` - Paste
- [ ] `Delete` - Delete selected

### View Operations
- [ ] `Ctrl+=` - Zoom in
- [ ] `Ctrl+-` - Zoom out
- [ ] `Ctrl+0` - Reset zoom
- [ ] `Ctrl+1` - Center canvas
- [ ] `G` - Toggle grid
- [ ] `U` - Toggle smart guides
- [ ] `?` - Show shortcuts

---

## 🎯 Advanced Features (5 minutes)

### 9. **Smart Guides**
- [ ] Enable smart guides (U key)
- [ ] Move element near another
- [ ] Should see alignment guides (pink lines)

### 10. **Grid**
- [ ] Toggle grid (G key)
- [ ] Grid appears/disappears
- [ ] Snap to grid works when enabled

### 11. **Context Menu**
- [ ] Right-click on element
- [ ] Context menu appears
- [ ] Menu items work (duplicate, delete, etc.)

### 12. **Multi-select**
- [ ] Shift + click multiple elements
- [ ] All selected elements highlighted
- [ ] Can move all together
- [ ] Properties panel shows multiple selection

### 13. **Export**
- [ ] Click export button
- [ ] Choose format (PNG, SVG, JSON)
- [ ] Download works
- [ ] Exported file opens correctly

---

## 📱 Responsive & UI (3 minutes)

### 14. **UI Components**
- [ ] Buttons have hover states
- [ ] Tooltips appear on hover
- [ ] Dropdowns open/close
- [ ] Modals/dialogs work
- [ ] Toast notifications appear

### 15. **Mobile Responsive** (if applicable)
- [ ] Open on mobile device
- [ ] UI adapts to screen size
- [ ] Touch interactions work
- [ ] No horizontal scroll

---

## 🐛 Error Handling (2 minutes)

### 16. **Error Boundary**
- [ ] Check console for errors
- [ ] No red error screens
- [ ] App recovers from errors

### 17. **Empty States**
- [ ] New canvas shows empty state
- [ ] Helpful message visible
- [ ] Call-to-action buttons work

---

## 🚀 Performance (2 minutes)

### 18. **Load Time**
- [ ] Page loads in < 3 seconds
- [ ] No layout shift
- [ ] Smooth animations

### 19. **Canvas Performance**
- [ ] Draw 50+ elements
- [ ] Pan/zoom still smooth (60 FPS)
- [ ] No lag when selecting

### 20. **Memory**
- [ ] Open DevTools → Performance
- [ ] Record for 30 seconds
- [ ] No memory leaks

---

## 📊 Analytics & Monitoring (2 minutes)

### 21. **Google Analytics**
- [ ] Open GA4 Realtime report
- [ ] See active users
- [ ] See page views
- [ ] Events firing (check DebugView)

### 22. **Sentry**
- [ ] Check Sentry dashboard
- [ ] No critical errors
- [ ] Performance metrics visible

---

## ✅ Final Checklist

### Critical (Must Pass)
- [ ] Site loads without errors
- [ ] Can create elements
- [ ] Can select/move elements
- [ ] Can delete elements
- [ ] Undo/Redo works
- [ ] Export works
- [ ] Sentry tracking errors
- [ ] GA4 tracking page views

### Important (Should Pass)
- [ ] All keyboard shortcuts work
- [ ] Layers panel functional
- [ ] Properties panel functional
- [ ] Smart guides work
- [ ] Grid works
- [ ] Context menu works
- [ ] Multi-select works

### Nice to Have
- [ ] All UI animations smooth
- [ ] Tooltips helpful
- [ ] Empty states informative
- [ ] Mobile responsive
- [ ] PWA installable

---

## 🐛 If You Find Bugs

1. **Document the bug:**
   - What you did
   - What happened
   - What you expected
   - Screenshot/video

2. **Check console:**
   - F12 → Console
   - Copy error messages

3. **Check Sentry:**
   - See if error was captured
   - Get error ID

4. **Fix & Deploy:**
   - Fix locally
   - Test
   - Commit & push
   - Vercel auto-deploys

---

## 📈 Post-Test Actions

### If All Tests Pass ✅
1. Share on social media
2. Add to portfolio
3. Update LinkedIn
4. Monitor Sentry/GA4 daily

### If Tests Fail ❌
1. Fix critical bugs first
2. Redeploy
3. Re-test
4. Document known issues

---

## 🔗 Quick Links

- **Live Site:** https://canvasflow.pro.bd/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Dashboard:** https://sentry.io
- **Google Analytics:** https://analytics.google.com
- **GitHub Repo:** https://github.com/Jabirmahmud0/CanvasFlow

---

**Good luck with testing! 🎉**
