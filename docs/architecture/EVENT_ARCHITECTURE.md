# Event Architecture

## Overview
Widgets subscribe to lightweight, decoupled domain events rather than direct cross-component references.

## Core Events
- `ProfileUpdated`: Fired when education, experience, or certifications are updated.
- `ResumeUploaded`: Fired when a resume file is successfully uploaded and parsed.
- `ApplicationSubmitted`: Fired when the candidate submits a job application.

## Event Contract Payload
Every event must adhere to the following telemetry interface:
```typescript
export interface DomainEvent<T = any> {
  eventType: string;
  entity: string;
  entityId: string;
  actorId: string;
  timestamp: string;
  payload: T;
  version: string;
}
```
