// 전역 에러 디버깅 모니터링
window.addEventListener('error', function(e) {
  console.error("에러 감지:", e);
  alert("런타임 오류가 발생했습니다.\n에러: " + e.message + "\n라인: " + e.lineno + "\n파일: " + e.filename);
});

// --- 글로벌 상태 관리 ---
let slides = [
  {
    type: 'intro',
    title: '사이버펑크 메트로폴리스',
    subtitle: '화려한 네온사인과 미래 도시의 야경',
    body1: '',
    body2: '',
    bgImage: '', // base64 이미지 데이터
    bgScale: 100,
    bgX: 0,
    bgY: 0,
    fontFamily: "'Pretendard', sans-serif",
    textAlignment: 'left',
    titleSize: 48,
    bodySize: 34,
    contentOffsetY: 0,
    bgOpacity: 100,
    matteColor: "#000000",
    matteOpacity: 0,
    verticalAlignment: "center",
    useContentBox: "none",
    badgeText: "INFO CARD",
    textColor: "#ffffff",
    accentColor: "#00f0ff"
  }
];
let currentIndex = 0;

// 글로벌 브랜드 로고 상태 (모든 슬라이드 공용)
let brandLogo = {
  image: '', // base64 이미지 데이터
  scale: 70,
  opacity: 100
};

let activeTheme = 'dark';
let instagramId = '@ai_explorer';

// 한글 폰트에서 지원하지 않는 이모지(유니코드 16비트 초과 대역 등)를 제거합니다.
function remove_emoji(text) {
  if (typeof text !== 'string') text = String(text || '');
  return Array.from(text).filter(c => c.codePointAt(0) < 0x10000).join('');
}

// 텍스트 강조 처리 헬퍼 함수 (대괄호 [단어] 패턴 치환)
function applyHighlight(text) {
  if (typeof text !== 'string') text = String(text || '');
  const cleanText = remove_emoji(text);
  // HTML 이스케이프 처리
  const escaped = cleanText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.replace(/\[(.*?)\]/g, '<span class="highlight-text">$1</span>');
}

// 로컬 스토리지 임시 저장
function saveToLocalStorage() {
  const state = {
    slides,
    currentIndex,
    brandLogo,
    activeTheme,
    instagramId
  };
  localStorage.setItem('carousel_builder_state', JSON.stringify(state));
}

// 로컬 스토리지 데이터 로드
function loadFromLocalStorage() {
  const saved = localStorage.getItem('carousel_builder_state');
  if (saved) {
    try {
      const state = JSON.parse(saved);
      // 구버전 저장 데이터 구조 하방 호환성 안전 맵핑
      slides = state.slides.map(slide => ({
        type: slide.type || 'body',
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        body1: slide.body1 || '',
        body2: slide.body2 || '',
        bgImage: slide.bgImage || '',
        bgScale: slide.bgScale || 100,
        bgOpacity: slide.bgOpacity !== undefined ? slide.bgOpacity : 100,
        bgX: slide.bgX || 0,
        bgY: slide.bgY || 0,
        matteColor: slide.matteColor || "#000000",
        matteOpacity: slide.matteOpacity !== undefined ? slide.matteOpacity : 0,
        fontFamily: slide.fontFamily || "'Pretendard', sans-serif",
        textAlignment: slide.textAlignment || "left",
        verticalAlignment: slide.verticalAlignment || "center",
        useContentBox: slide.useContentBox || "none",
        titleSize: slide.titleSize || 48,
        bodySize: slide.bodySize || 34,
        contentOffsetY: slide.contentOffsetY || 0,
        badgeText: slide.badgeText || "INFO CARD",
        textColor: slide.textColor || "#ffffff",
        accentColor: slide.accentColor || "#00f0ff"
      }));
      currentIndex = state.currentIndex || 0;
      brandLogo = state.brandLogo || brandLogo;
      activeTheme = state.activeTheme || 'dark';
      instagramId = state.instagramId || '@ai_explorer';
      return true;
    } catch(e) {
      console.error("임시 저장 로드 오류:", e);
    }
  }
  return false;
}

// --- DOM 요소 참조 ---
const selectSlideType = document.getElementById('selectSlideType');
const inputInstagramId = document.getElementById('inputInstagramId');
const inputTitle = document.getElementById('inputTitle');
const inputSubtitle = document.getElementById('inputSubtitle');
const inputBadge = document.getElementById('inputBadge'); // 배지 텍스트 (신규)
const inputBody1 = document.getElementById('inputBody1');
const inputBody2 = document.getElementById('inputBody2');

const introSubGroup = document.getElementById('introSubGroup');
const bodyContentGroup = document.getElementById('bodyContentGroup');

// 타이포그래피 및 배치 조절 신규 요소 참조
const selectFontFamily = document.getElementById('selectFontFamily');
const selectTextAlignment = document.getElementById('selectTextAlignment');
const inputTitleSize = document.getElementById('inputTitleSize');
const inputBodySize = document.getElementById('inputBodySize');
const inputContentOffsetY = document.getElementById('inputContentOffsetY');

const inputTextColor = document.getElementById('inputTextColor'); // 기본 글자색 (신규)
const inputAccentColor = document.getElementById('inputAccentColor'); // 강조 글자색 (신규)

const slideIndicator = document.getElementById('slideIndicator');
const prevSlideBtn = document.getElementById('prevSlideBtn');
const nextSlideBtn = document.getElementById('nextSlideBtn');
const addSlideBtn = document.getElementById('addSlideBtn');
const deleteSlideBtn = document.getElementById('deleteSlideBtn');

// 배경/로고 조정 패널 요소
const bgDropzone = document.getElementById('bgDropzone');
const bgFileInput = document.getElementById('bgFileInput');
const bgAdjustments = document.getElementById('bgAdjustments');
const bgScale = document.getElementById('bgScale');
const bgOpacity = document.getElementById('bgOpacity'); // 배경 투명도 (신규)
const bgPositionX = document.getElementById('bgPositionX');
const bgPositionY = document.getElementById('bgPositionY');
const inputMatteColor = document.getElementById('inputMatteColor'); // 색상 매트 (신규)
const inputMatteOpacity = document.getElementById('inputMatteOpacity'); // 매트 투명도 (신규)
const resetBgBtn = document.getElementById('resetBgBtn');

const logoDropzone = document.getElementById('logoDropzone');
const logoFileInput = document.getElementById('logoFileInput');
const logoAdjustments = document.getElementById('logoAdjustments');
const logoScale = document.getElementById('logoScale');
const logoOpacity = document.getElementById('logoOpacity');
const resetLogoBtn = document.getElementById('resetLogoBtn');

const selectVerticalAlignment = document.getElementById('selectVerticalAlignment'); // 수직 정렬 (신규)
const selectContentBox = document.getElementById('selectContentBox'); // 콘텐츠 박스 (신규)

// 로컬 폰트 업로드 엘리먼트 참조 (신규)
const fontDropzone = document.getElementById('fontDropzone');
const fontFileInput = document.getElementById('fontFileInput');
const clearStorageBtn = document.getElementById('clearStorageBtn');

// 프리뷰 카드 요소
const captureCard = document.getElementById('captureCard');
const cardBgElement = document.getElementById('cardBgElement');
const cardOverlayElement = document.getElementById('cardOverlayElement'); // 오버레이 레이어 (신규)
const cardInstagramId = document.getElementById('cardInstagramId');
const cardPageIndicator = document.getElementById('cardPageIndicator');
const cardProgressFill = document.getElementById('cardProgressFill');

const cardIntroView = document.getElementById('cardIntroView');
const cardBadge = document.querySelector('.card-badge'); // 프리뷰 배지 요소 (신규)
const cardIntroTitle = document.getElementById('cardIntroTitle');
const cardIntroSubtitle = document.getElementById('cardIntroSubtitle');

const cardBodyView = document.getElementById('cardBodyView');
const cardBodyTitle = document.getElementById('cardBodyTitle');
const cardBodyPoint1 = document.getElementById('cardBodyPoint1').querySelector('.point-text');
const cardBodyPoint2 = document.getElementById('cardBodyPoint2').querySelector('.point-text');

const cardOutroView = document.getElementById('cardOutroView');
const cardOutroTitle = document.getElementById('cardOutroTitle');
const cardOutroSubtitle = document.getElementById('cardOutroSubtitle');
const cardCtaText = document.getElementById('cardCtaText');

const cardLogoElement = document.getElementById('cardLogoElement');

// --- 파일 핸들링 & 드래그앤드롭 ---
function initDropzones() {
  // 배경 드롭존 클릭 시 input 파일 선택 유도
  bgDropzone.addEventListener('click', () => bgFileInput.click());
  bgFileInput.addEventListener('change', (e) => handleFile(e.target.files[0], 'bg'));

  // 로고 드롭존 클릭 시
  logoDropzone.addEventListener('click', () => logoFileInput.click());
  logoFileInput.addEventListener('change', (e) => handleFile(e.target.files[0], 'logo'));

  // 드래그 앤 드롭 이벤트 처리
  [bgDropzone, logoDropzone].forEach(dropzone => {
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      const type = dropzone.id === 'bgDropzone' ? 'bg' : 'logo';
      handleFile(file, type);
    });
  });
}

function handleFile(file, target) {
  if (!file || !file.type.startsWith('image/')) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const base64Data = event.target.result;
    if (target === 'bg') {
      slides[currentIndex].bgImage = base64Data;
      
      // 이미지 원본 비율 구하기
      const img = new Image();
      img.src = base64Data;
      img.onload = () => {
        slides[currentIndex].imageRatio = img.naturalWidth / img.naturalHeight;
        if (bgAdjustments) bgAdjustments.classList.remove('hidden');
        updatePreview();
        saveToLocalStorage();
      };
    } else if (target === 'logo') {
      brandLogo.image = base64Data;
      if (logoAdjustments) logoAdjustments.classList.remove('hidden');
      updatePreview();
      saveToLocalStorage();
    }
  };
  reader.readAsDataURL(file);
}

// --- 실시간 프리뷰 동기화 렌더러 ---
function updatePreview() {
  const currentSlide = slides[currentIndex];

  // 1. 인스타그램 계정명 동기화
  cardInstagramId.textContent = instagramId;

  // 2. 페이지네이션 정보 & 프로그레스 바 동기화
  const total = slides.length;
  const currentStr = String(currentIndex + 1).padStart(2, '0');
  const totalStr = String(total).padStart(2, '0');
  cardPageIndicator.textContent = `${currentStr} / ${totalStr}`;
  cardProgressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;

  // 3. 슬라이드 유형에 따른 내용 동기화
  // 뷰 전부 숨기기
  cardIntroView.classList.add('hidden');
  cardBodyView.classList.add('hidden');
  cardOutroView.classList.add('hidden');

  if (currentSlide.type === 'intro') {
    cardIntroView.classList.remove('hidden');
    cardBadge.innerHTML = applyHighlight(currentSlide.badgeText || 'INFO CARD'); // 배지 문구 동기화
    cardIntroTitle.innerHTML = applyHighlight(currentSlide.title || '메인 제목을 입력하세요');
    cardIntroSubtitle.innerHTML = applyHighlight(currentSlide.subtitle || '이 카드를 넘기면 얻게 될 혜택');
  } else if (currentSlide.type === 'body') {
    cardBodyView.classList.remove('hidden');
    cardBodyTitle.innerHTML = applyHighlight(currentSlide.title || '개념/원리를 입력하세요');
    cardBodyPoint1.innerHTML = applyHighlight(currentSlide.body1 || '첫 번째 유용한 정보');
    cardBodyPoint2.innerHTML = applyHighlight(currentSlide.body2 || '두 번째 상세 설명');
  } else if (currentSlide.type === 'outro') {
    cardOutroView.classList.remove('hidden');
    cardOutroTitle.innerHTML = applyHighlight(currentSlide.title || '도움이 되셨나요?');
    cardOutroSubtitle.innerHTML = applyHighlight(currentSlide.subtitle || '좋아요와 저장으로 팁을 간직하세요!');
    cardCtaText.innerHTML = applyHighlight(currentSlide.body1 || '이 정보 저장하기');
  }

  // 4. 배경 이미지 렌더링 및 변형(Adjustments) 적용
  if (currentSlide.bgImage) {
    cardBgElement.style.backgroundImage = `url(${currentSlide.bgImage})`;
    
    // 배율(scale) 및 원본 이미지의 비율 계산
    const scale = (currentSlide.bgScale || 100) / 100;
    const ratio = currentSlide.imageRatio || 1.0;
    const cardRatio = 1080 / 1350; // 4:5 규격 비율 (0.8)
    
    let maxX = 0;
    let maxY = 0;
    
    if (ratio > cardRatio) {
      // 가로가 더 긴 이미지: 세로 높이가 100% 기준 카드 높이(1350px)에 딱 맞춰진 상태
      const originalWidth = 1350 * ratio;
      maxX = (originalWidth * scale - 1080) / 2;
      maxY = (1350 * scale - 1350) / 2;
    } else {
      // 세로가 더 긴 이미지 (또는 정방형): 가로 폭이 카드 너비(1080px)에 맞춰진 상태
      const originalHeight = 1080 / ratio;
      maxX = (1080 * scale - 1080) / 2;
      maxY = (originalHeight * scale - 1350) / 2;
    }
    
    // 음수가 되지 않도록 보호 (여백 강제 노출 방지)
    maxX = Math.max(0, maxX);
    maxY = Math.max(0, maxY);
    
    // 슬라이더(-100 ~ 100) 백분율 매핑하여 픽셀 오프셋 구하기
    const translateX = ((currentSlide.bgX || 0) / 100) * maxX;
    const translateY = ((currentSlide.bgY || 0) / 100) * maxY;
    
    // scale이 적용된 상태이므로 translate 좌표를 scale만큼 나눠서 상쇄해 주어야 물리 픽셀 크롭 1:1 매칭이 일어남
    cardBgElement.style.transform = `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`;
    cardBgElement.style.backgroundPosition = 'center';
    
    cardBgElement.style.opacity = (currentSlide.bgOpacity !== undefined ? currentSlide.bgOpacity : 100) / 100;
    if (bgAdjustments) bgAdjustments.classList.remove('hidden');
    
    // 조절 바 값 세팅
    if (bgScale) bgScale.value = currentSlide.bgScale;
    if (bgOpacity) bgOpacity.value = currentSlide.bgOpacity !== undefined ? currentSlide.bgOpacity : 100;
    if (bgPositionX) bgPositionX.value = currentSlide.bgX;
    if (bgPositionY) bgPositionY.value = currentSlide.bgY;
    
    // 색상 매트 컨트롤러 연동
    if (inputMatteColor) inputMatteColor.value = currentSlide.matteColor || '#000000';
    if (inputMatteOpacity) inputMatteOpacity.value = currentSlide.matteOpacity !== undefined ? currentSlide.matteOpacity : 0;
  } else {
    cardBgElement.style.backgroundImage = 'none';
    if (bgAdjustments) bgAdjustments.classList.add('hidden');
  }

  // 색상 매트 오버레이 실시간 렌더링
  cardOverlayElement.style.backgroundColor = currentSlide.matteColor || '#000000';
  cardOverlayElement.style.opacity = (currentSlide.matteOpacity !== undefined ? currentSlide.matteOpacity : 0) / 100;

  // 4-2. 사용자 정의 글자 및 강조 색상 프리뷰 카드 주입
  if (captureCard) {
    captureCard.style.setProperty('--card-text-color', currentSlide.textColor || '#ffffff');
    captureCard.style.setProperty('--card-accent-color', currentSlide.accentColor || '#00f0ff');
  }

  // 5. 공용 브랜드 로고 렌더링
  if (brandLogo.image) {
    cardLogoElement.src = brandLogo.image;
    cardLogoElement.style.maxWidth = `${brandLogo.scale * 2}px`;
    cardLogoElement.style.opacity = brandLogo.opacity / 100;
    cardLogoElement.classList.remove('hidden');
    if (logoAdjustments) logoAdjustments.classList.remove('hidden');
    
    if (logoScale) logoScale.value = brandLogo.scale;
    if (logoOpacity) logoOpacity.value = brandLogo.opacity;
  } else {
    cardLogoElement.src = '';
    cardLogoElement.classList.add('hidden');
    if (logoAdjustments) logoAdjustments.classList.add('hidden');
  }

  // 6. 타이포그래피 및 문장 정렬/배치 실시간 인라인 스타일 주입 (신규 고도화)
  captureCard.style.fontFamily = currentSlide.fontFamily || "'Pretendard', sans-serif";
  
  // 정렬 클래스 교체
  captureCard.classList.remove('align-left', 'align-center', 'align-right');
  captureCard.classList.add(`align-${currentSlide.textAlignment || 'left'}`);

  // 제목 폰트 크기 동적 조절 (Intro/Outro는 기본 타이틀보다 더 크게 배율 적용)
  const isIntroOrOutro = currentSlide.type === 'intro' || currentSlide.type === 'outro';
  const calculatedTitleSize = isIntroOrOutro ? (currentSlide.titleSize || 48) * 1.3 : (currentSlide.titleSize || 48);
  cardIntroTitle.style.fontSize = `${calculatedTitleSize}px`;
  cardBodyTitle.style.fontSize = `${calculatedTitleSize}px`;
  cardOutroTitle.style.fontSize = `${calculatedTitleSize}px`;

  // 본문 폰트 크기 동적 조절
  const calculatedBodySize = currentSlide.bodySize || 34;
  cardIntroSubtitle.style.fontSize = `${calculatedBodySize}px`;
  cardBodyPoint1.style.fontSize = `${calculatedBodySize}px`;
  cardBodyPoint2.style.fontSize = `${calculatedBodySize}px`;
  cardOutroSubtitle.style.fontSize = `${calculatedBodySize}px`;

  // 상하 배치 (Y축 오프셋 - html2canvas 왜곡 방지를 위해 transform 대신 marginTop 적용)
  const cardBodyContainer = document.querySelector('.card-body');
  cardBodyContainer.style.marginTop = `${currentSlide.contentOffsetY || 0}px`;
  cardBodyContainer.style.transform = 'none';

  // 수직 정렬 주입 (상단, 중앙, 하단 배치)
  cardBodyContainer.style.justifyContent = currentSlide.verticalAlignment || 'center';

  // 콘텐츠 박스 스타일 (글래스모피즘 / 불투명 카드 / 하단 띠 디자인 분기 처리)
  cardBodyContainer.classList.remove('content-box-glass', 'content-box-card', 'content-box-stripe');
  if (currentSlide.useContentBox !== 'none') {
    cardBodyContainer.classList.add(`content-box-${currentSlide.useContentBox}`);
  }

  // 7. 인디케이터 상태 갱신
  slideIndicator.textContent = `${currentIndex + 1} / ${total}`;
}

// --- 입력 폼 값을 현재 슬라이드 데이터에 저장 ---
function saveCurrentInput() {
  const currentSlide = slides[currentIndex];
  currentSlide.type = selectSlideType.value;
  currentSlide.title = inputTitle.value;
  
  if (currentSlide.type === 'intro') {
    currentSlide.subtitle = inputSubtitle.value;
    currentSlide.badgeText = inputBadge.value; // 배지 텍스트 저장
  } else if (currentSlide.type === 'body') {
    currentSlide.body1 = inputBody1.value;
    currentSlide.body2 = inputBody2.value;
  } else if (currentSlide.type === 'outro') {
    currentSlide.subtitle = inputSubtitle.value;
    currentSlide.body1 = inputBody1.value; // CTA 텍스트를 body1에 매핑 저장
  }

  // 타이포그래피 & 배치 값 세이브 (신규)
  if (selectFontFamily) currentSlide.fontFamily = selectFontFamily.value;
  if (selectTextAlignment) currentSlide.textAlignment = selectTextAlignment.value;
  if (inputTitleSize) currentSlide.titleSize = parseInt(inputTitleSize.value);
  if (inputBodySize) currentSlide.bodySize = parseInt(inputBodySize.value);
  if (inputContentOffsetY) currentSlide.contentOffsetY = parseInt(inputContentOffsetY.value);

  // 배경 이미지 고도화 및 배치 스타일 저장
  if (selectVerticalAlignment) currentSlide.verticalAlignment = selectVerticalAlignment.value;
  if (selectContentBox) currentSlide.useContentBox = selectContentBox.value;
  if (inputTextColor) currentSlide.textColor = inputTextColor.value;
  if (inputAccentColor) currentSlide.accentColor = inputAccentColor.value;
  if (currentSlide.bgImage) {
    if (bgOpacity) currentSlide.bgOpacity = parseInt(bgOpacity.value);
    if (inputMatteColor) currentSlide.matteColor = inputMatteColor.value;
    if (inputMatteOpacity) currentSlide.matteOpacity = parseInt(inputMatteOpacity.value);
  }
}

// --- 슬라이드 로드 ---
function loadSlide(index) {
  currentIndex = index;
  const currentSlide = slides[currentIndex];

  // 폼 UI 동기화
  selectSlideType.value = currentSlide.type;
  inputTitle.value = currentSlide.title || '';
  inputSubtitle.value = currentSlide.subtitle || '';
  if (inputBadge) inputBadge.value = currentSlide.badgeText || ''; // 배지 텍스트 로드
  inputBody1.value = currentSlide.body1 || '';
  inputBody2.value = currentSlide.body2 || '';

  // 타이포그래피 & 배치 값 인풋에 로드 (신규)
  selectFontFamily.value = currentSlide.fontFamily || "'Pretendard', sans-serif";
  selectTextAlignment.value = currentSlide.textAlignment || "left";
  inputTitleSize.value = currentSlide.titleSize || 48;
  inputBodySize.value = currentSlide.bodySize || 34;
  inputContentOffsetY.value = currentSlide.contentOffsetY || 0;

  // 수직 정렬 및 텍스트 박스 세팅 로드
  if (selectVerticalAlignment) selectVerticalAlignment.value = currentSlide.verticalAlignment || 'center';
  if (selectContentBox) selectContentBox.value = currentSlide.useContentBox || 'none';
  if (inputTextColor) inputTextColor.value = currentSlide.textColor || '#ffffff';
  if (inputAccentColor) inputAccentColor.value = currentSlide.accentColor || '#00f0ff';

  // 타입 필드 노출 분기 처리
  toggleTypeInputs(currentSlide.type);

  updatePreview();
}

function toggleTypeInputs(type) {
  introSubGroup.classList.add('hidden');
  bodyContentGroup.classList.add('hidden');

  if (type === 'intro') {
    introSubGroup.classList.remove('hidden');
    introSubGroup.querySelector('label').textContent = '서브타이틀';
  } else if (type === 'body') {
    bodyContentGroup.classList.remove('hidden');
  } else if (type === 'outro') {
    introSubGroup.classList.remove('hidden');
    introSubGroup.querySelector('label').textContent = '서브 문구';
    bodyContentGroup.classList.remove('hidden');
    // 아웃트로는 CTA 텍스트만 필요하므로 두 번째는 숨기고 라벨링 변경
    bodyContentGroup.querySelector('label[for="inputBody1"]').textContent = 'CTA 버튼 텍스트';
    bodyContentGroup.querySelector('textarea[for="inputBody2"]').classList.add('hidden');
    bodyContentGroup.querySelector('label[for="inputBody2"]').classList.add('hidden');
  } else {
    bodyContentGroup.querySelector('textarea[for="inputBody2"]').classList.remove('hidden');
    bodyContentGroup.querySelector('label[for="inputBody2"]').classList.remove('hidden');
  }
}

// --- 이벤트 바인딩 ---
function initEvents() {
  // 인풋 양방향 바인딩
  [inputTitle, inputSubtitle, inputBody1, inputBody2, inputBadge].forEach(element => {
    element.addEventListener('input', () => {
      saveCurrentInput();
      updatePreview();
    });
  });

  inputInstagramId.addEventListener('input', (e) => {
    instagramId = e.target.value;
    updatePreview();
  });

  // 타이포그래피 및 배치 조절 이벤트 바인딩 (신규)
  [selectFontFamily, selectTextAlignment].forEach(element => {
    if (element) {
      element.addEventListener('change', () => {
        saveCurrentInput();
        updatePreview();
        saveToLocalStorage();
      });
    }
  });
  [inputTitleSize, inputBodySize, inputContentOffsetY, inputTextColor, inputAccentColor].forEach(element => {
    if (element) {
      element.addEventListener('input', () => {
        saveCurrentInput();
        updatePreview();
        saveToLocalStorage();
      });
    }
  });

  // 수직 정렬 & 콘텐츠 박스 이벤트 바인딩
  if (selectVerticalAlignment) {
    selectVerticalAlignment.addEventListener('change', () => {
      saveCurrentInput();
      updatePreview();
      saveToLocalStorage();
    });
  }
  if (selectContentBox) {
    selectContentBox.addEventListener('change', () => {
      saveCurrentInput();
      updatePreview();
      saveToLocalStorage();
    });
  }

  // 슬라이드 유형 셀렉터
  selectSlideType.addEventListener('change', (e) => {
    const type = e.target.value;
    slides[currentIndex].type = type;
    toggleTypeInputs(type);
    
    // 기본 플레이스홀더 제공
    if (type === 'intro') {
      slides[currentIndex].title = slides[currentIndex].title || '사이버펑크 메트로폴리스';
      slides[currentIndex].subtitle = slides[currentIndex].subtitle || '화려한 네온사인과 미래 도시의 야경';
    } else if (type === 'body') {
      slides[currentIndex].title = slides[currentIndex].title || '01. 첫 번째 개념 포인트';
      slides[currentIndex].body1 = slides[currentIndex].body1 || '핵심적인 설명 문구를 적어주세요.';
      slides[currentIndex].body2 = slides[currentIndex].body2 || '개념을 보완하는 데이터를 넣어보세요.';
    } else if (type === 'outro') {
      slides[currentIndex].title = slides[currentIndex].title || '정보를 간직하세요!';
      slides[currentIndex].subtitle = slides[currentIndex].subtitle || '좋아요와 저장으로 팁을 소장하세요';
      slides[currentIndex].body1 = slides[currentIndex].body1 || '이 정보 저장하기';
    }

    loadSlide(currentIndex);
  });

  // 네비게이션 제어
  prevSlideBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      saveCurrentInput();
      loadSlide(currentIndex - 1);
    }
  });

  nextSlideBtn.addEventListener('click', () => {
    if (currentIndex < slides.length - 1) {
      saveCurrentInput();
      loadSlide(currentIndex + 1);
    }
  });

  // 추가 / 삭제
  addSlideBtn.addEventListener('click', () => {
    saveCurrentInput();
    const newIndexStr = String(slides.length + 1).padStart(2, '0');
    slides.push({
      type: 'body',
      title: `${newIndexStr}. 신규 포인트`,
      body1: '핵심적인 내용을 설명해주세요.',
      body2: '상세 데이터나 활용 팁을 정리합니다.',
      bgImage: slides[currentIndex].bgImage, // 편의를 위해 배경 이미지는 이전 것을 복사
      bgScale: slides[currentIndex].bgScale || 100,
      bgOpacity: slides[currentIndex].bgOpacity !== undefined ? slides[currentIndex].bgOpacity : 100,
      bgX: slides[currentIndex].bgX || 0,
      bgY: slides[currentIndex].bgY || 0,
      matteColor: slides[currentIndex].matteColor || "#000000",
      matteOpacity: slides[currentIndex].matteOpacity !== undefined ? slides[currentIndex].matteOpacity : 0,
      fontFamily: slides[currentIndex].fontFamily || "'Pretendard', sans-serif",
      textAlignment: slides[currentIndex].textAlignment || "left",
      verticalAlignment: slides[currentIndex].verticalAlignment || "center",
      useContentBox: slides[currentIndex].useContentBox || "none",
      titleSize: slides[currentIndex].titleSize || 48,
      bodySize: slides[currentIndex].bodySize || 34,
      contentOffsetY: slides[currentIndex].contentOffsetY || 0,
      badgeText: slides[currentIndex].badgeText || "INFO CARD",
      textColor: slides[currentIndex].textColor || "#ffffff",
      accentColor: slides[currentIndex].accentColor || "#00f0ff"
    });
    loadSlide(slides.length - 1);
  });

// 헬퍼 함수들이 전역 상단 스코프로 정상 이동되었습니다.

  deleteSlideBtn.addEventListener('click', () => {
    if (slides.length <= 1) {
      alert("최소 1장의 슬라이드는 존재해야 합니다.");
      return;
    }
    slides.splice(currentIndex, 1);
    const targetIdx = currentIndex > 0 ? currentIndex - 1 : 0;
    loadSlide(targetIdx);
  });

  // 배경 조절 슬라이더
  bgScale.addEventListener('input', (e) => {
    slides[currentIndex].bgScale = parseInt(e.target.value);
    updatePreview();
  });
  bgOpacity.addEventListener('input', (e) => {
    slides[currentIndex].bgOpacity = parseInt(e.target.value);
    updatePreview();
  });
  bgPositionX.addEventListener('input', (e) => {
    slides[currentIndex].bgX = parseInt(e.target.value);
    updatePreview();
  });
  bgPositionY.addEventListener('input', (e) => {
    slides[currentIndex].bgY = parseInt(e.target.value);
    updatePreview();
  });
  inputMatteColor.addEventListener('input', (e) => {
    slides[currentIndex].matteColor = e.target.value;
    updatePreview();
  });
  inputMatteOpacity.addEventListener('input', (e) => {
    slides[currentIndex].matteOpacity = parseInt(e.target.value);
    updatePreview();
  });
  resetBgBtn.addEventListener('click', () => {
    slides[currentIndex].bgImage = '';
    slides[currentIndex].bgScale = 100;
    slides[currentIndex].bgOpacity = 100;
    slides[currentIndex].bgX = 0;
    slides[currentIndex].bgY = 0;
    slides[currentIndex].matteColor = '#000000';
    slides[currentIndex].matteOpacity = 0;
    updatePreview();
  });

  // 로고 조절 슬라이더 안전 바인딩
  if (logoScale) {
    logoScale.addEventListener('input', (e) => {
      brandLogo.scale = parseInt(e.target.value);
      updatePreview();
      saveToLocalStorage();
    });
  }
  if (logoOpacity) {
    logoOpacity.addEventListener('input', (e) => {
      brandLogo.opacity = parseInt(e.target.value);
      updatePreview();
      saveToLocalStorage();
    });
  }
  if (resetLogoBtn) {
    resetLogoBtn.addEventListener('click', () => {
      brandLogo.image = '';
      updatePreview();
      saveToLocalStorage();
    });
  }

  // 테마 변경 버튼 작동
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      themeButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeTheme = e.target.getAttribute('data-theme');
      captureCard.setAttribute('data-theme', activeTheme);
      updatePreview();
      saveToLocalStorage();
    });
  });

  // 임시 저장 데이터 클리어 버튼 연동
  if (clearStorageBtn) {
    clearStorageBtn.addEventListener('click', () => {
      if (confirm("임시 저장된 카드뉴스 데이터를 모두 삭제하고 초기화하시겠습니까?")) {
        localStorage.removeItem('carousel_builder_state');
        location.reload();
      }
    });
  }

  // 로컬 폰트 업로드 연동
  if (fontDropzone && fontFileInput) {
    fontDropzone.addEventListener('click', () => fontFileInput.click());
    fontFileInput.addEventListener('change', (e) => handleFontFile(e.target.files[0]));

    fontDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      fontDropzone.classList.add('dragover');
    });
    fontDropzone.addEventListener('dragleave', () => {
      fontDropzone.classList.remove('dragover');
    });
    fontDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      fontDropzone.classList.remove('dragover');
      handleFontFile(e.dataTransfer.files[0]);
    });
  }

  // 단일 슬라이드 다운로드 캡처
  document.getElementById('downloadCurrentBtn').addEventListener('click', () => {
    downloadSlide(currentIndex);
  });

  // 일괄 다운로드
  document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);
}

// --- FontFace API를 활용한 로컬 사용자 폰트 등록 로직 ---
function handleFontFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'ttf' && ext !== 'otf') {
    alert("지원하지 않는 포맷입니다. TTF 또는 OTF 파일만 등록할 수 있습니다.");
    return;
  }

  const baseName = file.name.split('.')[0];
  // 폰트 이름 표준화 (공백 및 특수문자 제거)
  const fontName = 'custom_' + baseName.replace(/[^a-zA-Z0-9]/g, '_');
  
  const reader = new FileReader();
  fontDropzone.querySelector('p').textContent = "폰트 분석 중...";

  reader.onload = function(e) {
    const fontFace = new FontFace(fontName, e.target.result);
    fontFace.load().then(function(loadedFace) {
      document.fonts.add(loadedFace);

      // 폰트 선택 드롭다운에 새로운 옵션 삽입
      const option = document.createElement('option');
      option.value = `"${fontName}", sans-serif`;
      option.textContent = `로컬: ${baseName}`;
      selectFontFamily.appendChild(option);
      
      // 선택값 변경 및 렌더링 업데이트
      selectFontFamily.value = option.value;
      saveCurrentInput();
      updatePreview();
      saveToLocalStorage();

      fontDropzone.querySelector('p').textContent = `폰트 로드됨: ${baseName}`;
      alert(`[${baseName}] 폰트가 브라우저에 임시 추가되었습니다.`);
    }).catch(err => {
      console.error(err);
      fontDropzone.querySelector('p').textContent = "폰트 추가 실패";
      alert("폰트를 로드하는 데 실패했습니다. 파일 무결성을 확인해 주세요.");
    });
  };
  reader.readAsArrayBuffer(file);
}

// --- html2canvas 활용한 캡처 및 다운로드 코어 로직 ---
function downloadSlide(index) {
  // 1. 해당 인덱스 슬라이드 임시 로드하여 캡처 대기
  saveCurrentInput();
  loadSlide(index);

  // 브라우저 렌더링 딜레이 대응을 위해 requestAnimationFrame 호출 후 캡처 진행
  requestAnimationFrame(() => {
    setTimeout(() => {
      const card = document.getElementById('captureCard');
      const wrapper = document.querySelector('.preview-scale-wrapper');
      
      // 캡처 전에 부모 스케일(transform) 임시 해제하여 폰트 자간 겹침 오류 방지
      const originalTransform = wrapper.style.transform;
      wrapper.style.transform = 'none';
      
      // html2canvas 옵션: scale: 2를 통해 2160x2700 초고화질 출력
      html2canvas(card, {
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      }).then(canvas => {
        // 캡처가 완료되면 부모 스케일 원복
        wrapper.style.transform = originalTransform;
        
        const link = document.createElement('a');
        const fileIndexStr = String(index + 1).padStart(2, '0');
        link.download = `slide_${fileIndexStr}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        wrapper.style.transform = originalTransform;
        console.error("이미지 캡처 중 에러 발생:", err);
        alert("캡처에 실패했습니다. 다시 시도해 주세요.");
      });
    }, 200); // 이미지 로드 대기 마진
  });
}

// 모든 슬라이드를 순차적으로 돌려 다운로드 트리거
async function downloadAll() {
  saveCurrentInput();
  const total = slides.length;
  
  if (!confirm(`총 ${total}개의 슬라이드 이미지를 연속 다운로드합니다. 브라우저 차단 설정을 해제해주세요.`)) {
    return;
  }

  const wrapper = document.querySelector('.preview-scale-wrapper');
  const originalTransform = wrapper.style.transform;

  for (let idx = 0; idx < total; idx++) {
    loadSlide(idx);
    
    // 캡처 전에 부모 스케일 임시 해제
    wrapper.style.transform = 'none';

    // 비동기 루프로 순서대로 캡처하여 브라우저 다운로드 큐가 끊기지 않게 유도
    await new Promise((resolve) => {
      setTimeout(() => {
        const card = document.getElementById('captureCard');
        html2canvas(card, {
          scale: 2,
          useCORS: true,
          backgroundColor: null
        }).then(canvas => {
          // 개별 캡처 완료 후 일단 스케일 복원
          wrapper.style.transform = originalTransform;

          const link = document.createElement('a');
          const fileIndexStr = String(idx + 1).padStart(2, '0');
          link.download = `carousel_slide_${fileIndexStr}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          resolve();
        }).catch(err => {
          wrapper.style.transform = originalTransform;
          console.error(err);
          resolve();
        });
      }, 500); // 캡처 텀을 넓혀 병목 방지
    });
  }
}

// --- 애플리케이션 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
  initDropzones();
  
  // 1. 임시 저장된 상태 복구 시도
  const restored = loadFromLocalStorage();
  
  initEvents();
  
  // 2. 테마 셋업
  captureCard.setAttribute('data-theme', activeTheme);
  
  // 테마 활성 버튼 맞춰주기
  const themeButtons = document.querySelectorAll('.theme-btn');
  themeButtons.forEach(btn => {
    if (btn.getAttribute('data-theme') === activeTheme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // 인스타 ID 세팅 동기화
  inputInstagramId.value = instagramId;

  // 3. 현재 슬라이드 로드
  loadSlide(currentIndex);
});
