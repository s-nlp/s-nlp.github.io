'use strict';

const papers = publications.filter(record => !record.book);
const labelOrder = ['A*', 'A', 'B', 'C', 'Q1', 'Q2', 'Q3', 'Q4', 'Scopus', 'Unranked', 'Monograph'];
const byId = id => document.getElementById(id);

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function histogram(records, field) {
  const counts = new Map();
  for (const record of records) counts.set(record[field], (counts.get(record[field]) || 0) + 1);
  return counts;
}

function drawChart() {
  const counts = histogram(papers, 'year');
  const last = Math.max(...counts.keys());
  const years = Array.from({length: 7}, (_, i) => last - 6 + i);
  const max = Math.max(...years.map(y => counts.get(y) || 0));
  for (const year of years) {
    const total = counts.get(year) || 0;
    const column = element('a', undefined, 'col');
    column.href = 'publications.html?year=' + year;
    column.setAttribute('aria-label', year + ': ' + total + ' papers');
    const bar = element('i');
    bar.style.height = (100 * total / max) + 'px';
    column.append(element('b', total), bar, element('span', year));
    byId('chart').append(column);
  }
}

function paperCard(record) {
  const card = element('article', undefined, 'paper');
  const details = element('div');
  const metadata = [record.venue, record.rank, record.kind].filter(Boolean).join(' · ');
  const heading = element('h3', record.title);
  if (record.url) {
    const link = element('a', record.title);
    link.href = record.url;
    heading.replaceChildren(link);
  }
  const citation = element('details');
  citation.append(element('summary', 'Full citation'), element('p', record.citation));
  details.append(element('div', metadata, 'meta'), heading, element('p', record.authors),
    element('div', record.topics.join(' · '), 'tags'), citation);
  card.append(element('strong', record.year), details);
  return card;
}

function archive() {
  const counts = histogram(papers, 'rank');
  const weight = label => labelOrder.includes(label) ? labelOrder.indexOf(label) : labelOrder.length;
  const rankOrder = (a,b) => weight(a) - weight(b) || a.localeCompare(b);
  const years = [...histogram(publications, 'year').keys()].sort((a,b) => b-a);
  const ranks = [...histogram(publications, 'rank').keys()].sort(rankOrder);
  const topics = [...new Set(publications.flatMap(r => r.topics))].sort();
  for (const [id, values] of Object.entries({year: years, rank: ranks, topic: topics})) {
    values.forEach(value => byId(id).add(new Option(value, value)));
  }
  const metrics = [['All papers', papers.length], ...[...counts].sort(([a],[b]) => rankOrder(a,b))];
  for (const [label, total] of metrics) {
    const metric = element('div', undefined, 'metric');
    metric.append(element('b', total), element('span', label));
    byId('stats').append(metric);
  }
  const defaults = {q:'', collection:'papers', year:'', topic:'', rank:'', sort:'newest'};
  const params = new URLSearchParams(location.search);
  for (const [key, fallback] of Object.entries(defaults)) {
    const control = byId(key);
    const value = params.get(key) || fallback;
    control.value = control.options && ![...control.options].some(o => o.value === value) ? fallback : value;
  }

  let matches = [];
  let visible = 0;
  function showPage() {
    const next = matches.slice(visible, visible + 20);
    byId('results').append(...next.map(paperCard));
    visible += next.length;
    byId('more').hidden = visible >= matches.length;
    byId('count').textContent = matches.length ? 'Showing ' + visible + ' of ' + matches.length + ' publications' : 'No matching publications';
  }
  function update() {
    const state = Object.fromEntries(Object.keys(defaults).map(key => [key, byId(key).value]));
    const query = state.q.trim().toLowerCase();
    matches = publications.filter(r =>
      (state.collection === 'all' || r.book === (state.collection === 'books')) &&
      (!state.year || r.year === Number(state.year)) &&
      (!state.rank || r.rank === state.rank) && (!state.topic || r.topics.includes(state.topic)) &&
      (!query || [r.citation, r.venue, ...r.topics].join(' ').toLowerCase().includes(query)));
    matches.sort((a,b) => {
      if (state.sort === 'rank' && a.rank !== b.rank) return rankOrder(a.rank,b.rank);
      if (state.sort === 'topic') {
        const difference = a.topics[0].localeCompare(b.topics[0]);
        if (difference) return difference;
      }
      return (state.sort === 'oldest' ? a.year-b.year : b.year-a.year) || a.title.localeCompare(b.title);
    });
    const url = new URL(location.href);
    for (const [key, value] of Object.entries(state)) {
      if (value !== defaults[key]) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (/^https?:$/.test(location.protocol)) history.replaceState(null, '', url);
    byId('results').replaceChildren();
    visible = 0;
    showPage();
  }
  byId('filters').addEventListener('submit', event => event.preventDefault());
  byId('filters').addEventListener('input', update);
  byId('reset').addEventListener('click', () => {
    for (const [key,value] of Object.entries(defaults)) byId(key).value = value;
    update();
  });
  byId('more').addEventListener('click', showPage);
  update();
}

if (byId('chart')) drawChart();
if (byId('filters')) archive();
