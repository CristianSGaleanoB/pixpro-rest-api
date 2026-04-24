# CI/CD and Deployment Documentation using Docker Swarm

This document explains the continuous delivery flow, the Continuous Integration (CI) stages, the Swarm deployment design, and provides a critical reflection on the benefits, limitations, and resilience of the implemented system.

## 1. Continuous Integration (CI) Stages in GitLab

We have configured a pipeline (`.gitlab-ci.yml`) that automates the validation and preparation of the project before performing the deployment. The key defined stages are:

- **`install`**: Caches package dependencies (using `npm ci`) so they are available securely and immutably.
- **`test`**: Executes unit tests and generates a coverage report (`npm run test:cov`). The pipeline blocks progress if this phase fails, serving as the first quality control checkpoint.
- **`build`**: Responsible for building the application's Docker image (`docker build ...`) and publishing it to the associated *Container Registry* in GitLab. This ensures that the exact code that passed the tests becomes our deployment unit.
- **`deploy`**: Simulates and/or executes the deployment onto the Manager Node of our local Swarm. This step occurs exclusively when integrating changes into the `main` branch.

## 2. Local Docker Swarm Cluster (Manager + Worker)

Native Docker Swarm allows coordinating multiple containers and hosts to behave systematically.

**Cluster Composition:**
1. **Manager Node**: Initialized with `docker swarm init`. It takes on orchestration responsibilities, global state database management, and task scheduling instructions for the containers.
2. **Worker Node (Optional in Single-Node testing)**: In a multi-node production setup, other machines join via the token-generated command (E.g.: `docker swarm join --token <TOKEN> <IP>:2377`), accepting the workloads or tasks dictated by the manager.

## 3. Delivery and Deployment Strategy (Rolling Updates)

In the `docker-compose.yml` file, we have chosen to deploy services using the `docker stack deploy` instruction, defining the following advanced strategies natively supported by Swarm:

- **Replication (`replicas: 3`)**: The Capstone API is secured by always running with a pool of 3 identical containers balanced by Swarm.
- **Rolling Updates (`update_config`)**: 
  - Software updates do not imply downtime.
  - We have configured a parallelism of 1 (`parallelism: 1`); this instructs Swarm to replace *one* container, wait 10 seconds (`delay: 10s`), evaluate if it started healthily, and continue with the next.
  - The order is `start-first`, bringing up the new version before shutting down the old one so as not to overload the remaining instances or reduce availability during the rollout.
- **Failure Action (`failure_action: rollback`)**: If a deployment detects failures after bringing up the new version's container, Swarm automatically executes a rollback, dismissing the new version and restoring the old replica.

## 4. Reflection on Benefits, Limitations, and Resilience

### Benefits
1. **Adoption Simplicity**: Swarm is integrated into the Docker Engine core. It does not require the steep learning curve or deep operational overhead demanded by Kubernetes.
2. **Cost Efficiency**: For low to medium complexity projects like most Capstones in the MVP phase, the infrastructure and configuration cost to maintain Swarm clusters is minimal.
3. **Integrated Distribution and Load Balancing**: It has native mesh routing (Routing Mesh). All incoming requests to the port are automatically distributed to an active and healthy replica of the backend.

### System Resilience
The incorporated Compose code models a **highly resilient** system:
- **Self-healing**: By integrating the `restart_policy: condition: on-failure` policy, if the Node API process cleanly crashes (e.g., due to `out of memory`), Swarm stops the broken unit and reprovisions its corresponding container within seconds.
- **Node Failover**: If in a multi-Worker scenario, Worker 1 fails at the physical level, the Manager detects the heartbeat disconnection in milliseconds and moves its tasks by reconfiguring the containers on Worker 2.
- **Database Layer Tolerance**: We maintain a restrictive constraint towards the *Manager node* to safeguard the persistent volume associated with Local Mongo in this development environment.

### Limitations
- **Complex Decoupling upon Scaling**: When scaling, it can fall short against higher abstractions in Kubernetes (CRDs, complex StatefulSets, advanced Ingress Controllers).
- **Ecosystem**: GitLab CI and most of the industrial standard heavily support cloud-native tooling in K8s (Helm charts, GitOps with ArgoCD, etc.), compared to Swarm, which many companies stopped betting on years ago although it maintains active LTS compatibility.

## 5. How to Run

To manually configure the Swarm cluster and deploy the application in your local environment, execute the following commands in order:

1. **Initialize the Docker Swarm cluster** (this turns your current node into a Manager):
   ```bash
   docker swarm init
   ```

2. **Build the local Docker image** for the API:
   ```bash
   docker build -t pixpro-api:latest .
   ```

3. **Deploy the stack** using the `docker-compose.yml` configuration:
   ```bash
   # Use this on PowerShell to set the image tag temporarily
   $env:IMAGE_TAG="pixpro-api:latest"
   docker stack deploy -c docker-compose.yml capstone-stack
   ```

4. **Verify the deployment** status:
   ```bash
   docker service ls
   ```
