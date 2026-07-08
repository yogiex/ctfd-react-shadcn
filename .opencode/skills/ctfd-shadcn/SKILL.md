---
name: ctfd-shadcn
description: |
  shadcn/ui component management for CTFd's React frontend. Covers CLI usage, component selection
  table (Button/Card/Dialog/Table/Tabs mapped to CTFd use cases), composition rules (Card, Form,
  Table, Dialog patterns), styling (semantic colors, gap spacing, lucide-react icons), form
  validation states, dark mode integration, and CTFd-specific component customizations.
---

# CTFd shadcn/ui

Guidance for using shadcn/ui in the CTFd React frontend refactoring project.
Components are added as source code via the CLI and customized for CTFd's needs.

## CLI

```sh
# Add components (run from frontend/ directory)
npx shadcn@latest add button card dialog table tabs select input badge toast
npx shadcn@latest add dropdown-menu sheet separator accordion avatar
npx shadcn@latest add alert alert-dialog checkbox radio-group switch
npx shadcn@latest add command popover tooltip skeleton scroll-area

# Search available components
npx shadcn@latest search <query>

# View component documentation
npx shadcn@latest docs <component>

# Preview changes before adding
npx shadcn@latest add <component> --dry-run
npx shadcn@latest add <component> --diff
```

## Project Context

The CTFd frontend uses:
- **Framework**: React 18 + Vite
- **Base library**: Radix UI (shadcn/ui default)
- **Icons**: lucide-react
- **Styling**: Tailwind CSS v3 with `class` dark mode strategy
- **Path aliases**: `@/` → `frontend/src/`
- **CSS**: `globals.css` at `frontend/src/globals.css`

## Principles

### 1. Components as source code

shadcn/ui components are copied into the project as editable source code in
`frontend/src/components/ui/`. Customize them directly — they are yours.

### 2. Component selection

| Use case | shadcn/ui component | CTFd example |
|----------|--------------------|--------------|
| Primary action | `Button` | Submit flag, Save config, Create challenge |
| Contained content group | `Card` | Challenge card in grid |
| Modal overlay | `Dialog` | Challenge detail, confirm delete |
| Full-screen overlay | `Sheet` | Mobile nav, admin sidebar |
| Tabbed content | `Tabs` | Challenge detail (Challenge/Solves/Submissions/Solution) |
| Data rows | `Table` | Scoreboard, submissions list |
| Option selector | `Select` | Category filter, bracket filter |
| Text input | `Input` | Flag submission, search |
| Multi-line input | `Textarea` | Hint content, page editor |
| Toggle | `Switch` | Config toggles (verify email, etc) |
| Choice groups | `RadioGroup` | User mode (users vs teams) |
| Pick from list | `Command` | Search and select users/teams/challenges |
| Floating action | `DropdownMenu` | User menu, per-row actions |
| Sequential reveal | `Accordion` | Hint list, config sections |
| Status badge | `Badge` | Solved/unsolved, category tags |
| User avatar | `Avatar` | User profile, team members |
| Notifications | `Toast` | Success/error feedback on actions |
| Confirm danger | `AlertDialog` | Delete challenge, disband team |
| Context info | `Tooltip` | Challenge metadata on hover |
| Pending state | `Skeleton` | Loading state for async data |
| Scrollable area | `ScrollArea` | Long challenge description |

### 3. Composition rules

**Card structure** (admin panels):
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* form fields, content */}
  </CardContent>
  <CardFooter>
    <Button>Save</Button>
  </CardFooter>
</Card>
```

**Form pattern** (react-hook-form + shadcn):
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Challenge Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormDescription>Visible to participants</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Save</Button>
  </form>
</Form>
```

**Group of items** (tags, topics):
```tsx
<div className="flex flex-wrap gap-2">
  {tags.map(t => (
    <Badge key={t} variant="secondary">
      {t}
      <button onClick={() => removeTag(t)}>
        <X className="h-3 w-3 ml-1" />
      </button>
    </Badge>
  ))}
</div>
```

**Overlay + trigger** (challenge modal):
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-3xl max-h-[80vh]">
    <DialogHeader>
      <DialogTitle>{challenge.name}</DialogTitle>
      <DialogDescription>{challenge.value} pts</DialogDescription>
    </DialogHeader>
    <Tabs defaultValue="challenge">
      <TabsList>
        <TabsTrigger value="challenge">Challenge</TabsTrigger>
        <TabsTrigger value="solves">Solves</TabsTrigger>
      </TabsList>
      <TabsContent value="challenge">
        {/* challenge content */}
      </TabsContent>
      <TabsContent value="solves">
        {/* solves table */}
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
```

**Table pattern** (scoreboard, admin lists):
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Place</TableHead>
      <TableHead>Name</TableHead>
      <TableHead className="text-right">Score</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {standings.map((s, i) => (
      <TableRow key={s.id}>
        <TableCell>{i + 1}</TableCell>
        <TableCell>{s.name}</TableCell>
        <TableCell className="text-right">{s.score}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### 4. Styling rules

**Semantic colors** — use Tailwind's theme variables, never raw hex:
```tsx
// ✓ Correct
<Badge variant="destructive">Incorrect</Badge>
<Badge variant="default">Solved</Badge>
<Button variant="outline">Cancel</Button>

// ✗ Wrong
<Badge className="bg-red-500 text-white">Incorrect</Badge>
```

**Gap spacing** — use `gap-{n}` on flex/grid parents, not margin on children:
```tsx
// ✓ Correct
<div className="flex gap-2">

// ✗ Wrong
<div className="flex">
  <div className="mr-2">
```

**Size shorthand** — use shadcn's size prop where available:
```tsx
<Button size="sm" />  // h-8 px-3 text-xs
<Button size="default" /> // h-10 px-4 py-2
<Button size="lg" />  // h-11 px-8
<Button size="icon" />  // h-10 w-10
```

**Icons** — use `lucide-react` with data-icon attribute for testing:
```tsx
import { Check, X, AlertCircle } from 'lucide-react';

<Check data-icon="check" className="h-4 w-4 text-green-500" />
<X data-icon="x" className="h-4 w-4 text-red-500" />
```

### 5. Validation states

Form fields should show validation state via shadcn FormMessage:

```tsx
<FormField
  control={form.control}
  name="flag"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <Input
          {...field}
          placeholder="Enter flag"
          data-invalid={!!form.formState.errors.flag}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 6. CTFd-specific component customizations

**Button variants:**
- `default` (primary) — Submit flag, Save, Create
- `destructive` — Delete, Disband, Ban
- `outline` — Cancel, Preview
- `ghost` — Edit icon, row actions
- `secondary` — Filter, secondary actions

**Badge variants:**
- `default` — Solved, category name
- `secondary` — Tag, topic
- `destructive` — Incorrect, Banned
- `outline` — Pending, draft state
- Custom via `className`:
  ```tsx
  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Correct</Badge>
  <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Ratelimited</Badge>
  ```

**Dialog sizes for CTFd:**
- Challenge modal: `max-w-4xl` (wide, needs space for tabs + content)
- Confirm delete: `max-w-md` (small, focused action)
- Admin config: `max-w-2xl` (medium form)
- Admin challenge tab content: full-width inside page layout (not a dialog)

**Table sticky headers:**
```tsx
<Table>
  <TableHeader className="sticky top-0 bg-background z-10">
    ...
  </TableHeader>
</Table>
```

### 7. Dark mode

shadcn/ui uses the `class` strategy — `.dark` class on `<html>` controls all theme
variables. Components auto-adapt. Custom overrides:

```tsx
// In globals.css — CTFd overrides
@layer base {
  :root {
    --ctf-solved: 142 71% 45%;
  }
  .dark {
    --ctf-solved: 142 71% 55%; /* brighter in dark mode */
  }
}
```

### 8. Installing for CTFd

The CTFd frontend lives at `frontend/`. Before adding components:

```sh
cd CTFd/frontend
npx shadcn@latest init
# Follow prompts:
# - Style: New York (default)
# - Color: Blue (matches CTFd theme)
# - CSS variables: Yes
# - src/ directory: Yes
# - components/ path: @/components/ui
```

Then add components as needed following the table above.
