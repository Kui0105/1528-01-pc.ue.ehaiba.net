# Changelog

## 0.0.51 - 2026-08-28

- Added production environment configuration for `https://likeadmin.l.440.red:9443/`.

## 0.0.50 - 2026-08-28

- Changed the Vite base path to `/` so application URLs no longer require the `/admin` prefix.

## 0.0.49 - 2026-08-28

- Removed icons from website-setting child navigation entries.

## 0.0.48 - 2026-08-28

- Fixed freight-template filter controls wrapping unexpectedly by aligning the label, search input, query, and add buttons in a responsive row.

## 0.0.47 - 2026-08-28

- Improved freight-template filter layout and replaced region text fields with expandable administrative-area checkboxes.

## 0.0.46 - 2026-08-28

- Fixed website-setting menu injection to locate nested website settings nodes recursively.

## 0.0.45 - 2026-08-28

- Added About Us content configuration to website protocols.
- Added website rules, Banner, order, and freight-template settings with mock data and editing interactions.

## 0.0.44 - 2026-08-28

- Moved standard order status tabs into the list header and removed the inactive gray underline.

## 0.0.43 - 2026-08-28

- Added a shipping dialog for selecting courier company and entering tracking number before dispatch.

## 0.0.42 - 2026-08-28

- Enhanced points-order list columns, delivery information, batch shipping upload/template, and detailed order view sections.
- Removed inactive gray underline from order status tabs.

## 0.0.41 - 2026-08-28

- Added conditional freight configuration fields for points-goods delivery methods.
- Added mock freight template “测试模板” and required template/fee inputs when applicable.

## 0.0.40 - 2026-08-28

- Aligned points-goods add/edit page spacing, white background, card treatment, form widths, and grid rhythm with the standard goods editor.

## 0.0.39 - 2026-08-28

- Improved points-goods edit page spacing, section hierarchy, and responsive form layout.
- Added square single-image upload and list preview for points-mall categories.

## 0.0.38 - 2026-08-28

- Added points-goods creation-time filtering and recycle-bin recovery/permanent deletion.
- Reordered goods columns and removed inactive gray Tab underline.
- Replaced modal editing with a full white edit page covering basic, freight, and rich-text detail configuration.

## 0.0.37 - 2026-08-28

- Added points mall navigation with points goods, category, and order management pages.
- Added mock filters, status tabs, exports, pagination, CRUD dialogs, shipping, and order details.

## 0.0.36 - 2026-08-28

- Added recycle-bin product recovery with confirmation, restoring products to warehouse status.

## 0.0.35 - 2026-08-28

- Added confirmation before moving products to the recycle bin.
- Added permanent-delete action with confirmation for recycle-bin products.

## 0.0.34 - 2026-08-28

- Removed the inactive gray underline from the goods status tabs while preserving the active blue indicator.

## 0.0.33 - 2026-08-28

- Refined prize-detail tabs by removing the inactive gray underline and tightening vertical spacing.
- Added date-range batch redemption that verifies pending records by dealer and creation period.

## 0.0.32 - 2026-08-28

- Updated prize details to show only prize-winning records and two statuses: pending verification and verified.
- Moved status tabs into the card header and added dealer/time selection for batch redemption.

## 0.0.31 - 2026-08-28

- Added detail management navigation with prize and point detail pages.
- Added mock filtering, tabs, exports, pagination, and prize redemption actions.

## 0.0.30 - 2026-08-28

- Replaced dealer region text fields with linked province/city/district selectors.
- Improved status selector visibility, simplified export label, and expanded full-address mock data.

## 0.0.29 - 2026-08-28

- Added dealer management navigation and mock dealer list page.
- Added dealer search, region/status/date filters, export, pagination, CRUD, and enable/disable confirmation.

## 0.0.28 - 2026-08-28

- Ensured the first visible completed reward code mock record displays “获得100积分”.

## 0.0.27 - 2026-08-28

- Improved reward-batch filter layout for complete visibility and responsive wrapping.
- Kept reward-code status options on one line and widened the status selector.
- Changed prize-rate editing to a single-line input with a fixed percent suffix.

## 0.0.26 (current)

- Project version rolled back to 0.0.26 per request.

## 0.0.29 - 2026-08-28

- Restored reward-code batch statistics for pending activation, unscanned, scanned, and winning quantities.

## 0.0.28 - 2026-08-28

- Restored reward-batch filters and removed list-card shadows.
- Improved code-list dialog toolbar, filtering, table sizing, and pagination visibility.

## 0.0.27 - 2026-08-28

- Switched generated batches from immediate generation to direct code download in the main operation column.
- Added completed-code mock scan results with the explicit “获得100积分” outcome.
- Added real browser file downloads for reward-code exports using dealer, product, and batch naming.

## 0.0.26 - 2026-08-28

- Added reward-code status-specific scan results for activation, redemption, verification, completion, and recovery states.
- Added dealer/product/batch-named code downloads with link and verification-code columns.
- Added editable prize-rate confirmation and complete download history presentation.

## 0.0.25 - 2026-08-28

- Consolidated reward-code batch row actions into a visible More menu with a fixed right operation column.
- Added responsive reward-code filtering, bounded list scrolling, status filtering, pagination, and export affordances.
- Kept new batch creation in the ungenerated state and generation behind a second confirmation.

## 0.0.24 - 2026-08-28

- Consolidated reward-code batch actions into an always-visible generate button and hoverable More menu.
- Added a second confirmation before generation and kept newly created batches in the ungenerated state.
- Added reward-code list filtering, export, and internal pagination with bounded dialog layout.

## 0.0.23 - 2026-08-28

- Fixed the reward-code batch operation column to remain visible as a fixed right column.
- Kept immediate generation, prize-rate view, code list, code download, and download history buttons visible for every row.

## 0.0.22 - 2026-08-28

- Standardized reward-code batch row actions with immediate generation, prize-rate view, code list, code download, and download history.
- Expanded new reward-code batch creation with linked batch/dealer/product, multiple prize configurations, win rates, prize quantities, and status.
- Added a preview and second confirmation step before generating reward codes and verification codes.

## 0.0.21 - 2026-08-28

- Improved product add/edit form spacing and responsive field layout.
- Reworked reward-code batch filters into a responsive, vertically centered layout.
- Added actionable reward-code list operations: status filtering, link copying, activation, voiding, and current-list export.

## 0.0.20 - 2026-08-28

- Changed the product edit page to a clean full-white layout.
- Moved product status tabs into the list card header and removed the redundant list title while keeping add/export actions.

## 0.0.19 - 2026-08-28

- Changed product add/edit to dedicated page navigation instead of a modal dialog.
- Added text inputs for purchase price, scan points, and value, plus fixed 100x100 multi-image previews.

## 0.0.18 - 2026-08-28

- Added confirmation dialogs before enabling or disabling users.
- Added local multi-image product uploads and rich-text product details.
- Added the reward-prize list navigation and mock management page under batch management.

## 0.0.17 - 2026-08-28

- Added mock batch management navigation with total batch and reward-code batch pages.
- Added batch filtering, export, lifecycle editing, reward-code generation, prize-rate preview, code list, and download records.

## 0.0.16 - 2026-08-28

- Rebuilt the mock order list around order review, inventory entry, rejection, notes, and review history.
- Added product-rich order rows, status tabs, creation-time filtering, and detailed product and audit information.

## 0.0.15 - 2026-08-28

- Added the mock order management navigation and order list page after product management.
- Added local icons for product management, product list, product category, order management, and order list entries.

## 0.0.14 - 2026-08-28

- Switched user, product, and category lists to equal-width column distribution.
- Applied consistent 16px spacing to both outer table columns while preserving left-aligned operations.

## 0.0.13 - 2026-08-28

- Updated user, product, and category tables with 16px first-column spacing and left-aligned operation columns.
- Simplified category status cells to switches without state text.

## 0.0.12 - 2026-08-28

- Moved product status switching to count-aware tabs above the product list.
- Standardized product and user list alignment with left-aligned fields, flush first columns, and right-aligned action columns.

## 0.0.11 - 2026-08-28

- Added a mock-data product management menu between user management and application management.
- Added product list filtering, status handling, CSV export, pagination, and product add/edit dialogs.
- Added product category filtering, status switching, category add/edit dialogs, and deletion confirmation.

## 0.0.10 - 2026-08-28

- Balanced user-list column widths and centered field content for a more consistent table layout.

## 0.0.9 - 2026-08-28

- Added dealer, salesperson, sales representative, and user identities to the mock user list, export, and detail view.

## 0.0.8 - 2026-08-28

- Added a mock-data user management page with phone number, user ID, and registration date filters.
- Added paginated user listing, CSV export, and local enable/disable status switching.
- Added user detail drawer with basic information, point orders, scan records, and point-change tabs.

## 0.0.7 - 2026-08-28

- Removed the sales-ranking section heading and subtitle from the workbench.
- Renamed the new ranking cards with the 销售 prefix.

## 0.0.6 - 2026-08-28

- Added a sales-data section with activity, store-expansion, and activation TOP5 rankings.
- Replaced the visible trend charts with configurable month-over-month and year-over-year comparison trends.
- Kept the former purchase-order and product-order trend chart templates in source comments for later reuse.

## 0.0.5 - 2026-08-27

- Changed dealer activation ranking unit to 次.
- Changed product sales ranking unit to 袋.

## 0.0.4 - 2026-08-27

- Replaced the old trend charts with purchase-order and product-order trend views.
- Added day, week, and month filters plus product selection for trend data.
- Added product sales and dealer purchase-order TOP5 rankings with full-list dialogs.

## 0.0.3 - 2026-08-27

- Condensed desktop metric cards into a single six-card row.
- Renamed distribution, store, order, batch, and reward-code metrics from “数” to “量”.

## 0.0.2 - 2026-08-27

- Redesigned workbench metric cards with roomier proportions, colored accents, softer depth, and responsive layouts.
- Improved overview panel hierarchy and readability for the mock data dashboard.

## 0.0.1 - 2026-08-27

- Removed the version information and frequently used features modules from the admin workbench.
- Replaced workbench API data with local mock data for the summary and trend charts.
