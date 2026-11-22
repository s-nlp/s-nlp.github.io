"""Refresh the public catalogue from an exported group workbook (requires openpyxl)."""
import argparse
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import openpyxl

TOPICS = {
    "Uncertainty & reliability": r"uncertain|hallucinat|truthful|confidence|factual|self.consisten|veracity|fact.check|calibrat",
    "Retrieval & question answering": r"retriev|question.answer|kgqa|\brag\b|search engine",
    "Text style & safety": r"detox|toxic|style transfer|hate speech|privacy|offensive|abusiv|watermark|unlearning|misalignment",
    "Lexical semantics & knowledge graphs": r"lexic|taxonomy|taxonomi|hypernym|synonym|thesaur|word sense|semantic relation|entity link|knowledge graph|disambiguat|word embedding",
    "Multilingual NLP": r"multiling|cross.ling|low.resource|russian|tatar|turkic|translat|russ[eE]",
    "Sentiment & emotion": r"sentiment|emotion|affect|opinion|absa",
    "Efficient language models": r"compress|efficient|backpropagat|fine.tun|tensor|kronecker|sparse|lora|distill|accelerat",
    "Scientific text analysis": r"scientific|research paper|scholarly|literature review",
}
SPECIAL = {
    "Methods for Detoxification": ("A. Methods for", "Methods for"),
    "Fighting with the Sparsity": ("A.: Fighting", "Fighting"),
}

def fields(citation):
    match = re.search(r"\((?:19|20)\d\d[a-z]?\)\s*[.:,]?\s*", citation)
    if match:
        authors, rest = citation[:match.start()], citation[match.end():]
    else:
        for clue, (boundary, start) in SPECIAL.items():
            if clue in citation and boundary in citation:
                pos = citation.index(start, citation.index(boundary))
                authors, rest = citation[:pos], citation[pos:]
                break
        else:
            return None
    title = re.split(r"(?<=[?!])\.?\s+(?=In |Proceedings)|\.\s+|\s+//\s+", rest.strip(), maxsplit=1)[0]
    return authors.rstrip(' ,:'), title.strip(' .')

def clean(value):
    return ' '.join(str(value or '').split())

def run(workbook):
    sheet = openpyxl.load_workbook(workbook, data_only=True)['publications']
    cols = {c.value: c.column - 1 for c in sheet[1] if c.value}
    records, seen = [], set()
    for row in sheet.iter_rows(min_row=2):
        def get(name):
            return clean(row[cols[name]].value) if name in cols else ''
        citation = get('Bibliographical information')
        parsed = fields(citation)
        if not parsed or not re.fullmatch(r'\d{4}', get('Year').removesuffix('.0')):
            continue
        authors, title = parsed
        rank = get('Rank')
        venue = get('Short')
        year = int(float(get('Year')))
        key = (year, (venue or citation).casefold(), ''.join(c for c in unicodedata.normalize('NFKC', title).casefold() if c.isalnum()))
        if not title or key in seen:
            continue
        seen.add(key)
        kind = get('Type') or 'Conference'
        cell = row[cols['Bibliographical information']]
        link = cell.hyperlink.target if cell.hyperlink else ''
        topics = [s.strip() for s in get('Topic').split('|') if s.strip()]
        topics = topics or [name for name, pattern in TOPICS.items() if re.search(pattern, title, re.I)] or ['Other NLP research']
        records.append(dict(year=year, title=title, authors=authors, citation=citation, venue=venue, rank=rank if rank not in ('','-') else 'Unranked', topics=topics, kind=kind, book=bool(re.search('volume|monograph',kind,re.I)), url=link if link and re.match('https?://',link) else ''))
    if not records:
        raise ValueError('No bibliographic records found. Check the worksheet headers.')
    target = Path(__file__).resolve().parents[1] / 'assets' / 'publications.js'
    target.write_text('const publications = ' + json.dumps(records, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
    print(len(records), 'records;', Counter(r['rank'] for r in records if not r['book']))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('workbook')
    run(parser.parse_args().workbook)
