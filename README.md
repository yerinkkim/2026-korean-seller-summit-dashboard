# 2026 Korean Seller Summit 모객 현황 대시보드

GitHub Pages로 호스팅되는 2026 Korean Seller Summit 모객 현황 대시보드입니다.

- **라이브 URL**: https://yerinkkim.github.io/2026-korean-seller-summit-dashboard/
- **데이터 출처**: Google Forms 응답 시트 (CSV)
- **개별 담당자 링크**: `data/individual-links.xlsx`

## 자동화

`.github/workflows/deploy.yml`이 매시간 정각에 Google Sheets CSV를 날려받아 `deploy/index.html`을 생성하고 GitHub Pages에 배포합니다.

### 실시간 연동 (Google Forms → GitHub Actions)

Google Forms에 새 응답이 들어올 때 즉시 배포하려면 `google-apps-script/trigger.gs`를 사용합니다.

1. GitHub에서 **repo** 권한이 있는 Personal Access Token(Classic)을 생성합니다.
2. Google Sheets에서 "확장 프로그램" > "Apps Script"를 열고 `google-apps-script/trigger.gs`의 내용을 붙여넣습니다.
3. Apps Script의 "프로젝트 설정" 또는 `setGithubConfig()` 함수로 아래 값을 저장합니다.
   - `GITHUB_TOKEN`: 1에서 생성한 토큰
   - `GITHUB_OWNER`: `yerinkkim`
   - `GITHUB_REPO`: `2026-korean-seller-summit-dashboard`
4. "트리거" 메뉴에서 `onFormSubmit` 함수가 **양식 제출 시** 실행되도록 추가합니다.

이제 구글폼 제출 직후 GitHub Actions가 즉시 실행되며, 평소에는 매시간 정각 cron이 fallback으로 동작합니다.

## 로컬 빌드

```bash
npm install
npm run build
```

빌드 결과는 `deploy/index.html`에 생성됩니다.
