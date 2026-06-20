import type { Coin, CoinId } from "./types";

export const COINS: Record<CoinId, Coin> = {
  btc: { id: "btc", name: "비트코인", ticker: "BTC", symbol: "₿" },
  eth: { id: "eth", name: "이더리움", ticker: "ETH", symbol: "Ξ" },
};

export const COIN_LIST: Coin[] = [COINS.btc, COINS.eth];
