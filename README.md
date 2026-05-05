# wayexam-landing

`wayexam.com` 루트 도메인의 hub 랜딩 페이지.

## 역할
1. **AdSense 검증**: `wayexam.com/ads.txt` 응답 → AdSense가 wayexam.com 소유권 확인 (등록 시 모든 서브도메인 광고 노출 포함)
2. **사용자 진입점**: 4개 자격시험 사이트(PMP, 공인노무사, 산업안전, 산업보건) 카드 메뉴
3. **SEO 허브**: 4개 사이트를 묶어주는 검색엔진용 hub

## 환경변수 (Railway)
- `ADSENSE_PUBLISHER_ID` — `ca-pub-XXXXXXXXXXXXXXXX` (없으면 `/ads.txt` → 404)

## 로컬 실행
```bash
npm install
node server.js
# → http://localhost:3000
```

## 배포
- GitHub: `prolab-PMP/wayexam-landing`
- Railway: 새 service, 위 GitHub repo 연결
- Custom domain: `wayexam.com` (Railway → Custom Domain)
- Gabia DNS: `wayexam.com` (호스트 @) → Railway에서 발급한 ALIAS/A target
