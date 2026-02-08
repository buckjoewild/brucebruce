# VOLUME 9: COMPONENT REFERENCE

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 9.1 Layout Components

### Layout.tsx

**Location:** `client/src/components/Layout.tsx`

**Purpose:** Main application wrapper with navigation

**Props:** `children: React.ReactNode`

**Features:**
- Sidebar navigation
- Theme toggle
- User authentication status
- Demo mode banner

**Usage:**
```tsx
<Layout>
  <PageContent />
</Layout>
```

### ThemeProvider.tsx

**Location:** `client/src/components/ThemeProvider.tsx`

**Purpose:** Theme context and dark mode support

**Themes:**
- field (outdoor, natural)
- lab (technical, clean)
- sanctuary (calm, peaceful)

**Usage:**
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

---

## 9.2 Page Components

### Dashboard.tsx

**Route:** `/`

**Purpose:** Main dashboard with stats overview

**Features:**
- Logs today count
- Open loops count
- Drift flags display
- Quick navigation cards

**Queries:**
- `GET /api/dashboard`

### LifeOps.tsx

**Route:** `/life-ops`

**Purpose:** Daily calibration logging

**Features:**
- Vice toggles (8 boolean)
- Life metrics sliders (8 scales)
- Quick context selects
- Reflection prompts
- Log history

**Queries:**
- `GET /api/logs`
- `POST /api/logs`
- `PUT /api/logs/:id`
- `POST /api/logs/summary`

### Goals.tsx

**Route:** `/goals`

**Purpose:** Goal management and check-ins

**Features:**
- Domain-grouped goals
- Goal creation form
- Daily check-in toggles
- Progress visualization

**Queries:**
- `GET /api/goals`
- `POST /api/goals`
- `PUT /api/goals/:id`
- `POST /api/checkins`

### ThinkOps.tsx

**Route:** `/think-ops`

**Purpose:** Idea capture and pipeline

**Features:**
- Quick/deep capture modes
- Pipeline status tabs
- Priority sorting
- Reality check trigger

**Queries:**
- `GET /api/ideas`
- `POST /api/ideas`
- `PUT /api/ideas/:id`

### RealityCheck.tsx

**Route:** `/reality-check`

**Purpose:** AI-powered idea validation

**Features:**
- Known/Likely/Speculation display
- Self-deception flags
- Decision recommendation
- Reasoning explanation

**Queries:**
- `POST /api/ideas/:id/reality-check`

### WeeklyReview.tsx

**Route:** `/weekly-review`

**Purpose:** Weekly analytics and insights

**Features:**
- Completion rate chart
- Domain breakdown
- Drift flags list
- AI insight generation

**Queries:**
- `GET /api/review/weekly`
- `POST /api/review/weekly/insight`

### TeachingAssistant.tsx

**Route:** `/teaching`

**Purpose:** Lesson plan generation

**Features:**
- Lesson request form
- AI-generated output
- History list

**Queries:**
- `GET /api/teaching`
- `POST /api/teaching`

### HarrisWildlands.tsx

**Route:** `/harris`

**Purpose:** Brand content generation

**Features:**
- Core message form
- Site map goals
- Lead magnet design
- Generated copy display

**Queries:**
- `POST /api/harris`

### Chat.tsx

**Route:** `/chat`

**Purpose:** Conversational AI interface

**Features:**
- Message input
- Chat history
- Context selection
- Streaming responses

**Queries:**
- `POST /api/chat`

### Settings.tsx

**Route:** `/settings`

**Purpose:** User preferences

**Features:**
- AI model selection
- Theme toggle
- Reminder settings
- Data export

**Queries:**
- `GET /api/settings`
- `PUT /api/settings/:key`
- `GET /api/export/data`

### not-found.tsx

**Route:** `*`

**Purpose:** 404 error page

**Features:**
- Error message
- Navigation back

---

## 9.3 shadcn/ui Components (48)

### Form Components

| Component | Usage |
|-----------|-------|
| `button.tsx` | Primary actions, variants: default, destructive, outline, secondary, ghost, link |
| `input.tsx` | Text input fields |
| `textarea.tsx` | Multi-line text input |
| `checkbox.tsx` | Boolean toggles |
| `radio-group.tsx` | Single selection |
| `select.tsx` | Dropdown selection |
| `slider.tsx` | Range input (1-10 scales) |
| `switch.tsx` | Toggle switches |
| `form.tsx` | Form wrapper with react-hook-form |
| `label.tsx` | Input labels |

### Layout Components

| Component | Usage |
|-----------|-------|
| `card.tsx` | Content containers |
| `separator.tsx` | Visual dividers |
| `tabs.tsx` | Tab navigation |
| `accordion.tsx` | Collapsible sections |
| `collapsible.tsx` | Toggle visibility |
| `resizable.tsx` | Resizable panels |
| `scroll-area.tsx` | Custom scrollbars |
| `sheet.tsx` | Side panels |
| `drawer.tsx` | Bottom drawers |

### Navigation Components

| Component | Usage |
|-----------|-------|
| `sidebar.tsx` | Main navigation |
| `navigation-menu.tsx` | Nav menus |
| `menubar.tsx` | Menu bars |
| `dropdown-menu.tsx` | Context menus |
| `context-menu.tsx` | Right-click menus |
| `breadcrumb.tsx` | Path navigation |
| `pagination.tsx` | Page navigation |

### Feedback Components

| Component | Usage |
|-----------|-------|
| `toast.tsx` | Notifications |
| `toaster.tsx` | Toast container |
| `alert.tsx` | Status messages |
| `alert-dialog.tsx` | Confirmation dialogs |
| `dialog.tsx` | Modal dialogs |
| `popover.tsx` | Floating content |
| `tooltip.tsx` | Hover hints |
| `hover-card.tsx` | Rich hovers |
| `progress.tsx` | Progress bars |
| `skeleton.tsx` | Loading states |

### Data Display Components

| Component | Usage |
|-----------|-------|
| `table.tsx` | Data tables |
| `badge.tsx` | Status badges |
| `avatar.tsx` | User avatars |
| `calendar.tsx` | Date picker |
| `chart.tsx` | Data visualization |
| `carousel.tsx` | Image slider |
| `aspect-ratio.tsx` | Aspect containers |

### Input Enhancement Components

| Component | Usage |
|-----------|-------|
| `command.tsx` | Command palette |
| `input-otp.tsx` | OTP input |
| `toggle.tsx` | Toggle buttons |
| `toggle-group.tsx` | Toggle groups |

---

## 9.4 Custom Components

### DemoBanner.tsx

**Purpose:** Demo mode warning banner

**Display Condition:** `?demo=true` or localStorage demo flag

**Content:** Warning that data is not persisted

### PageBackground.tsx

**Purpose:** Animated background effects

**Features:**
- Theme-responsive colors
- Subtle animations
- Performance optimized

### BotanicalMotifs.tsx

**Purpose:** Decorative botanical elements

**Features:**
- SVG patterns
- Theme-aware colors
- Subtle placement

### CanopyView.tsx

**Purpose:** Visual component for forest theme

### HoverRevealImage.tsx

**Purpose:** Interactive image reveal on hover

### InterfaceOverlay.tsx

**Purpose:** UI overlay effects

### StatusBadge.tsx

**Location:** `client/src/components/ui/StatusBadge.tsx`

**Purpose:** Custom status indicator

**Variants:**
- online (green)
- away (yellow)
- busy (red)
- offline (gray)

---

## 9.5 Hook Reference

### use-toast.ts

**Location:** `client/src/hooks/use-toast.ts`

**Purpose:** Toast notification management

**Usage:**
```tsx
const { toast } = useToast();

toast({
  title: "Success",
  description: "Log saved successfully",
  variant: "default" // or "destructive"
});
```

---

## 9.6 Utility Functions

### queryClient.ts

**Location:** `client/src/lib/queryClient.ts`

**Exports:**
- `queryClient` - TanStack Query client instance
- `apiRequest` - Fetch wrapper for mutations

**apiRequest Usage:**
```tsx
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/logs', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/logs'] });
  }
});
```

### utils.ts

**Location:** `client/src/lib/utils.ts`

**Exports:**
- `cn()` - Tailwind class merger

**Usage:**
```tsx
<div className={cn("base-class", conditional && "conditional-class")} />
```

---

## 9.7 Component Patterns

### Form Pattern

```tsx
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});

return (
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FormField
        control={form.control}
        name="fieldName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  </Form>
);
```

### Query Pattern

```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/resource'],
});

if (isLoading) return <Skeleton />;
if (error) return <Alert variant="destructive">{error.message}</Alert>;

return <DataDisplay data={data} />;
```

### Mutation Pattern

```tsx
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/resource', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/resource'] });
    toast({ title: "Success" });
  },
  onError: (error) => {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  }
});
```

---

## 9.8 Data Test IDs

All interactive elements include `data-testid` for testing:

| Pattern | Example |
|---------|---------|
| Button actions | `button-submit`, `button-save-log` |
| Input fields | `input-email`, `input-title` |
| Links | `link-dashboard`, `link-settings` |
| Display elements | `text-username`, `status-completion` |
| Dynamic elements | `card-idea-${id}`, `row-goal-${index}` |

---

**Next Volume:** [VOL10 - Configuration Reference](./VOL10_CONFIGURATION.md)
