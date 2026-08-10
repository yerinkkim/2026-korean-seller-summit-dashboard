/**
 * Google Forms → GitHub Actions 실시간 연동 트리거
 *
 * 설치 방법:
 * 1. Google Sheets에서 "확장 프로그램" > "Apps Script" 열기
 * 2. 이 파일 전체를 붙여넣기
 * 3. 왼쪽 시계 아이콘("트리거") > "트리거 추가" 클릭
 * 4. 이벤트 소스: "Google Forms에서" 또는 "스프레드시트에서"
 *    - 양식 제출 시(on form submit) 실행되도록 설정
 * 5. GitHub personal access token을 Script Properties에 저장:
 *    - GITHUB_TOKEN: repo 권한이 있는 classic token
 *    - GITHUB_OWNER: yerinkkim (기본값)
 *    - GITHUB_REPO: 2026-korean-seller-summit-dashboard (기본값)
 */

function onFormSubmit(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('GITHUB_TOKEN');
  const owner = props.getProperty('GITHUB_OWNER') || 'yerinkkim';
  const repo = props.getProperty('GITHUB_REPO') || '2026-korean-seller-summit-dashboard';

  if (!token) {
    throw new Error('GITHUB_TOKEN이 Script Properties에 설정되지 않았습니다.');
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/dispatches`;
  const payload = {
    event_type: 'form-submit',
    client_payload: {
      source: 'google-forms',
      timestamp: new Date().toISOString()
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'google-apps-script'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const res = UrlFetchApp.fetch(url, options);
  const code = res.getResponseCode();

  if (code !== 204) {
    console.error('GitHub dispatch 실패:', code, res.getContentText());
    throw new Error(`GitHub dispatch 실패: HTTP ${code}`);
  }

  console.log('GitHub Actions 실시간 빌드 트리거 완료:', code);
}

/**
 * 한 번만 실행해서 Script Properties에 값을 저장하는 헬퍼 함수
 * (실제 트리거와는 별개로, 필요할 때 Apps Script 편집기에서 수동 실행)
 */
function setGithubConfig() {
  PropertiesService.getScriptProperties().setProperties({
    GITHUB_TOKEN: '여기에_토큰_입력',
    GITHUB_OWNER: 'yerinkkim',
    GITHUB_REPO: '2026-korean-seller-summit-dashboard'
  });
}
