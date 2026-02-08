# VOLUME 13: EXTENSION PATTERNS

**HarrisWildlands.com Technical Project Manual**  
**Version:** 1.0.0  
**Generated:** December 28, 2025

---

## 13.1 Adding a New Database Table

### Step 1: Define Table (shared/schema.ts)

```typescript
// 1. Add table definition
export const newFeature = pgTable("new_feature", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Create insert schema
export const insertNewFeatureSchema = createInsertSchema(newFeature)
  .omit({ id: true, userId: true, createdAt: true });

// 3. Define types
export type NewFeature = typeof newFeature.$inferSelect;
export type InsertNewFeature = z.infer<typeof insertNewFeatureSchema>;
```

### Step 2: Add Storage Methods (server/storage.ts)

```typescript
// 1. Add to IStorage interface
interface IStorage {
  // ... existing methods
  getNewFeatures(userId: string): Promise<NewFeature[]>;
  createNewFeature(userId: string, data: InsertNewFeature): Promise<NewFeature>;
  updateNewFeature(userId: string, id: number, updates: Partial<NewFeature>): Promise<NewFeature>;
}

// 2. Implement in DatabaseStorage
async getNewFeatures(userId: string): Promise<NewFeature[]> {
  return await db.select().from(newFeature)
    .where(eq(newFeature.userId, userId))
    .orderBy(desc(newFeature.createdAt));
}

async createNewFeature(userId: string, data: InsertNewFeature): Promise<NewFeature> {
  const [created] = await db.insert(newFeature)
    .values({ ...data, userId })
    .returning();
  return created;
}

async updateNewFeature(userId: string, id: number, updates: Partial<NewFeature>): Promise<NewFeature> {
  const { userId: _, ...safeUpdates } = updates as any;
  const [updated] = await db.update(newFeature)
    .set(safeUpdates)
    .where(and(eq(newFeature.id, id), eq(newFeature.userId, userId)))
    .returning();
  return updated;
}
```

### Step 3: Add API Routes (server/routes.ts)

```typescript
// Add routes
app.get("/api/new-feature", isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  const items = await storage.getNewFeatures(userId);
  res.json(items);
});

app.post("/api/new-feature", isAuthenticated, async (req, res) => {
  try {
    const userId = getUserId(req);
    const input = insertNewFeatureSchema.parse(req.body);
    const item = await storage.createNewFeature(userId, input);
    res.status(201).json(item);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: err.errors[0].message });
    }
    throw err;
  }
});
```

### Step 4: Sync Database

```bash
npm run db:push
```

---

## 13.2 Adding a New Page

### Step 1: Create Page Component

```typescript
// client/src/pages/NewFeature.tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { NewFeature } from "@shared/schema";

export default function NewFeaturePage() {
  const { data, isLoading } = useQuery<NewFeature[]>({
    queryKey: ['/api/new-feature'],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">New Feature</h1>
      <div className="grid gap-4">
        {data?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Step 2: Register Route (App.tsx)

```typescript
import NewFeaturePage from "@/pages/NewFeature";

// In Router component
<Route path="/new-feature" component={NewFeaturePage} />
```

### Step 3: Add to Navigation (Layout.tsx)

```typescript
// Add to navigation items
{ title: "New Feature", url: "/new-feature", icon: Star }
```

---

## 13.3 Adding AI Features

### Step 1: Define Lane Prompt

```typescript
const NEW_FEATURE_PROMPT = "You are an expert at [domain]. Provide [specific output format].";
```

### Step 2: Add AI Endpoint

```typescript
app.post("/api/new-feature/:id/analyze", isAuthenticated, async (req, res) => {
  const userId = getUserId(req);
  const id = Number(req.params.id);
  
  const item = await storage.getNewFeature(userId, id);
  if (!item) {
    return res.status(404).json({ message: "Not found" });
  }

  const prompt = `Analyze this item:
Title: ${item.title}
Description: ${item.description}

Provide analysis in JSON format:
{
  "insights": [...],
  "recommendations": [...],
  "score": 1-10
}`;

  try {
    const response = await callAI(prompt, NEW_FEATURE_PROMPT);
    
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: response };
    
    const updated = await storage.updateNewFeature(userId, id, { analysis });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Analysis failed" });
  }
});
```

---

## 13.4 Adding Form Fields

### Using React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = insertNewFeatureSchema.extend({
  title: z.string().min(1, "Title is required"),
});

export function NewFeatureForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "active",
    },
  });

  const onSubmit = async (data) => {
    // mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter title" {...field} data-testid="input-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" data-testid="button-submit">Save</Button>
      </form>
    </Form>
  );
}
```

---

## 13.5 Adding Charts

### Using Recharts

```typescript
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function FeatureChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

---

## 13.6 Adding Constants

### In shared/schema.ts

```typescript
// Add to schema file
export const NEW_STATUSES = ["pending", "active", "completed", "archived"] as const;
export const NEW_CATEGORIES = ["type1", "type2", "type3"] as const;

// Use in table
status: text("status").$type<typeof NEW_STATUSES[number]>().default("pending"),
```

---

## 13.7 Common Patterns

### Query Pattern

```typescript
const { data, isLoading, error, refetch } = useQuery<DataType[]>({
  queryKey: ['/api/endpoint'],
});
```

### Mutation Pattern

```typescript
const mutation = useMutation({
  mutationFn: (data: InsertType) => 
    apiRequest('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/endpoint'] });
    toast({ title: "Success" });
  },
  onError: (error) => {
    toast({ title: "Error", description: error.message, variant: "destructive" });
  },
});
```

### Delete Pattern

```typescript
const deleteMutation = useMutation({
  mutationFn: (id: number) =>
    apiRequest(`/api/endpoint/${id}`, { method: 'DELETE' }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/endpoint'] });
  },
});
```

---

## 13.8 Testing New Features

### Add Test IDs

```tsx
<Button data-testid="button-action-name">Action</Button>
<Input data-testid="input-field-name" />
<div data-testid="text-display-name">{value}</div>
```

### E2E Test Pattern

```
1. Navigate to feature page
2. Fill form fields
3. Submit form
4. Verify success
5. Verify data displayed
```

---

**Next Volume:** [VOL14 - Troubleshooting Guide](./VOL14_TROUBLESHOOTING.md)
