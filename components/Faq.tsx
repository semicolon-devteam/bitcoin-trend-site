const ITEMS = [
  {
    q: "추세(트렌드)가 뭔가요?",
    a: "가격이 일정 기간 동안 전반적으로 어느 방향으로 움직이는지를 말해요. 오르면 상승, 내리면 하락, 비슷하면 횡보라고 불러요.",
  },
  {
    q: "변동률은 어떻게 읽나요?",
    a: "선택한 기간의 시작 가격 대비 지금 가격이 몇 퍼센트 오르거나 내렸는지를 나타내요. +면 올랐고 -면 내렸어요.",
  },
  {
    q: "이 가격은 실제 시세인가요?",
    a: "아니요. 이 사이트는 학습용 샘플(mock) 데이터를 사용해요. 투자 판단에 쓰지 마세요.",
  },
];

export default function Faq() {
  return (
    <section className="faq">
      <h2 className="section-title">입문자 용어 설명</h2>
      <div className="faq-list">
        {ITEMS.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
