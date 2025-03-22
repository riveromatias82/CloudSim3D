# CloudSim3D — AWS Infrastructure Simulation PoC

Import an architecture, visualize it in 3D, simulate operational scenarios, and inspect how the system behaves.

This is **not** an AWS Infrastructure Composer replacement. It is **not** a visual infrastructure designer. The product loop is:

```text
Import an architecture → visualize it → simulate scenarios → observe system behavior → analyze metrics
```

The 3D scene is a visualization of a technology-independent architecture graph. The simulation is an educational abstraction. It does **not** reproduce AWS internals, service limits, or production diagnostics.

![Demo](/CloudSim3D.gif)

## Overview

Engineers can use the PoC to explore questions such as:

- What happens if traffic suddenly increases?
- Where does a bottleneck appear in this model?
- What happens if a component fails?
- How do latency, throughput, and error rate change as load grows?
- How do two architecture variants compare under the same scenario?

The included sample models a simplified e-commerce path:

```text
CloudFront
    ↓
   ALB
    ↓
   ECS
   ↙ ↘
Redis RDS
```

## Architecture

```text
InfrastructureModel
        ↓
Simulation Engine  +  Cost Engine
        ↓
Simulation State
        ↓
React UI  +  Three.js / React Three Fiber
```

Layering rules:

- The **domain model** does not depend on React, Three.js, React Three Fiber, or Zustand.
- The **simulation engine** does not know how the scene is rendered.
- The **renderer** consumes simulation state and architecture data.
- Zustand stores application state; it does not implement simulation math.
- Importers convert external documents into `InfrastructureModel`. Only JSON is implemented in this PoC. Terraform, CloudFormation, and CDK importers can be added later behind the same interface.

## Features

- JSON architecture import with validation and clear error messages
- Sample architecture loader
- Automatic layered graph layout (positions are not required in JSON)
- Interactive 3D WebGL scene (orbit, zoom, pan, reset camera)
- Resource selection and inspector
- Resource visual state: healthy, busy, saturated, failed
- Animated traffic particles along connections
- Deterministic simulation engine (utilization, latency, error rate, traffic propagation)
- Scenarios: traffic spike, resource failure, sustained growth
- Timeline with play, pause, restart, speed, and scrubbing
- Live metrics, sparklines, bottleneck detection, demo cost estimates
- Architecture duplication and side-by-side what-if comparison

## Running locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (default `http://localhost:5173`).

On startup the sample architecture is already loaded. Typical demo:

1. Confirm CloudFront → ALB → ECS → Redis/RDS in the 3D scene.
2. Leave **Traffic Spike** selected.
3. Click **Start Simulation**.
4. Watch particles, utilization, latency, P95, error rate, and the bottleneck panel as RDS saturates.

## Testing

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

## Building

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

Lint:

```bash
npm run lint
```

## Sample architecture

JSON files must describe an `InfrastructureModel`:

```json
{
  "id": "demo-architecture",
  "name": "E-commerce Platform",
  "metadata": {
    "provider": "aws",
    "region": "us-east-1"
  },
  "resources": [
    {
      "id": "cloudfront",
      "type": "cloudfront",
      "name": "CloudFront",
      "capacity": { "requestsPerSecond": 200000 },
      "latency": { "baseMs": 5 }
    }
  ],
  "connections": []
}
```

Supported resource types: `cloudfront`, `alb`, `ecs`, `lambda`, `sqs`, `redis`, `rds`, `dynamodb`.

A complete example lives at `public/sample-architecture.json`. Positions are optional. If omitted, `ArchitectureLayoutEngine` places nodes in layers from graph sources to sinks.

Capacity, latency, and hourly cost values are **simulation parameters**, not AWS service limits or the AWS Pricing Calculator.

## Simulation model

The engine treats the architecture as a directed graph:

```text
incoming traffic → capacity → utilization → latency / errors → outgoing traffic
```

Simplified utilization bands:

| Utilization | Status     |
| ----------- | ---------- |
| < 0.60      | healthy    |
| 0.60–0.85   | busy       |
| ≥ 0.85      | saturated  |
| failed node | failed     |

Latency and error rate increase as utilization rises. Failed nodes emit no successful outgoing traffic and raise error rates on dependents. Bottlenecks are resources with utilization ≥ 0.85.

This is a deterministic, testable abstraction for exploring architecture behavior. It is **not** a model of real AWS scheduling, networking, quotas, or CloudWatch metrics.

Cost figures use a mock hourly table labeled **Demo pricing model / simulation estimate**.

## Project structure

```text
src/
  app/                         React entry view
  components/                  Layout, metrics, timeline, comparison UI
  domain/infrastructure/       Resource, connection, validation, layout
  domain/simulation/           Pure simulation engine and scenarios
  domain/cost/                 Independent demo cost engine
  importers/json/              JSON → InfrastructureModel
  renderer/three/              React Three Fiber scene
  store/                       Zustand application stores
  data/                        Sample architecture and scenarios
  tests/                       Vitest unit tests
```

## Roadmap

Not in this PoC, but the current seams are intended to allow:

- Terraform / CloudFormation / AWS CDK import
- Visual architecture designer
- Real AWS pricing
- Saved simulations and scenario libraries
- AI-assisted analysis
- Account integration and CloudWatch comparison
- Collaboration / multiplayer

## License

Private PoC. Not affiliated with Amazon Web Services.
