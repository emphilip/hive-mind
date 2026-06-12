from __future__ import annotations

import asyncio
from dataclasses import dataclass

import pytest
from hive_mind_shared import HiveMindConfig
from hive_mind_pipeline.providers import EmbeddingResult

from hive_mind_ingestion import pipeline_runner
from hive_mind_ingestion.chunking import Chunk
from hive_mind_ingestion.connectors.git import GitDocument


class _Catalog:
    inserted: list[str] = []

    def __init__(self, dsn: str) -> None:
        self.inserted = []
        _Catalog.inserted = self.inserted

    async def connect(self) -> None:
        return None

    async def close(self) -> None:
        return None

    async def insert_entity(self, **kwargs) -> None:
        self.inserted.append(kwargs["entity_id"])


class _Vector:
    upserts: list[str] = []

    def __init__(self, **kwargs) -> None:
        self.upserts = []
        _Vector.upserts = self.upserts

    async def ensure_collection(self, source: str) -> None:
        return None

    async def upsert(self, *, entity_id: str, **kwargs) -> None:
        self.upserts.append(entity_id)

    async def close(self) -> None:
        return None


class _Embeddings:
    def __init__(self, **kwargs) -> None:
        return None

    async def embed(self, text: str) -> EmbeddingResult:
        return EmbeddingResult(
            vector=[0.1, 0.2],
            tokens_in=2,
            model="test",
            provider="ollama",
        )

    async def close(self) -> None:
        return None


class _Chat:
    model = "test-chat"

    def __init__(self, **kwargs) -> None:
        return None

    async def close(self) -> None:
        return None


@dataclass
class _Span:
    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return None

    def set_attribute(self, *args, **kwargs):
        return None

    def record_exception(self, *args, **kwargs):
        return None


class _Tracer:
    def start_as_current_span(self, name: str) -> _Span:
        return _Span()


@pytest.mark.asyncio
async def test_extractor_timeout_does_not_abort_chunk_loop(monkeypatch):
    calls: list[str] = []

    async def timeout_extract(**kwargs):
        calls.append(kwargs["chunk_entity_id"])
        raise asyncio.TimeoutError("slow model")

    async def vocab(*args, **kwargs):
        return ["depends_on"]

    monkeypatch.setattr(pipeline_runner, "CatalogStore", _Catalog)
    monkeypatch.setattr(pipeline_runner, "VectorIndex", _Vector)
    monkeypatch.setattr(pipeline_runner, "OllamaEmbeddings", _Embeddings)
    monkeypatch.setattr(pipeline_runner, "OllamaChat", _Chat)
    monkeypatch.setattr(pipeline_runner, "setup_otel", lambda *args: _Tracer())
    monkeypatch.setattr(pipeline_runner, "load_vocabulary", vocab)
    monkeypatch.setattr(pipeline_runner, "extract_for_chunk", timeout_extract)
    monkeypatch.setattr(pipeline_runner, "is_code_path", lambda path: False)
    monkeypatch.setattr(
        pipeline_runner,
        "chunk_text",
        lambda text: [Chunk(index=0, text="one"), Chunk(index=1, text="two")],
    )

    doc = GitDocument(
        entity_id="parent",
        title="README.md",
        body="one\n\ntwo",
        source="git",
        source_uri="git://repo/README.md",
        source_revision="abc",
        content_hash="hash",
        metadata={"path": "README.md"},
    )
    parents, chunks = await pipeline_runner.ingest_documents(
        [doc],
        cfg=HiveMindConfig(),
    )

    assert (parents, chunks) == (1, 2)
    assert len(calls) == 2
    assert len(_Catalog.inserted) == 3  # parent + both chunks
    assert len(_Vector.upserts) == 2
