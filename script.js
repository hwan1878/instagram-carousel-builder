// DOM 요소 선택
const container = document.getElementById('mainCarousel');
const track = document.querySelector('.carousel-track');
const slides = Array.from(document.querySelectorAll('.carousel-slide'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const indicatorContainer = document.getElementById('indicators');
const indicators = Array.from(document.querySelectorAll('.indicator'));

let currentIndex = 0;
let slideInterval;
const intervalTime = 3000; // 3초 주기 설정
let isHovered = false;

// 슬라이드 이동 함수
function goToSlide(index) {
  // 인덱스 범위 초과 방지 및 순환 구조 처리
  if (index < 0) {
    currentIndex = slides.length - 1;
  } else if (index >= slides.length) {
    currentIndex = 0;
  } else {
    currentIndex = index;
  }

  // 1. 트랙 이동 (X축 이동을 통해 가로 슬라이드 전환 효과)
  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  // 2. 활성화 클래스 업데이트 (콘텐츠 등장 애니메이션 및 이미지 줌인 효과 활성화)
  slides.forEach((slide, idx) => {
    if (idx === currentIndex) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  // 3. 하단 인디케이터 점 활성화 상태 업데이트
  indicators.forEach((indicator, idx) => {
    if (idx === currentIndex) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  });
}

// 다음 슬라이드로 이동
function nextSlide() {
  goToSlide(currentIndex + 1);
}

// 이전 슬라이드로 이동
function prevSlide() {
  goToSlide(currentIndex - 1);
}

// 자동 슬라이드 타이머 시작 함수
function startSlideShow() {
  stopSlideShow(); // 중복 타이머 방지를 위해 기존 타이머 먼저 초기화
  slideInterval = setInterval(() => {
    if (!isHovered) {
      nextSlide();
    }
  }, intervalTime);
}

// 자동 슬라이드 타이머 중지 함수
function stopSlideShow() {
  if (slideInterval) {
    clearInterval(slideInterval);
  }
}

// 사용자가 버튼 조작 시 타이머를 재설정하여 즉각적인 오버레이 방지
function resetSlideShow() {
  stopSlideShow();
  startSlideShow();
}

// --- 이벤트 리스너 설정 ---

// 1. 다음 버튼 클릭
nextBtn.addEventListener('click', () => {
  nextSlide();
  resetSlideShow();
});

// 2. 이전 버튼 클릭
prevBtn.addEventListener('click', () => {
  prevSlide();
  resetSlideShow();
});

// 3. 인디케이터 개별 버튼 클릭
indicatorContainer.addEventListener('click', (e) => {
  const targetIndicator = e.target.closest('.indicator');
  if (!targetIndicator) return;

  const targetIndex = parseInt(targetIndicator.getAttribute('data-slide'));
  goToSlide(targetIndex);
  resetSlideShow();
});

// 4. 마우스 호버 시 일시 정지 (Pause on Hover)
container.addEventListener('mouseenter', () => {
  isHovered = true;
});

container.addEventListener('mouseleave', () => {
  isHovered = false;
});

// 5. 키보드 방향키 조작 지원 (웹 접근성 향상)
document.addEventListener('keydown', (e) => {
  // 현재 브라우저 뷰포트 내에 캐러셀 영역이 보일 때 작동하도록 영역 바운더리 체크할 수도 있음
  if (e.key === 'ArrowRight') {
    nextSlide();
    resetSlideShow();
  } else if (e.key === 'ArrowLeft') {
    prevSlide();
    resetSlideShow();
  }
});

// 페이지 로드 시 캐러셀 시작
document.addEventListener('DOMContentLoaded', () => {
  goToSlide(0); // 첫 슬라이드 명시적 활성화
  startSlideShow();
});
