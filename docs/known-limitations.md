# Known Limitations

- No production deployment, reverse-proxy, Kubernetes, or production Docker Compose is included.
- Rate limiting is process-local and intended for local/single-instance use.
- Automated end-to-end, provider sandbox, and adversarial security test coverage is incomplete.
- Scanner safety depends on installed scanner versions and runtime isolation.
- Tax, invoice, recurring billing, refunds, and retention require finance/legal review.
- Secret rotation is operational/manual; existing encrypted settings use one configured key version.
- GitHub, Midtrans, PayPal, and exchange-rate availability remain external dependencies.
- Phase 12 targets a single VPS and has no high availability, autoscaling, or managed database failover.
- Named Docker volumes remain on one VPS; offsite database backups and storage retention are operator responsibilities.
- Scanner and Chromium workloads can consume significant CPU, RAM, disk, and network bandwidth.
- Docker image/Compose runtime validation must be completed on a host with Docker Engine before launch.
