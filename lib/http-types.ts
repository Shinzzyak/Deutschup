// Vendor-neutral request/response types for the handlers in api/.
//
// The handlers are written against the classic Node-style `(req, res)` contract.
// On Cloudflare Pages that contract is implemented by functions/lib/http-adapter.ts,
// which builds objects matching exactly these shapes. Keep the two in sync.

export interface ApiRequest extends AsyncIterable<any> {
  method?: string;
  url?: string;
  /** Header names are lower-cased by the adapter. */
  headers: Record<string, string | string[] | undefined>;
  /** Repeated query params collapse into an array. */
  query: Record<string, string | string[]>;
  /** Parsed body (JSON / urlencoded), or the raw text when parsing fails. */
  body?: any;
  /** Byte-exact raw body text, for HMAC signature verification. */
  rawBody?: string;
  cookies?: Record<string, string>;
  // AsyncIterable: the raw body can also be consumed as a stream. Node runtimes
  // stream the socket; the Cloudflare adapter replays the buffered body.
}

export interface ApiResponse {
  statusCode: number;
  headers: Record<string, string | number | string[]>;
  body: string | Uint8Array | null;
  headersSent: boolean;
  status: (code: number) => ApiResponse;
  setHeader: (k: string, v: string | number | string[]) => ApiResponse;
  getHeader: (k: string) => string | number | string[] | undefined;
  json: (data: any) => ApiResponse;
  end: (data?: any) => ApiResponse;
  send: (data?: any) => ApiResponse;
}

/** Signature every file in api/ default-exports. */
export type ApiHandler = (req: ApiRequest, res: ApiResponse) => unknown;
