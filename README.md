# 2026 Korean Seller Summit 모객 현황 대시보드

GitHub Pages로 호스팅되는 2026 Korean Seller Summit 모객 현황 대시보드입니다.

- **라이브 URL**: https://yerinkkim.github.io/2026-korean-seller-summit-dashboard/
- **데이터 출처**: Google Forms 응답 시트 (CSV)
- **개별 담당자 링크**: `data/individual-links.xlsx`

## 자동화

`.github/workflows/deploy.yml`이 매시간 정각에 Google Sheets CSV를 날려받아 `deploy/index.html`을 생성하고 GitHub Pages에 배포합니다.

## 로컬 빌드

```bash
npm install
npm run build
```

빌드 결과는 `deploy/index.html`에 생성됩니다.
