# Grafana Dashboards

This directory contains example Grafana dashboards that you can import to visualize the metrics from your Fediverse instance.

## Available Dashboards

### Overview Dashboard
File: [overview.json](overview.json)

This dashboard provides a high-level overview of your instance, including:
- Total user count
- Total notes/posts count
- Queue job metrics over time
- Federation statistics

To import this dashboard:

1. Open Grafana
2. Click the + icon in the sidebar
3. Select "Import"
4. Either upload the JSON file or paste its contents
5. Select your Prometheus data source
6. Click "Import"

## Screenshots

### Overview Dashboard
![Overview Dashboard](https://raw.githubusercontent.com/your-repo/your-project/main/docs/dashboards/images/overview.png)

## Customization

Feel free to customize these dashboards to better suit your needs. Some suggestions:

- Add alerts for queue size thresholds
- Create panels for specific federation metrics you're interested in
- Add variable templates to filter by software variant
- Create dedicated panels for delayed jobs

## Creating New Dashboards

When creating new dashboards:

1. Design your dashboard in Grafana
2. Export it as JSON
3. Add it to this directory
4. Update this README with information about the new dashboard

## Prometheus Data Source

These dashboards assume your Prometheus data source is named "prometheus". If you use a different name, you'll need to update the data source in the JSON files or during import.
