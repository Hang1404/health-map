# Health-data boundaries

This prototype keeps these concerns intentionally separate for the production implementation:

- `report-parsing/`: PDF/OCR adapters return raw source text plus extraction confidence. They must never manufacture absent values or reference ranges.
- `anatomy-mapping/`: maps a verified result to a body region only when the report supports that association.
- `visualization/`: receives already-structured, verified results and only renders their statuses.
- `storage/`: future Supabase layer owns per-user access control, private report-file storage, and deletion.

The demo uses synthetic in-memory findings in `app/page.tsx`; no real health information is processed or stored.
