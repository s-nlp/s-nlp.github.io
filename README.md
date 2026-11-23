# S-NLP research group website

Open index.html in your browser to preview the site. To publish on the existing GitHub Pages site, copy index.html, publications.html, contact.html, alexander.html, events.html and the entire assets directory into its publishing folder. Keep the same relative paths. The site runs directly from these files.

## Maintaining the publication catalogue

The bundled snapshot comes from the publications worksheet in the group's workbook, downloaded on 22 November 2026. The site computes all totals and the annual chart from assets/publications.js on each page load. Changes to the Google Sheet become visible after refreshing that file and uploading it.

Download the updated workbook in Excel (.xlsx) format. With Python 3.9 or later installed, run these commands from this directory:

```sh
python3 -m pip install openpyxl
python3 tools/import_publications.py /path/to/group-workbook.xlsx
```

Review the changes to assets/publications.js and commit that file. To maintain a record manually, edit the corresponding object in that file; a later import will recreate it from the worksheet.

## Catalogue conventions

- Only the main publications worksheet supplies records. A numeric year and a parseable bibliographic citation identify catalogue entries. Draft notes, blank rows and planning placeholders are skipped. The original citation is available under Full citation.
- A paper is a conference, workshop (including non-archival), or journal entry. The count is per venue appearance. A matching normalized title, year and venue counts once. Where the venue abbreviation is empty, the full citation distinguishes appearances. Edited volumes and monographs have a separate collection.
- Rank and index labels come directly from the worksheet. A dash or blank appears as Unranked. Rank sorting groups conference labels, then journal quartiles, then other labels. Within each label the newest entries appear first.
- Topic labels are suggested using title keywords. To curate them, add a Topic column to the publications worksheet. Enter one or more labels separated by a vertical bar. The first label is the primary topic for sorting; filtering matches any assigned label.
- The published cards use the verified URLs in assets/paper-previews.js. For newly imported entries, they use the worksheet link until a curated preview is available.

## Publication previews

The catalogue includes short, source-linked summaries and abstract excerpts. The paper title opens the publication. If the available source is a workshop version, conference presentation or project page, the card identifies it. Click a thumbnail to load the high-resolution figure on the same page. Choose Actual size to inspect labels and scroll around the figure, or Fit to screen to see the whole illustration. Close the viewer with the Close button or Escape. Its caption links to the figure on the publisher site or to the relevant page of a source PDF.

The preview data is separate from the workbook import. Entries are matched using the year, venue, title and full citation to distinguish different appearances of the same work. Update the matching key if you change any of those fields in the worksheet. Store new thumbnail images in assets/figures. The files work entirely offline except for outbound source links.

The per-entry inventory in tools/publication-coverage.csv lists the link, snippet source and visual source for the November 2026 snapshot. A blank visual field means no verified illustration was bundled for that entry. Where a source table or poster diagram was selected, the card identifies it explicitly.
