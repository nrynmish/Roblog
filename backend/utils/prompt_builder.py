import logging
from config.settings import settings

logger = logging.getLogger(__name__)


class PromptBuilder:

    def build_blog_prompt(self, keyword: str) -> str:
        if not keyword or not keyword.strip():
            raise ValueError("Keyword cannot be empty.")

        keyword = keyword.strip()

        # TinyLlama uses chat format
        if "tinyllama" in settings.MODEL_NAME.lower():
            prompt = f"""<|system|>
You are an expert SEO content writer who writes detailed, well-structured blog posts.</s>
<|user|>
Write a complete SEO-optimized blog post about "{keyword}".

Use this exact structure with markdown headings:

# [Compelling title with the keyword]

## Introduction
Write 2-3 paragraphs about {keyword}.

## What is {keyword}?
Write 2-3 paragraphs explaining {keyword}.

## Why {keyword} Matters
Write 2-3 paragraphs about the importance of {keyword}.

## Key Benefits of {keyword}
List and explain 4 benefits of {keyword}.

## How to Get Started with {keyword}
### Step 1: Research
Explain research step.
### Step 2: Implementation  
Explain implementation step.
### Step 3: Optimization
Explain optimization step.

## Best Practices for {keyword}
Write 3 paragraphs of best practices.

## FAQ
**Q: What is {keyword}?**
A: Write a 2 sentence answer.

**Q: How does {keyword} work?**
A: Write a 2 sentence answer.

## Conclusion
Write 2 paragraphs summarizing {keyword}.

## Call to Action
Write 1 paragraph encouraging action related to {keyword}.

Important: Use the keyword "{keyword}" naturally throughout. Write at least 600 words. Start directly with the # title.</s>
<|assistant|>
"""

        # Mistral format
        else:
            prompt = f"""<s>[INST] You are an expert SEO content writer.
Write a complete SEO-optimized blog post for the keyword: "{keyword}"

Use this exact structure:

# [Compelling title with the keyword]

## Introduction
Write 2-3 paragraphs about {keyword}.

## What is {keyword}?
Write 2-3 paragraphs explaining {keyword}.

## Why {keyword} Matters
Write 2-3 paragraphs about importance.

## Key Benefits of {keyword}
List and explain 4 benefits.

## How to Get Started with {keyword}
### Step 1: Research
### Step 2: Implementation
### Step 3: Optimization

## Best Practices for {keyword}
Write 3 paragraphs.

## FAQ
**Q: What is {keyword}?**
A: Answer here.

**Q: How does {keyword} work?**
A: Answer here.

## Conclusion
Write 2 paragraphs.

## Call to Action
Write 1 paragraph.

Use "{keyword}" naturally throughout. Minimum 600 words. Start directly with the # title. [/INST]"""

        logger.info(f"✅ Prompt built for keyword: {keyword}")
        return prompt


# ── Singleton ────────────────────────────────────────────────────────────────
prompt_builder = PromptBuilder()
