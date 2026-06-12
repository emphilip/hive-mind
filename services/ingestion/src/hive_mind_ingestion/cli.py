"""hive-mind-ingest CLI."""

from __future__ import annotations

import logging
from datetime import datetime

import click
from hive_mind_shared import load_config

from hive_mind_ingestion.pipeline_runner import run_sync
from hive_mind_ingestion.reextract import reextract_sync


@click.group()
def main() -> None:
    """Hive Mind ingestion CLI."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


@main.command()
@click.argument("repo_url")
def git(repo_url: str) -> None:
    """Ingest a public git repository (clone, walk, embed)."""
    cfg = load_config()
    parents, chunks = run_sync(repo_url, cfg)
    click.echo(f"Ingested {parents} files / {chunks} chunks from {repo_url}")


@main.command("re-extract")
@click.option("--source", default=None, help="Only re-extract chunks from this source.")
@click.option(
    "--since",
    type=click.DateTime(formats=["%Y-%m-%d", "%Y-%m-%dT%H:%M:%S"]),
    default=None,
    help="Only re-extract chunks updated on or after this timestamp.",
)
def re_extract(source: str | None, since: datetime | None) -> None:
    """Re-run graph extraction over existing text chunks."""
    summary = reextract_sync(load_config(), source=source, since=since)
    click.echo(
        "Re-extract complete: "
        f"succeeded={summary.succeeded} failed={summary.failed} skipped={summary.skipped}"
    )


if __name__ == "__main__":  # pragma: no cover
    main()
