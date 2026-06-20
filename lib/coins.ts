import type { Coin, CoinId } from "./types";

export const COINS: Record<CoinId, Coin> = {
  btc: { id: "btc", name: "비트코인", ticker: "BTC", symbol: "₿", color: "#f0b90b" },
  eth: { id: "eth", name: "이더리움", ticker: "ETH", symbol: "Ξ", color: "#7c83ff" },
};

export const COIN_LIST: Coin[] = [COINS.btc, COINS.eth];
