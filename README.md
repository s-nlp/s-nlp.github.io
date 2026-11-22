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
- Direct paper links come from hyperlinks attached to bibliographic cells. Entries without such links retain their full citation.
