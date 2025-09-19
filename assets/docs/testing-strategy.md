## 🧪 Testing Strategy – VCF Contacts Obsidian Plugin

Testing is a loaded subject. Ask 5 developers what testing means and you'll probably get 8 opinions. For us, testing is not about chasing perfection..  it's about having confidence in change and bring good design.

Our approach is shaped by ideas from **_A Philosophy of Software Design_ by John Ousterhout**. A recommended read if you're into practical thinking about clarity, change, and modularity.

While the book doesn’t define a testing method, it strongly influences how we test:

- **Good design makes testing easier**  
  Small interfaces with deep modules are naturally easier to test. Fewer dependencies means fewer surprises.

- **Keep mental overhead low**  
  We avoid tests that depend on heavy mocking or fine-grained internal state. Testing should support the work, not make it harder.

- **Design for change**  
  Tests around key interfaces give us confidence to refactor. We expect the code to evolve, and our tests are written with that in mind.

- **Focus on behavior, not internals**  
  We care about what modules do. not how they do it. This makes tests more stable and more useful during redesigns.

---

### 💡 What We Actually Use For Testing

We use [**Vitest**](https://vitest.dev/).. a modern, fast unit testing framework.

Despite what the name suggests, we don't do "unit testing" in the textbook sense. We test **interfaces between modules** Especially the parts where:
- Data is parsed, transformed, or written
- Bugs have happened and been resolved in production code

In other words: we test the **guts**, not the UI and Obsidian interfaces, and not every edge function / util in isolation.

---

### 📚 How to Run Tests

```bash
npm run test           # Run the test suite
npm run test:coverage  # Run tests with coverage report
```

--- 

### 📂 Test Structure

- `./tests/`  
  Contains the `*.spec.ts` test files.

- `./tests/fixtures/`  
  Contains sample data (fixtures) used by tests. These simulate realistic and/or defective inputs 

---

### 📊 Viewing the Coverage UI

After running coverage with `npm run test:coverage` You can view the HTML report by opening the following file in your browser:

```
./coverage/index.html
```

This provides a visual breakdown of what’s tested, with highlighted uncovered lines.

---

### ⚠️ Manual Inclusion for Coverage

By default, Vitest only includes files that are directly imported by your tests. If a file is tested indirectly but doesn’t appear in the coverage report:
`Add it manulally to test.coverage.include in vitest.config.ts`
We use this approach to keep control of what’s tracked, especially as coverage grows.

---

We know testing looks different across companies and teams. we just hope this small guide offers a bit of clarity, inspiration, or a helpful nudge in your own direction.
