# Access Effectiveness Control Architecture

## Control Model

The service manages access-effectiveness control reviews for supplier-evidence records. Independent roles assess controls, verify test evidence, validate results, certify effectiveness, and close the control record. Every permitted transition records the actor, request context, note, and timestamp.

## Operational Safeguards

Transport, domain policy, validation, and persistence remain isolated. The process validates the listening port, binds to the local network interface, returns structured error contracts, handles termination signals, and atomically replaces JSON data after accepted updates. Rejected input, role, and state requests do not write a new record state.
