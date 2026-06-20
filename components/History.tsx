interface CoinHistory {
  name: string;
  symbol: string;
  born: string;
  lines: string[];
}

const HISTORY: CoinHistory[] = [
  {
    name: "비트코인",
    symbol: "₿",
    born: "2009년",
    lines: [
      "2008년 사토시 나카모토라는 익명의 인물이 백서를 공개하고, 2009년 첫 블록(제네시스 블록)이 생성되며 시작됐어요.",
      "은행 같은 중앙 기관 없이도 인터넷에서 가치를 주고받게 하려는 시도였어요. 발행량이 2,100만 개로 정해져 있어 '디지털 금'에 비유돼요.",
      "약 4년마다 채굴 보상이 절반으로 줄어드는 '반감기'가 있고, 이 주기가 가격 흐름과 자주 엮여 이야기돼요.",
      "2024년 미국에서 현물 ETF가 승인되며 기관 투자자의 접근이 크게 쉬워졌어요.",
    ],
  },
  {
    name: "이더리움",
    symbol: "Ξ",
    born: "2015년",
    lines: [
      "2015년 비탈릭 부테린 등이 만든 플랫폼으로, 단순 송금을 넘어 '스마트 계약'으로 앱을 올릴 수 있는 게 핵심이에요.",
      "DeFi(탈중앙 금융), NFT 같은 서비스 대부분이 이더리움 위에서 자랐어요. ETH는 그 네트워크를 쓰는 '연료'예요.",
      "2022년 'The Merge'로 채굴(PoW)에서 지분증명(PoS)으로 전환해 에너지 사용을 크게 줄였고, 스테이킹 보상 구조가 생겼어요.",
      "거래가 몰리면 수수료가 비싸지는 문제를 L2(레이어2) 같은 확장 기술로 푸는 중이에요.",
    ],
  },
];

export default function History() {
  return (
    <section className="history">
      <h2 className="section-title">코인의 역사, 아주 짧게</h2>
      <div className="history-grid">
        {HISTORY.map((c) => (
          <article className="history-card" key={c.name}>
            <header className="history-head">
              <span className="history-mark">{c.symbol}</span>
              <h3>{c.name}</h3>
              <span className="history-born">{c.born} ~</span>
            </header>
            <ul>
              {c.lines.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
