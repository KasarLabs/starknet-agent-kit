/**
 * Interface representing file information
 * @interface
 * @property {string} name - The name of the file
 * @property {number} size - The size of the file in bytes
 * @property {string} type - The MIME type of the file
 */
export interface FileInfo {
  name: string;
  size: number;
  type: string;
}
