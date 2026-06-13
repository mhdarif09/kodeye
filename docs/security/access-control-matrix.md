# Access Control Matrix

| Capability                                               | Public | Member | Organization owner | Admin                                      |
| -------------------------------------------------------- | ------ | ------ | ------------------ | ------------------------------------------ |
| View public plans/currencies                             | Yes    | Yes    | Yes                | Yes                                        |
| View own organization repositories/scans/reports/billing | No     | Yes    | Yes                | Yes, only through intended admin endpoints |
| Start scan                                               | No     | Yes    | Yes                | Same organization rules                    |
| Create repository/change automation                      | No     | No     | Yes                | Same organization rules                    |
| Install/sync GitHub integration                          | No     | No     | Yes                | Same organization rules                    |
| Change plan/create/cancel payment or subscription        | No     | No     | Yes                | Same organization rules                    |
| Manage settings/providers/plans/coupons                  | No     | No     | No                 | Yes                                        |

Unauthorized object access returns not found where practical to avoid confirming
another tenant's object IDs.
