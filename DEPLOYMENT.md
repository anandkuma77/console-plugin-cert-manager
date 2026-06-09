# Deployment Guide

## Prerequisites

- OpenShift cluster 4.22+ with admin access
- `oc` CLI authenticated to your cluster
- Quay.io account (username: anandkuma77)
- Docker or Podman installed locally

## Step 1: Configure Quay.io Credentials

### Create a robot account in Quay.io

1. Go to https://quay.io
2. Navigate to your organization/user settings → Robot Accounts
3. Create a new robot account with write access to `console-plugin-cert-manager` repository
4. Copy the credentials

### Add GitHub Secrets

Add these as repository secrets in GitHub (Settings → Secrets and variables → Actions):

- `QUAY_USERNAME`: Your robot account name (format: `anandkuma77+robotname`)
- `QUAY_PASSWORD`: The robot account token

## Step 2: Build and Push the Plugin Image

### Option A: Using GitHub Actions (Recommended)

Push your code to GitHub main branch. The `build-and-push` workflow will automatically:
- Build the plugin
- Push to `quay.io/anandkuma77/console-plugin-cert-manager:latest`
- Tag with commit SHA

### Option B: Manual Build

```bash
# Build the image
docker build -t quay.io/anandkuma77/console-plugin-cert-manager:latest .

# Login to Quay
docker login quay.io

# Push the image
docker push quay.io/anandkuma77/console-plugin-cert-manager:latest
```

## Step 3: Login to OpenShift Cluster

```bash
oc login -u kubeadmin -p 'wPNqQ-eQJnk-oBC8x-47B7p' https://api.sapurohi-ocp06081019.gcp.devcluster.openshift.com:6443
```

## Step 4: Deploy the Plugin via Helm

```bash
helm upgrade -i console-plugin-cert-manager charts/openshift-console-plugin \
  -n console-plugin-cert-manager --create-namespace \
  --set plugin.image=quay.io/anandkuma77/console-plugin-cert-manager:latest
```

## Step 5: Verify Deployment

Check that the plugin pods are running:

```bash
oc get pods -n console-plugin-cert-manager
```

Check that the ConsolePlugin CR was created:

```bash
oc get consoleplugin console-plugin-cert-manager -o yaml
```

## Step 6: Enable the Plugin in OpenShift Console

```bash
oc patch consoles.operator.openshift.io cluster \
  --patch '{"spec":{"plugins":["console-plugin-cert-manager"]}}' --type=merge
```

The OpenShift console will automatically reload.

## Step 7: Access the Plugin

1. Open the OpenShift console in your browser
2. Navigate to the Administrator perspective
3. Look for the **Certificates** section in the left navigation
4. You should see:
   - Certificates
   - Issuers
   - ClusterIssuers
   - CertificateRequests
   - CertManager Config

## Troubleshooting

### Plugin not appearing in console

Check the console operator logs:
```bash
oc logs -n openshift-console deployment/console -f
```

Check the plugin service is accessible:
```bash
oc get svc -n console-plugin-cert-manager
```

### Image pull errors

Ensure the Quay.io repository is public or that you've created an image pull secret:
```bash
kubectl create secret docker-registry quay-secret \
  --docker-server=quay.io \
  --docker-username=<username> \
  --docker-password=<password> \
  -n console-plugin-cert-manager
```

Then update the Helm values:
```bash
helm upgrade console-plugin-cert-manager charts/openshift-console-plugin \
  -n console-plugin-cert-manager \
  --set plugin.imagePullSecrets[0]=quay-secret
```

### Plugin crashes or doesn't load

Check plugin pod logs:
```bash
oc logs -n console-plugin-cert-manager -l app=console-plugin-cert-manager
```

## Uninstalling

To remove the plugin:

```bash
# Remove from console
oc patch consoles.operator.openshift.io cluster \
  --type=json -p '[{"op": "remove", "path": "/spec/plugins", "value": ["console-plugin-cert-manager"]}]'

# Uninstall via Helm
helm uninstall console-plugin-cert-manager -n console-plugin-cert-manager

# Delete namespace
oc delete namespace console-plugin-cert-manager
```
