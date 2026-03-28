import logging
import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    pipeline,
    BitsAndBytesConfig
)
from config.settings import settings

logger = logging.getLogger(__name__)


class ModelService:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.pipe = None
        self.is_loaded = False

    def load_model(self):
        try:
            logger.info(f"Loading model: {settings.MODEL_NAME}")
            logger.info(f"Device: {settings.DEVICE}")

            self.tokenizer = AutoTokenizer.from_pretrained(
                settings.MODEL_NAME,
                trust_remote_code=True
            )

            if settings.DEVICE == "cuda" and torch.cuda.is_available():
                logger.info("CUDA detected — loading with 4-bit quantization")

                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4"
                )

                self.model = AutoModelForCausalLM.from_pretrained(
                    settings.MODEL_NAME,
                    quantization_config=quantization_config,
                    device_map="auto",
                    trust_remote_code=True
                )

            else:
                logger.info("Running on CPU — loading in float32")

                self.model = AutoModelForCausalLM.from_pretrained(
                    settings.MODEL_NAME,
                    torch_dtype=torch.float32,
                    low_cpu_mem_usage=True,
                    trust_remote_code=True
                )

            self.pipe = pipeline(
                "text-generation",
                model=self.model,
                tokenizer=self.tokenizer,
                max_new_tokens=settings.MAX_NEW_TOKENS,
                temperature=settings.TEMPERATURE,
                top_p=settings.TOP_P,
                do_sample=True,
                repetition_penalty=1.1,
                return_full_text=False  
            )

            self.is_loaded = True
            logger.info("Model loaded successfully")

        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            self.is_loaded = False
            raise RuntimeError(f"Model loading failed: {str(e)}")

    def generate(self, prompt: str) -> str:
        if not self.is_loaded or self.pipe is None:
            raise RuntimeError("Model is not loaded. Call load_model() first.")

        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        try:
            logger.info("Running inference...")

            outputs = self.pipe(prompt)

            if outputs and isinstance(outputs, list):
                generated_text = outputs[0].get("generated_text", "").strip()
            else:
                raise ValueError("Unexpected output format from pipeline.")

            if not generated_text:
                raise ValueError("Model returned empty output.")

            logger.info(f"Generated {len(generated_text.split())} words")
            return generated_text
    
        except Exception as e:
            logger.error(f"Generation failed: {str(e)}")
            raise RuntimeError(f"Text generation failed: {str(e)}")


    def health(self) -> dict:
        return {
            "model_loaded": self.is_loaded,
            "model_name": settings.MODEL_NAME,
            "device": settings.DEVICE,
            "cuda_available": torch.cuda.is_available()
        }


model_service = ModelService()
