"""
OCR Service using Microsoft TrOCR (trocr-base-handwritten).

Design principles:
  • Modular — independent service, can swap model later
  • Efficient — model loaded ONCE, reused across requests
  • Stateless — no internal storage, returns extracted text
"""
import time
from pathlib import Path

from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel


class OCRService:
    """Handwritten text extraction using TrOCR."""

    MODEL_NAME = "microsoft/trocr-base-handwritten"

    def __init__(self) -> None:
        """Load the TrOCR processor and model (called once at startup)."""
        print(f"[OCR] Loading model '{self.MODEL_NAME}' …")
        self.processor = TrOCRProcessor.from_pretrained(self.MODEL_NAME)
        self.model = VisionEncoderDecoderModel.from_pretrained(self.MODEL_NAME)
        self.model.eval()  # inference mode
        print("[OCR] Model loaded successfully.")

    # ------------------------------------------------------------------
    # Preprocessing
    # ------------------------------------------------------------------
    def preprocess(self, image: Image.Image) -> Image.Image:
        """Basic preprocessing: ensure RGB and reasonable size."""
        # Convert to RGB (handles grayscale / RGBA)
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Resize very large images to avoid OOM (keep aspect ratio)
        max_side = 1024
        if max(image.size) > max_side:
            image.thumbnail((max_side, max_side), Image.LANCZOS)

        return image

    # ------------------------------------------------------------------
    # Core extraction
    # ------------------------------------------------------------------
    def extract_text(self, image_path: str) -> dict:
        """Extract handwritten text from an image file.

        Args:
            image_path: Absolute path to a PNG/JPG image.

        Returns:
            dict with keys: text, confidence, processing_time_ms

        Raises:
            FileNotFoundError: if image_path does not exist.
            ValueError: if the file is not a valid image.
        """
        path = Path(image_path)
        if not path.exists():
            raise FileNotFoundError(f"Image not found: {image_path}")

        t0 = time.perf_counter()

        try:
            image = Image.open(path)
        except Exception as exc:
            raise ValueError(f"Cannot open image '{path.name}': {exc}") from exc

        image = self.preprocess(image)

        # Tokenize / generate
        pixel_values = self.processor(images=image, return_tensors="pt").pixel_values
        generated_ids = self.model.generate(pixel_values, max_new_tokens=256)
        text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

        elapsed_ms = round((time.perf_counter() - t0) * 1000)

        # TrOCR doesn't natively return a confidence score.
        # We approximate it from generation log-probs in the future;
        # for now, report -1 to signal "not available".
        return {
            "text": text.strip(),
            "confidence": -1,
            "processing_time_ms": elapsed_ms,
        }


# ---------------------------------------------------------------------------
# Module-level singleton  — import this from anywhere
# ---------------------------------------------------------------------------
_instance: OCRService | None = None


def get_ocr_service() -> OCRService:
    """Return the OCR service singleton. Raises if not initialised."""
    if _instance is None:
        raise RuntimeError("OCRService not initialised — call init_ocr_service() first.")
    return _instance


def init_ocr_service() -> OCRService:
    """Initialise the singleton (call once at startup)."""
    global _instance
    if _instance is None:
        _instance = OCRService()
    return _instance
