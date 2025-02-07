export type LinksJson = {
  type: string;
  label: string;
  url: string;
};

export type DexScrennerLatestBoostedTokensResponse = {
  url: string;
  chainId: string;
  tokenAddress: string;
  amount: number;
  totalAmount: number;
  icon: string;
  header: string;
  description: string;
  links: LinksJson[];
};

export type DexScrennerTokensReponse = {
  url: string;
  chainId: string;
  tokenAddress: string;
};
