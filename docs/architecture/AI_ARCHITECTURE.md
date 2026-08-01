# AI Provider Architecture

## Overview
To prevent tightly binding the platform to a single AI provider, we implement a provider-agnostic abstraction layer.

```
+---------------------------+
| AICareerInsightsService   |
+---------------------------+
              ↓
+---------------------------+
|        AIProvider         |
|  (Generic completions)    |
+---------------------------+
      ↓               ↓
+------------+  +------------+
| GeminiProv |  | OpenAIProv |
+------------+  +------------+
```

## Abstract Methods
The `AIProvider` must expose a single completion function:
```typescript
export interface AIProvider {
  generateCompletion(prompt: string, options?: any): Promise<string>;
}
```
All business features (like resume suggestions or roadmap calculations) call `generateCompletion` on the active provider.
