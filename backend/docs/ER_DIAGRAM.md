# Plasma Connect ER Diagram

```mermaid
erDiagram
  users ||--o| donor_profile : "has donor profile"
  users ||--o{ plasma_request : "creates requests"
  users ||--o{ plasma_request : "assigned as donor"
  users ||--o{ plasma_request : "assigned as blood bank"
  plasma_request ||--o{ request_status_log : "has status timeline"
  users ||--o{ request_status_log : "changes status"
  users ||--o{ plasma_stock : "manages stock"
  users ||--o{ notification : "receives"

  users {
    int id PK
    string name
    string email UNIQUE
    string password
    string phone
    enum role
    string blood_group
    string address
    float latitude
    float longitude
    bool is_blocked
  }

  donor_profile {
    int user_id PK,FK
    bool is_available
    date last_donation_date
    int total_donations
  }

  plasma_request {
    int id PK
    int requester_id FK
    int donor_id FK
    int blood_bank_id FK
    string blood_group
    int units
    bool is_emergency
    enum target_type
    enum status
    float distance_km
  }

  request_status_log {
    int id PK
    int request_id FK
    enum status
    int changed_by_id FK
    string remark
  }

  plasma_stock {
    int id PK
    int blood_bank_id FK
    string blood_group
    int units_available
  }

  notification {
    int id PK
    int user_id FK
    string type
    string title
    string message
    json metadata
    bool is_read
  }
```
