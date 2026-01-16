# PRAVAH - Data Ethics & Privacy Policy

## Overview

PRAVAH (Population Resource Analytics with Velocity Assessment Hub) is designed with **Privacy by Design** principles at its core. This document outlines our approach to data governance, privacy protection, and ethical considerations.

## Core Principles

### 1. Aggregation Only
- **No Individual-Level Data**: PRAVAH never stores, processes, or displays individual-level demographic data
- **Minimum Aggregation Unit**: All outputs are aggregated at the pincode level or higher
- **No Raw Biometrics**: The system does not access, store, or process any biometric data (fingerprints, iris scans, facial recognition)

### 2. Minimum Cell Size (Rule of 10)
All outputs enforce a **minimum cell size of 10 individuals**:
- Population counts below 10 are suppressed and displayed as `<10` or `*`
- Derived metrics (rates, velocities) are not calculated for cells below threshold
- This prevents re-identification attacks in small geographic areas

```
Example:
- Pincode 123456 Population: 8 → Displayed as: "*" (suppressed)
- Pincode 123457 Population: 1,250 → Displayed as: "1,250"
```

### 3. Data Sources
PRAVAH uses only **aggregated, de-identified** data from:
- Census enumeration summaries (not individual records)
- Aadhaar authentication counts (not individual Aadhaar numbers)
- Mobile tower density (not individual device data)
- OTP success/failure rates (aggregated, not individual attempts)

### 4. No Personally Identifiable Information (PII)
The following are **never collected or stored**:
- Individual Aadhaar numbers
- Names or addresses
- Phone numbers or device IDs
- Biometric templates
- Individual location data

## Data Retention

| Data Type | Retention Period | Purpose |
|-----------|-----------------|---------|
| Aggregated population estimates | 5 years | Trend analysis |
| Migration velocity metrics | 2 years | Pattern detection |
| Anomaly detection results | 1 year | Audit trail |
| API access logs | 90 days | Security monitoring |

## Access Control

### Role-Based Access (RBAC)
- **Viewer**: Read-only access to aggregated dashboards
- **Analyst**: Access to API endpoints with rate limiting
- **Admin**: Configuration and user management
- **Auditor**: Read-only access to all data plus audit logs

### Authentication Requirements
- Multi-factor authentication (MFA) required for all users
- API access requires institutional credentials
- Session timeout: 30 minutes of inactivity

## Audit Logging

All data access is logged:
- Timestamp of access
- User/service identity
- Endpoint accessed
- Query parameters (excluding sensitive filters)
- Response size (not content)

Logs are retained for 2 years and are tamper-evident.

## Sandbox Operations

For the UIDAI Hackathon demonstration:
- All data is **synthetic/mock** data
- No real demographic data is used
- API endpoints return simulated responses
- Production deployment would require formal MoU with data custodians

## Memorandum of Understanding (MoU) Path

Before production deployment with real data:
1. Execute MoU with Ministry of Statistics and Programme Implementation
2. Execute data sharing agreement with UIDAI for aggregate authentication statistics
3. Complete security audit by CERT-In approved auditor
4. Obtain approval from National Statistical Commission

## Compliance Framework

PRAVAH is designed to comply with:
- **IT Act, 2000** (and amendments)
- **Personal Data Protection principles** (consent, purpose limitation, data minimization)
- **Census Act, 1948** (confidentiality provisions)
- **Aadhaar Act, 2016** (data protection requirements)

## Ethical Considerations

### Potential Risks Mitigated
1. **Re-identification**: Prevented through cell size suppression
2. **Discrimination**: Risk scores are not used for individual-level decisions
3. **Surveillance**: No real-time individual tracking capability
4. **Data Breach**: Aggregated data reduces breach impact

### Use Case Restrictions
PRAVAH analytics **must not** be used for:
- Individual targeting or profiling
- Law enforcement identification
- Immigration enforcement
- Denial of services to individuals
- Commercial marketing

## Reporting Concerns

For data ethics concerns or potential violations:
- Email: ethics@pravah.gov.in (placeholder)
- Anonymous reporting portal: Available upon deployment

---

*Last Updated: January 2025*
*Version: 1.0 (Hackathon Prototype)*
