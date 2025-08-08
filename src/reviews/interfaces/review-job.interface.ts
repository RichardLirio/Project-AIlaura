export interface ReviewJob {
  id: string;
  review: {
    text: string;
    company_id: string;
    metadata?: Record<string, any>;
  };
  status: "pending" | "processing" | "completed" | "failed";
  created_at: Date;
  estimated_completion: Date;
  result?: {
    sentiment: "positive" | "negative" | "neutral";
    score: number;
    processed_at: Date;
  };
}

export interface JobStatusResponse {
  job_id: string;
  status: string;
  created_at: Date;
  estimated_completion: Date;
  result?: any;
}

export interface CreateReviewResult {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  estimated_time: string;
  created_at: Date;
}
