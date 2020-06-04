/* export const JobStatus = {
    created: ["created"], // Status for Job init creation
    img_uploaded: ["image uploaded"], // Status after job uploaded
    processing: ["processing"], // Status after processing of image
    failed: ["failed"], // Status if processing failed
    done: ["done"] // Status if processing successful ended
  } */
export const JobStatus = {
    created: "created", // Status for Job init creation
    img_uploaded: "image uploaded", // Status after job uploaded
    processing: "processing", // Status after processing of image
    failed: "failed", // Status if processing failed
    done: "done" // Status if processing successful ended
} as const;