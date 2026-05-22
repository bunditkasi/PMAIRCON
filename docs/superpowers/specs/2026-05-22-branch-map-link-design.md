# Branch Map Link Design

## Summary

Add a single `Open map` button to the branch detail page so branch users can quickly open the store location from the existing source mapping data.

## Requirements

- Show one `Open map` button on the branch detail page.
- Place the button below `Start business` and above `Supplier`.
- Render the button only when the branch has a usable `map_url`.
- Keep dashboard branch cards unchanged.
- Reuse existing branch data loading flow from Google Sheets.

## Data Source

- Primary source comes from the previously provided Google Sheet source workbook where location links appear in columns such as `Locition` / `Map`.
- The live application sheet already has a `map_url` column in `Branches`.
- The implementation should read `map_url` from the live `Branches` sheet and pass it through branch detail services to the page.

## UI Behavior

- Button label: `Open map`
- Open in a new tab/window.
- Use a calm secondary button style that fits the existing operations theme.
- Hide the control entirely when `map_url` is missing or blank.

## Data Flow

1. Enrich the live branch collection model with `mapUrl`.
2. Carry `mapUrl` through branch service types.
3. Render the button in the branch detail component when present.

## Testing

- Add unit coverage for Google Sheet row mapping of `map_url`.
- Add branch detail component coverage for:
  - showing the button when `mapUrl` exists
  - hiding the button when `mapUrl` is absent
- Run targeted tests, `build`, and `tsc --noEmit`.
