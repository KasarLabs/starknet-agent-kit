/**
 * Parameters for atlantic impl
 * @property {string} filename - The name of the file you wish to verify or generate the proof of
 */
export type AtlanticParam = {
  filename: string;
};

/**
 * Interface for atlantic API response
 * @property {string} atlanticQueryId - query id to retrieve the request
 */
export interface AtlanticRes {
  atlanticQueryId: string;
}
