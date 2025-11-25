import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

let faceDetector: any = null;
let faceEmbedder: any = null;

export interface FaceEmbedding {
  box: { x: number; y: number; width: number; height: number };
  embedding: number[];
  confidence: number;
}

export interface PhotoWithFaces {
  id: string;
  imageData: string;
  faces: FaceEmbedding[];
}

// Initialize face detection pipeline
async function initFaceDetector() {
  if (!faceDetector) {
    console.log('Loading face detection model...');
    faceDetector = await pipeline(
      'object-detection',
      'Xenova/detr-resnet-50',
      { device: 'webgpu' }
    );
  }
  return faceDetector;
}

// Initialize face embedding pipeline
async function initFaceEmbedder() {
  if (!faceEmbedder) {
    console.log('Loading face embedding model...');
    faceEmbedder = await pipeline(
      'feature-extraction',
      'Xenova/mobilenet-v2-1.0-224',
      { device: 'webgpu' }
    );
  }
  return faceEmbedder;
}

// Detect faces in an image
export async function detectFacesInImage(imageData: string): Promise<FaceEmbedding[]> {
  try {
    const detector = await initFaceDetector();
    const embedder = await initFaceEmbedder();

    // Detect objects (including faces)
    const detections = await detector(imageData, {
      threshold: 0.5,
      percentage: true,
    });

    // Filter for person/face detections
    const faceDetections = detections.filter(
      (d: any) => d.label === 'person' && d.score > 0.6
    );

    // Create canvas to extract face regions
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageData;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const faces: FaceEmbedding[] = [];

    for (const detection of faceDetections) {
      const box = detection.box;
      const x = Math.floor(box.xmin * img.width);
      const y = Math.floor(box.ymin * img.height);
      const width = Math.floor((box.xmax - box.xmin) * img.width);
      const height = Math.floor((box.ymax - box.ymin) * img.height);

      // Extract face region
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      const faceImageData = canvas.toDataURL('image/jpeg', 0.8);

      // Generate embedding for this face
      const embedding = await embedder(faceImageData, {
        pooling: 'mean',
        normalize: true,
      });

      faces.push({
        box: { x, y, width, height },
        embedding: Array.from(embedding.data),
        confidence: detection.score,
      });
    }

    return faces;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
}

// Calculate cosine similarity between two embeddings
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Group faces by similarity
export function groupFacesBySimilarity(
  photos: PhotoWithFaces[],
  similarityThreshold: number = 0.85
): Map<string, PhotoWithFaces[]> {
  const groups = new Map<string, PhotoWithFaces[]>();
  let groupId = 0;

  for (const photo of photos) {
    for (const face of photo.faces) {
      let foundGroup = false;

      // Check if this face belongs to any existing group
      for (const [groupKey, groupPhotos] of groups.entries()) {
        const representativeFace = groupPhotos[0].faces[0];
        const similarity = cosineSimilarity(face.embedding, representativeFace.embedding);

        if (similarity >= similarityThreshold) {
          groups.get(groupKey)?.push(photo);
          foundGroup = true;
          break;
        }
      }

      // Create new group if no match found
      if (!foundGroup) {
        const newGroupKey = `person_${groupId++}`;
        groups.set(newGroupKey, [photo]);
      }
    }
  }

  return groups;
}

// Process all photos and detect faces
export async function processPhotosForFaces(
  photos: Array<{ id: string; imageData: string }>
): Promise<PhotoWithFaces[]> {
  const results: PhotoWithFaces[] = [];

  for (const photo of photos) {
    const faces = await detectFacesInImage(photo.imageData);
    if (faces.length > 0) {
      results.push({
        id: photo.id,
        imageData: photo.imageData,
        faces,
      });
    }
  }

  return results;
}
