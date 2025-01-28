# Documentation

This directory contains documentation for the Fediverse Metrics Exporter:

## Contents

- [API Endpoints](docs/endpoints.md): Details about the API endpoints we scrape from different Fediverse software variants (Misskey, Calckey, Firefish, Sharkey)
- [Prometheus Metrics](docs/metrics.md): Documentation of all metrics exposed by our Prometheus exporter
- [Grafana Dashboards](docs/dashboards/): Example Grafana dashboards for visualizing the metrics

## Software Support

The exporter supports the following Fediverse software:

- Misskey
- Calckey
- Firefish
- Sharkey

Each software variant may have slightly different API structures, particularly for queue statistics. The exporter automatically detects the software variant and adjusts its scraping behavior accordingly.

## Configuration

See the [.env.example](../.env.example) file in the root directory for available configuration options.

## Getting Started

1. Copy `.env.example` to `.env` and configure your settings
2. Install dependencies: `pnpm install`
3. Build the project: `pnpm build`
4. Start the exporter: `pnpm start`
5. Access metrics at: `http://localhost:9125/metrics`

## Monitoring Stack Setup

### Prometheus Configuration

Add the following to your Prometheus configuration to scrape metrics:

```yaml
scrape_configs:
  - job_name: 'fediverse'
    static_configs:
      - targets: ['localhost:9125']
    scrape_interval: 15s
```

### Grafana Setup

1. Install and configure Grafana
2. Add your Prometheus server as a data source
3. Import the [example dashboards](docs/dashboards/) provided in this repository
4. Customize the dashboards to suit your needs

See the [dashboards documentation](docs/dashboards/README.md) for more details on available dashboards and customization options.

### Running as a systemd service

You can run as a systemd service by creating a unit file as follows (assuming you installed in `/opt/fedikey_exporter`:

```
cat > /etc/systemd/system/fedikey_exporter.service << 'EOL'
[Unit]
Description=Fedikey Exporter
After=network.target

[Service]
Type=simple
User=root
Group=root
WorkingDirectory=/opt/fedikey_exporter
EnvironmentFile=/opt/fedikey_exporter/.env
ExecStart=/usr/bin/node dist/src/index.js
Restart=always

[Install]
WantedBy=multi-user.target
EOL
```

Then run:
```bash
systemctl daemon-reload && \
systemctl enable fedikey_exporter && \
systemctl start fedikey_exporter && \
sleep 2 && \
systemctl status fedikey_exporter
```
