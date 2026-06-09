# OpenShift Console Plugin for Cert-Manager

OpenShift Console dynamic plugin providing a management UI for the [cert-manager-operator](https://github.com/anandkuma77/cert-manager-operator).

## Features

This plugin adds comprehensive certificate management views to the OpenShift Console:

### Custom Resource Management
- **Certificates** - Create, view, and manage X.509 certificates with automatic renewal
- **Issuers** - Configure namespace-scoped certificate issuers (ACME, CA, Vault, Venafi, SelfSigned)
- **ClusterIssuers** - Configure cluster-wide certificate issuers
- **CertificateRequests** - View certificate signing requests
- **CertManager Config** - View and configure the cert-manager operator settings

### Views
- **List Pages** - Sortable, filterable tables with status indicators for all resources
- **Detail Pages** - Overview, YAML editor, and events tabs with complete resource information
- **Create/Edit Forms** - Guided forms with validation for creating and modifying resources
- **Dashboard Card** - Certificate health summary on the admin dashboard

### Navigation
All views are organized under a dedicated **Certificates** section in the Administrator perspective.

## Screenshots

_Coming soon - add screenshots after deployment_

## Prerequisites

- Node.js 16+ and Yarn 4.13.0+
- Docker or Podman
- OpenShift CLI (`oc`)
- Access to an OpenShift 4.22+ cluster

## Local Development

### 1. Install dependencies

```bash
yarn install
```

### 2. Start the plugin development server

```bash
yarn start
```

The plugin runs on http://localhost:9001

### 3. Connect to your OpenShift cluster and start the console

In a separate terminal:

```bash
oc login <your-cluster-url>
yarn start-console
```

The console runs on http://localhost:9000

### 4. Access the plugin

Navigate to http://localhost:9000 and look for the **Certificates** section in the Administrator perspective navigation.

Component changes hot-reload automatically. Changes to `console-extensions.json` require restarting `yarn start`.

## Building for Production

Build the plugin container image:

```bash
docker build -t quay.io/anandkuma77/console-plugin-cert-manager:latest .
```

Push to your registry:

```bash
docker push quay.io/anandkuma77/console-plugin-cert-manager:latest
```

## Deployment

Deploy the plugin to your OpenShift cluster using Helm:

```bash
helm upgrade -i console-plugin-cert-manager charts/openshift-console-plugin \
  -n console-plugin-cert-manager --create-namespace \
  --set plugin.image=quay.io/anandkuma77/console-plugin-cert-manager:latest
```

Verify the ConsolePlugin CR was created:

```bash
oc get consoleplugin console-plugin-cert-manager
```

Enable the plugin in the console:

```bash
oc patch consoles.operator.openshift.io cluster \
  --patch '{"spec":{"plugins":["console-plugin-cert-manager"]}}' --type=merge
```

The console will reload automatically. Navigate to the Administrator perspective to see the **Certificates** section.

## Running Tests

### Unit tests

```bash
yarn test
```

### Linting

```bash
yarn lint
```

### E2E tests

```bash
yarn test-e2e-headless
```

## Project Structure

```
console-plugin-cert-manager/
├── src/
│   ├── components/
│   │   ├── Certificate/          # Certificate views
│   │   ├── Issuer/               # Issuer views
│   │   ├── ClusterIssuer/        # ClusterIssuer views
│   │   ├── CertificateRequest/   # CertificateRequest views
│   │   ├── CertManager/          # CertManager config views
│   │   └── Dashboard/            # Dashboard card
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Helper functions
├── console-extensions.json       # Plugin extension points
├── package.json                  # Dependencies and metadata
└── charts/                       # Helm chart for deployment
```

## Links

- [Cert-Manager Operator](https://github.com/anandkuma77/cert-manager-operator)
- [Cert-Manager Documentation](https://cert-manager.io/docs/)
- [OpenShift Console Dynamic Plugins](https://docs.openshift.com/container-platform/latest/web_console/dynamic-plugins/overview.html)
- [PatternFly 6 Documentation](https://www.patternfly.org/)

## License

Apache-2.0
