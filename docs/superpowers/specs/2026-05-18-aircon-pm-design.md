# Air Conditioner Preventive Maintenance System Design

**Date:** 2026-05-18
**Scope:** MVP for air-conditioner preventive maintenance, repair logging, QR-based field reporting, and central monitoring for 1,500+ branches with growth toward 2,000+ branches.

## 1. Goal

Build a practical first-version system that lets:

- Central team manage branch and air-conditioner master data
- Contractors and technicians report preventive maintenance and repair work from QR codes
- Central team monitor latest PM status, repair history, and replacement decisions

The first release prioritizes speed of rollout and operational usability over perfect data completeness. Google Sheet will be used as the first data store, with a web application in front of it and QR codes as the field entry point.

## 2. Key Decisions

### 2.1 Delivery approach

- Use `Google Sheet + Web App + QR Code` for the MVP
- Store master data and service logs in structured sheets
- Store image evidence via URL references
- Keep architecture migration-friendly so a database can replace Google Sheet later

### 2.2 Access model

- Central team owns branch and unit master data
- Technicians and contractors can only submit field reports
- Replacement decisions are central-team only

### 2.3 QR model

- Each branch has one `Branch QR`
- Each air-conditioning unit has one `Unit QR`
- Branch QR opens a branch summary and unit list
- Unit QR opens the specific unit page and service submission actions

### 2.4 Unit creation strategy

Current source data is not fully unit-by-unit. The system will therefore generate unit records from aggregate counts during setup.

Examples:

- `BC01-CUR-01`
- `BC01-AHU-01`
- `BC01-CT-01`
- `BC01-CS-01`

Generated units will be editable later by the central team when more precise model, serial, or brand data becomes available.

## 3. Users and Permissions

### 3.1 Central team

Can:

- Create and edit branch master data
- Create and edit unit master data
- View dashboard and branch/unit history
- Record replacement decisions
- Monitor PM and repair progress

Cannot:

- Be bypassed for replacement decisions

### 3.2 Technician / contractor

Can:

- Open branch or unit pages from QR
- Submit PM reports
- Submit repair reports
- Upload or attach photo evidence
- Add comments and issue descriptions

Cannot:

- Edit branch master data
- Edit unit master data
- Mark a unit as replaced

### 3.3 Senior / operations lead

Can:

- View progress and status for assigned branches
- Use reporting views for follow-up

## 4. Core Data Model

The MVP uses six structured sheets.

### 4.1 `Branches`

One row per branch.

Core fields:

- `branch_code`
- `outlet_name`
- `code_name`
- `full_store_name`
- `state`
- `region`
- `start_business_date`
- `senior_name`
- `supplier_name`
- `pm_start_month`
- `branch_status`
- `curtain_count`
- `ahu_count`
- `ceiling_type_count`
- `cassette_type_count`
- `branch_qr_url`
- `map_url`
- `remark`

### 4.2 `Units`

One row per unit.

Core fields:

- `unit_id`
- `branch_code`
- `unit_no`
- `unit_type`
- `unit_label`
- `brand`
- `btu`
- `model`
- `serial_no`
- `install_date`
- `warranty_end_date`
- `status`
- `data_source`
- `unit_qr_url`
- `latest_pm_date`
- `latest_repair_date`
- `latest_issue_summary`
- `replacement_flag`
- `note`

### 4.3 `PM_Logs`

One row per preventive maintenance event.

Core fields:

- `pm_log_id`
- `branch_code`
- `unit_id`
- `quarter_year`
- `scheduled_month`
- `planned_date`
- `service_date`
- `service_status`
- `technician_name`
- `supplier_name`
- `before_photo_url`
- `after_photo_url`
- `extra_photo_url_1`
- `extra_photo_url_2`
- `technician_comment`
- `central_comment`
- `submitted_at`
- `submitted_by`

### 4.4 `Repair_Logs`

One row per repair event.

Core fields:

- `repair_log_id`
- `branch_code`
- `unit_id`
- `report_date`
- `service_date`
- `issue_category`
- `issue_detail`
- `repair_action`
- `repair_status`
- `technician_name`
- `supplier_name`
- `photo_url_1`
- `photo_url_2`
- `technician_comment`
- `central_comment`
- `repair_cost_estimate`
- `submitted_at`
- `submitted_by`

### 4.5 `Replacement_History`

One row per replacement decision.

Core fields:

- `replacement_id`
- `old_unit_id`
- `branch_code`
- `decision_date`
- `reason`
- `approved_by`
- `old_unit_status`
- `new_unit_id`
- `new_brand`
- `new_btu`
- `install_date`
- `warranty_end_date`
- `note`

### 4.6 `Lookup`

Reference values for dropdowns and validation.

Core groups:

- `unit_type`
- `service_status`
- `repair_status`
- `issue_category`
- `region`
- `branch_status`

## 5. MVP Screens

### 5.1 Central dashboard

Shows:

- Total branches
- Total units
- PM due this month
- PM overdue
- Open repair jobs
- Frequently repaired units
- Supplier, region, and senior summaries

### 5.2 Branch detail

Accessed from `Branch QR` or search.

Shows:

- Branch profile
- Current supplier
- PM cycle month
- List of units in branch
- Latest status per unit

### 5.3 Unit detail

Accessed from `Unit QR`.

Shows:

- Unit profile
- Brand and BTU
- Latest PM date
- Latest repair date
- Latest issue summary
- PM history
- Repair history
- Actions to submit PM or repair reports

### 5.4 PM submission form

Technician records:

- Service date
- Technician name
- Supplier name
- Before and after photos
- Extra photos
- Comment

### 5.5 Repair submission form

Technician records:

- Report date
- Service date
- Issue category
- Issue detail
- Repair action
- Repair status
- Photos
- Comment

## 6. Operational Workflows

### 6.1 Preventive maintenance workflow

1. Technician scans `Unit QR`
2. System opens unit detail
3. Technician submits PM form
4. System stores log in `PM_Logs`
5. System refreshes `Units.latest_pm_date`
6. Dashboard updates branch and unit status

### 6.2 Repair workflow

1. Technician scans `Unit QR`
2. System opens unit detail
3. Technician submits repair form
4. System stores log in `Repair_Logs`
5. System refreshes latest repair summary on the unit
6. Central team reviews repeated failures and decides next action

### 6.3 Replacement workflow

1. Central team reviews repair history
2. If replacement is justified, central team records it in `Replacement_History`
3. Old unit status becomes `REPLACED`
4. New unit is created or assigned in `Units`

## 7. Data Migration Strategy

### 7.1 Existing source data

Initial source files provide:

- Branch master data
- Region and state
- Opening date
- Supplier
- PM cycle month
- PM completion tracking
- Aggregate counts for curtain, AHU, ceiling type, and cassette type

### 7.2 Generated unit data

Where only aggregate counts exist, unit rows will be generated automatically.

Rules:

- `CUR` for curtain
- `AHU` for AHU
- `CT` for ceiling type
- `CS` for cassette type

If brand or BTU exists only at grouped level, the value is copied to generated units and marked as aggregate-derived.

## 8. Non-Goals for MVP

The first release will not prioritize:

- Full contractor self-service administration
- Advanced cost accounting
- Automatic spare-parts inventory
- Fully normalized enterprise database from day one
- Complex authentication before pilot usage proves the flow

## 9. Risks and Controls

### 9.1 Incomplete per-unit data

Risk:

- Generated unit records may not match real-world labels perfectly at first

Control:

- Central team can correct unit metadata later
- QR rollout gradually improves data accuracy

### 9.2 Sheet growth and performance

Risk:

- Google Sheet may slow down as logs increase

Control:

- Keep web layer separated from storage layer
- Prepare for later migration to a proper database

### 9.3 Inconsistent technician input

Risk:

- Free-text data becomes hard to report on

Control:

- Use controlled dropdowns for issue and status fields
- Keep only comment fields as free text

## 10. Recommended Rollout

### Phase 1

- Clean and normalize branch data
- Generate units from aggregate counts
- Build MVP web app
- Create branch and unit QR codes

### Phase 2

- Pilot on 20 to 50 branches
- Validate form usage, photo evidence, and monitoring flow
- Correct unit master data where needed

### Phase 3

- Roll out to wider branch network
- Add replacement tracking and stronger reporting
- Decide when to migrate storage from Google Sheet to database

## 11. Success Criteria

The MVP is successful when:

- A technician can scan a QR and submit a PM or repair record in under two minutes
- Central team can see the latest PM date and repair history for any unit
- Branch-level monitoring works without editing raw spreadsheets
- Replacement decisions remain under central-team control
- New branches and generated units can be added without redesigning the system
