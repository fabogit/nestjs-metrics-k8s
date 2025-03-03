# Docker and k8s

We deploy the k8s cluster and use grafana to get prometheus metrics from the pods

## Install dependencies and start

```bash
minikube start --driver=docker
cd ./k8s/nestjs-metrics
helm dependency update
helm install nestjs-metrics .
```

continue from `#Dashboard`

## From scratch

### 1 - Build image and push to repo

```bash
docker build -t fabodhub/nestjs-metrics:latest .
docker image push fabodhub/nestjs-bull:latest
```

### 2 - Create new chart

cd to `./k8s`

```bash
helm create nestjs-metrics
```

### 3 - Create deployment template for the app

cd to `./nestjs-metrics`

```bash
kubectl create deployment nestjs-metrics --image=fabodhub/nestjs-metrics:latest --port 3000 --dry-run=client -o yaml > template/deployment.yaml
```

### 4 - Pull prometheus and grafana

```bash
helm dependency update
```

### 5 - Start k8s

```bash
minikube start --driver=docker
minikube status
```

### 6 - Install deployment

```bash
helm install nestjs-metrics .
```

## Dasboard

Check

```bash
kubectl get pods
```

get pod name `nestjs-metrics-*` and check logs `kubectl logs POD_NAME`

```bash
kubectl get services
```

get port for pod `nestjs-metrics-grafana` , output should be like:

`nestjs-metrics-grafana                    NodePort    10.98.197.78     <none>        80:REAL_PORT_NUMBER/TCP`

in the browser go to `HOST`:`REAL_PORT_NUMBER` for grafana dashboard, where `HOST` is the ip given by `minikube ip`

default user: `admin` to get password run:

```bash
kubectl get secret nestjs-metrics-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

in settings (`/connections/datasources/`) add prometheus as new datasource, set Connection URL to: `http://nestjs-metrics-prometheus-server:80`

to apply dashboard templates [node](https://grafana.com/grafana/dashboards/1860-node-exporter-full/) import dashboard id `1860` and add prometheus as datasource
