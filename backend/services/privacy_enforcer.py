from typing import Any, Dict, List, Optional
from config import get_settings

settings = get_settings()

class PrivacyEnforcer:

    def __init__(self, minimum_cell_size: int = None):
        self.minimum_cell_size = minimum_cell_size or settings.minimum_cell_size

    def should_suppress(self, count: int) -> bool:
        return count < self.minimum_cell_size

    def suppress_value(self, value: Any, reason: str = "Privacy protection (n<10)") -> Dict[str, Any]:
        return {
            "value": None,
            "suppressed": True,
            "reason": reason
        }

    def enforce_on_record(self, record: Dict[str, Any], count_field: str = "population") -> Dict[str, Any]:
        count = record.get(count_field, 0)

        if self.should_suppress(count):
            return {
                **record,
                "suppressed": True,
                "suppression_reason": f"Data suppressed for privacy (n={count} < {self.minimum_cell_size})",
                count_field: None,
                "risk_score": None,
                "migration_velocity": None,
                "biometric_risk": None,
                "digital_exclusion": None,
            }

        return {**record, "suppressed": False}

    def enforce_on_list(self, records: List[Dict[str, Any]], count_field: str = "population") -> List[Dict[str, Any]]:
        return [self.enforce_on_record(record, count_field) for record in records]

    def aggregate_safe(self, records: List[Dict[str, Any]], group_by: str, count_field: str = "population") -> List[Dict[str, Any]]:
        from collections import defaultdict

        groups = defaultdict(lambda: {"count": 0, "records": []})

        for record in records:
            key = record.get(group_by)
            groups[key]["count"] += record.get(count_field, 0)
            groups[key]["records"].append(record)

        result = []
        for key, data in groups.items():
            if self.should_suppress(data["count"]):
                result.append({
                    group_by: key,
                    count_field: None,
                    "suppressed": True,
                    "suppression_reason": f"Aggregated data suppressed (n={data['count']} < {self.minimum_cell_size})"
                })
            else:
                result.append({
                    group_by: key,
                    count_field: data["count"],
                    "suppressed": False,
                    "record_count": len(data["records"])
                })

        return result

privacy_enforcer = PrivacyEnforcer()
