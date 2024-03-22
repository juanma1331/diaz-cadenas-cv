export type CVStatus = "pending" | "approved" | "rejected";

export interface CV {
  id: string;
  name: string;
  email: string;
  place: string;
  position: string;
  status: CVStatus;
}

export interface Attachment {
  id: number;
  name: string;
  url: string;
  size: number;
  type: string;
  key: string;
  cvId: string;
}

export type CVWithAttachments = CV & { attachments: Attachment[] };
