const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1EetrtA3l3e-TrUtuNa8JSjMPLVUYAyeq45jvy-zwe_E/export?format=csv&gid=2098392696';
const TEMPLATE_PATH = path.join(__dirname, 'template.html');
const EXCEL_PATH = process.env.EXCEL_PATH || path.join(__dirname, 'data', 'individual-links.xlsx');
const DEPLOY_DIR = path.join(__dirname, 'deploy');
const DEPLOY_FILE = path.join(DEPLOY_DIR, 'index.html');

const GROUP_ORDER = ['2', '3', '4', '부산', '채널팀', '운영팀', '마케팅'];
const GROUP_NAMES = {
  '2': 'Seoul Team 2',
  '3': 'Seoul Team 3',
  '4': 'Seoul Team 4',
  '부산': 'Busan Team 1',
  '채널팀': 'Channel',
  '운영팀': '운영팀',
  '마케팅': '마케팅'
};

function normalizeCell(val) {
  return String(val || '').trim();
}

function readLinksFromExcel() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Excel 파일을 찾을 수 없습니다: ${EXCEL_PATH}`);
  }
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const links = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    const group = normalizeCell(row[0]);
    const name = normalizeCell(row[1]);
    const url = normalizeCell(row[2]);
    if (!group || !name || !url) continue;
    links.push({ group, name, url });
  }
  return links;
}

function generateLinksHtml(links) {
  const grouped = {};
  for (const item of links) {
    if (!grouped[item.group]) grouped[item.group] = [];
    grouped[item.group].push(item);
  }

  const sections = [];
  for (const groupKey of GROUP_ORDER) {
    const items = grouped[groupKey];
    if (!items || items.length === 0) continue;
    const teamName = GROUP_NAMES[groupKey] || groupKey;
    const anchors = items.map(item =>
      `<a href="${item.url}" target="_blank" rel="noopener noreferrer" class="inline-block px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm rounded hover:bg-indigo-100 transition">${item.name}</a>`
    ).join('');
    sections.push(`
      <div>
        <h3 class="text-sm font-semibold text-slate-700 mb-2">${teamName}</h3>
        <div class="flex flex-wrap gap-2">${anchors}</div>
      </div>
    `);
  }

  if (sections.length === 0) {
    return '<section class="card"><h2 class="text-lg font-semibold mb-3">개별 담당자 신청 링크</h2><p class="text-sm text-slate-500">등록된 담당자 링크가 없습니다.</p></section>';
  }

  return `
    <section class="card">
      <h2 class="text-lg font-semibold mb-4">개별 담당자 신청 링크</h2>
      <div class="space-y-6">
        ${sections.join('')}
      </div>
    </section>
  `;
}

async function main() {
  console.log('[' + new Date().toLocaleString('ko-KR') + '] Google Sheets CSV 다운로드 중...');
  const response = await fetch(SHEET_CSV_URL, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`CSV 다운로드 실패: ${response.status} ${response.statusText}`);
  }
  let csvText = await response.text();
  if (!csvText || csvText.length < 10) {
    throw new Error('CSV 내용이 비어 있습니다.');
  }
  console.log(`CSV ${csvText.length}바이트 다운로드 완료`);

  // CSV를 Base64로 인코딩 (UTF-8)
  const encodedCsv = Buffer.from(csvText, 'utf-8').toString('base64');

  // 템플릿 HTML 읽기
  let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // 개별 담당자 링크 섹션 삽입
  console.log('Excel 파일에서 담당자 링크 읽는 중...');
  const links = readLinksFromExcel();
  const linksHtml = generateLinksHtml(links);
  const linksReplaced = html.replace('<!-- INDIVIDUAL_LINKS_PLACEHOLDER -->', linksHtml);
  if (linksReplaced === html) {
    throw new Error('HTML 내 NDIVIDUAL_LINKS_PLACEHOLDER 를 찾지 못했습니다.');
  }
  html = linksReplaced;
  console.log(`${links.length}개의 담당자 링크 삽입 완료`);

  // embedded-csv 태그 내용 교체
  const replaced = html.replace(
    /<script type="text\/csv" id="embedded-csv"[^>]*>[\s\S]*?<\/script>/,
    `<script type="text/csv" id="embedded-csv" data-mode="embedded">${encodedCsv}</script>`
  );
  if (replaced === html) {
    throw new Error('HTML 내 embedded-csv 태그를 찾지 못했습니다.');
  }
  html = replaced;

  // 배포 폴터 준비
  if (!fs.existsSync(DEPLOY_DIR)) {
    fs.mkdirSync(DEPLOY_DIR, { recursive: true });
  }

  // index.html 저장
  fs.writeFileSync(DEPLOY_FILE, html, 'utf-8');
  console.log(`배포용 index.html 생성 완료: ${DEPLOY_FILE}`);
}

main().catch(err => {
  console.error('오류 발생:', err.message);
  process.exit(1);
});
