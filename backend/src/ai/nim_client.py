import logging
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from src.core.config import settings

logger = logging.getLogger(__name__)

# Single shared async client — instantiated once, reused everywhere
_client: AsyncOpenAI | None = None


def get_nim_client() -> AsyncOpenAI:
    global _client
    if not settings.NVIDIA_API_KEY:
        raise RuntimeError("NVIDIA_API_KEY is not configured. AI features are unavailable.")
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.NVIDIA_API_KEY,
            base_url=settings.NVIDIA_BASE_URL,
        )
    return _client


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    reraise=True,
)
async def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 1024,
) -> str:
    client = get_nim_client()
    model = model or settings.NIM_LLM_MODEL

    response = await client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )

    usage = response.usage
    if usage:
        logger.info(
            "NIM chat | model=%s prompt_tokens=%d completion_tokens=%d total=%d",
            model,
            usage.prompt_tokens,
            usage.completion_tokens,
            usage.total_tokens,
        )

    return response.choices[0].message.content


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
    reraise=True,
)
async def embed_text(text: str, model: str | None = None) -> list[float]:
    client = get_nim_client()
    model = model or settings.NIM_EMBEDDING_MODEL

    response = await client.embeddings.create(
        model=model,
        input=text,
        encoding_format="float",
    )

    logger.info("NIM embed | model=%s input_len=%d", model, len(text))
    return response.data[0].embedding


async def embed_batch(texts: list[str], model: str | None = None) -> list[list[float]]:
    """Embed multiple texts — NIM supports batch input."""
    client = get_nim_client()
    model = model or settings.NIM_EMBEDDING_MODEL

    response = await client.embeddings.create(
        model=model,
        input=texts,
        encoding_format="float",
    )

    logger.info("NIM embed batch | model=%s count=%d", model, len(texts))
    # Sort by index to guarantee order
    return [d.embedding for d in sorted(response.data, key=lambda x: x.index)]
