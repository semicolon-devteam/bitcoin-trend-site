interface Outlook {
  name: string;
  symbol: string;
  color: string;
  bull: string;
  bear: string;
  takeaway: string;
}

const OUTLOOKS: Outlook[] = [
  {
    name: "비트코인",
    symbol: "₿",
    color: "#f0b90b",
    bull:
      "블랙록·피델리티 등 대형 운용사가 현물 ETF를 내놓으며 기관 자금 유입이 이어졌고, 스탠다드차타드 같은 일부 은행은 장기 강세 목표가(예: 20만 달러 수준)를 제시한 바 있어요. ARK Invest는 더 긴 시계에서 수십만 달러 이상의 상승 시나리오를 이야기하기도 했고요. 공급이 고정돼 있어 '디지털 금'으로서의 가치 저장 수단 내러티브가 핵심 근거예요.",
    bear:
      "한편 금리·거시 환경에 민감하고 변동성이 크다는 신중론도 꾸준해요. 루리엘 루비니 같은 회의론자는 내재가치 부재를 지적하고, 규제 강화나 위험자산 회피 국면에선 빠르게 조정받을 수 있다는 경계도 있어요.",
    takeaway:
      "요약하면 '장기 채택 확대'에 기대는 강세론과 '높은 변동성·거시 리스크'를 경계하는 신중론이 맞서는 구도예요.",
  },
  {
    name: "이더리움",
    symbol: "Ξ",
    color: "#7c83ff",
    bull:
      "2024년 현물 ETF 승인과 The Merge 이후의 스테이킹 구조가 기관 관심을 키웠어요. VanEck 등 일부 운용사는 이더리움을 '수수료를 버는 디지털 인프라'로 보고 긍정적 밸류에이션 시나리오를 제시했고, L2 확장으로 사용성이 좋아진다는 점이 강세 논거예요.",
    bear:
      "반대로 솔라나 등 경쟁 체인과의 점유율 다툼, 규제상 증권성 논란, L2로 활동이 옮겨가며 본체 수수료가 줄 수 있다는 우려도 함께 거론돼요.",
    takeaway:
      "요약하면 '스마트계약 플랫폼의 표준'이라는 강점과 '경쟁·규제 불확실성' 사이에서 방향이 갈리는 자산이에요.",
  },
];

export default function MacroOutlook() {
  return (
    <section className="outlook">
      <h2 className="section-title">거시적으로 보면, 전문가들은?</h2>
      <p className="outlook-note">
        아래는 공개적으로 보도된 <strong>대표적 견해를 쉽게 정리한 예시</strong>예요(기준 시점: 2026년 6월).
        시점·출처에 따라 달라질 수 있으니 사실관계는 직접 확인하세요. <strong>투자 조언이 아닙니다.</strong>
      </p>
      <div className="outlook-grid">
        {OUTLOOKS.map((o) => (
          <article className="outlook-card" key={o.name}>
            <header className="outlook-head">
              <span className="outlook-mark" style={{ color: o.color }}>
                {o.symbol}
              </span>
              <h3>{o.name}</h3>
            </header>
            <p className="outlook-row">
              <span className="outlook-tag up">강세론</span>
              {o.bull}
            </p>
            <p className="outlook-row">
              <span className="outlook-tag down">신중론</span>
              {o.bear}
            </p>
            <p className="outlook-takeaway">{o.takeaway}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
