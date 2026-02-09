"""Tests for artifact intake — archive, quarantine, hash verification."""

import hashlib
import json
import os

import pytest

from orchestrator.artifacts import (
    ArtifactStatus,
    ArtifactType,
    ALLOWED_TYPES,
    sha256_bytes,
    validate_artifact,
    intake,
    link_artifacts,
    annotate_artifact,
    load_artifact,
    ensure_dirs,
    append_intake_event,
)


@pytest.fixture
def base_dir(tmp_path):
    d = str(tmp_path / "evidence" / "artifacts")
    os.makedirs(d, exist_ok=True)
    return d


class TestAcceptStoresArchiveAndLogsIntake:
    def test_accepted_artifact_creates_archive_file(self, base_dir):
        status, aid, reason = intake(
            artifact_type="TEXT",
            source="human",
            content="Hello, world.",
            base_dir=base_dir,
        )
        assert status == ArtifactStatus.ACCEPTED
        assert reason == "ok"
        archive_path = os.path.join(base_dir, "archive", f"{aid}.json")
        assert os.path.exists(archive_path)

    def test_accepted_artifact_logged_in_intake_jsonl(self, base_dir):
        status, aid, reason = intake(
            artifact_type="NOTE",
            source="human",
            content="A note about something.",
            base_dir=base_dir,
        )
        intake_path = os.path.join(base_dir, "intake.jsonl")
        assert os.path.exists(intake_path)
        with open(intake_path, "r") as f:
            lines = f.readlines()
        assert len(lines) == 1
        entry = json.loads(lines[0])
        assert entry["event_type"] == "INTAKE"
        assert entry["artifact_id"] == aid
        assert entry["status"] == "ACCEPTED"
        assert entry["actor"] == "bruce"
        assert "archive_path" in entry
        assert "sha256" in entry

    def test_accepted_archive_contains_content(self, base_dir):
        content = "Test content for archiving."
        status, aid, reason = intake(
            artifact_type="MARKDOWN",
            source="codex",
            content=content,
            base_dir=base_dir,
        )
        record = load_artifact(aid, base_dir)
        assert record is not None
        assert record["content_text"] == content
        assert record["artifact_type"] == "MARKDOWN"
        assert record["source"] == "codex"


class TestQuarantineOnUnknownTypeOrOversize:
    def test_quarantine_on_unknown_type(self, base_dir):
        status, aid, reason = intake(
            artifact_type="EXECUTABLE",
            source="human",
            content="#!/bin/bash\necho pwned",
            base_dir=base_dir,
        )
        assert status == ArtifactStatus.QUARANTINED
        assert "unknown artifact type" in reason
        quarantine_path = os.path.join(base_dir, "quarantine", f"{aid}.json")
        assert os.path.exists(quarantine_path)

    def test_quarantine_on_oversize(self, base_dir):
        content = "x" * 2000
        status, aid, reason = intake(
            artifact_type="TEXT",
            source="human",
            content=content,
            base_dir=base_dir,
            max_bytes=1000,
        )
        assert status == ArtifactStatus.QUARANTINED
        assert "too large" in reason
        quarantine_path = os.path.join(base_dir, "quarantine", f"{aid}.json")
        assert os.path.exists(quarantine_path)

    def test_quarantine_logged_in_intake_jsonl(self, base_dir):
        status, aid, reason = intake(
            artifact_type="BADTYPE",
            source="human",
            content="something",
            base_dir=base_dir,
        )
        intake_path = os.path.join(base_dir, "intake.jsonl")
        with open(intake_path, "r") as f:
            lines = f.readlines()
        entry = json.loads(lines[-1])
        assert entry["status"] == "QUARANTINED"
        assert entry["artifact_id"] == aid

    def test_refused_on_invalid_source(self, base_dir):
        status, aid, reason = intake(
            artifact_type="TEXT",
            source="",
            content="test",
            base_dir=base_dir,
        )
        assert status == ArtifactStatus.REFUSED
        assert "invalid source" in reason
        archive_path = os.path.join(base_dir, "archive", f"{aid}.json")
        quarantine_path = os.path.join(base_dir, "quarantine", f"{aid}.json")
        assert not os.path.exists(archive_path)
        assert not os.path.exists(quarantine_path)


class TestHashMatchesContent:
    def test_hash_matches_stored_content(self, base_dir):
        content = "Hash me carefully."
        status, aid, reason = intake(
            artifact_type="TEXT",
            source="human",
            content=content,
            base_dir=base_dir,
        )
        record = load_artifact(aid, base_dir)
        expected_hash = hashlib.sha256(content.encode("utf-8")).hexdigest()
        assert record["content_hash"] == expected_hash

    def test_intake_event_hash_matches(self, base_dir):
        content = "Verify event hash."
        status, aid, reason = intake(
            artifact_type="TEXT",
            source="human",
            content=content,
            base_dir=base_dir,
        )
        intake_path = os.path.join(base_dir, "intake.jsonl")
        with open(intake_path, "r") as f:
            line = f.readline().strip()
        entry = json.loads(line)
        claimed_sha = entry.pop("sha256")
        unsigned = json.dumps(entry, separators=(",", ":"))
        computed = hashlib.sha256(unsigned.encode("utf-8")).hexdigest()
        assert claimed_sha == computed

    def test_sha256_bytes_matches_hashlib(self):
        data = b"test data 12345"
        assert sha256_bytes(data) == hashlib.sha256(data).hexdigest()


class TestLinkAndAnnotate:
    def test_link_appends_event(self, base_dir):
        intake("TEXT", "human", "a", base_dir=base_dir, artifact_id="aaa")
        intake("TEXT", "human", "b", base_dir=base_dir, artifact_id="bbb")
        link_artifacts("aaa", "bbb", base_dir, note="related docs")
        intake_path = os.path.join(base_dir, "intake.jsonl")
        with open(intake_path, "r") as f:
            lines = f.readlines()
        link_entry = json.loads(lines[-1])
        assert link_entry["event_type"] == "LINK"
        assert link_entry["artifact_id_a"] == "aaa"
        assert link_entry["artifact_id_b"] == "bbb"
        assert link_entry["note"] == "related docs"

    def test_annotate_appends_event(self, base_dir):
        intake("TEXT", "human", "content", base_dir=base_dir, artifact_id="ccc")
        annotate_artifact("ccc", "This is important", base_dir)
        intake_path = os.path.join(base_dir, "intake.jsonl")
        with open(intake_path, "r") as f:
            lines = f.readlines()
        ann_entry = json.loads(lines[-1])
        assert ann_entry["event_type"] == "ANNOTATE"
        assert ann_entry["artifact_id"] == "ccc"
        assert ann_entry["text"] == "This is important"


class TestValidation:
    def test_all_types_accepted(self, base_dir):
        for t in ALLOWED_TYPES:
            ok, reason = validate_artifact(t, "human", b"test")
            assert ok, f"type {t} should be valid"

    def test_custom_artifact_id_becomes_label(self, base_dir):
        status, aid, reason = intake(
            artifact_type="TEXT",
            source="human",
            content="custom id test",
            base_dir=base_dir,
            artifact_id="my-custom-id",
        )
        assert aid != "my-custom-id"
        assert len(aid) == 32
        loaded = load_artifact(aid, base_dir)
        assert loaded is not None

    def test_ensure_dirs_creates_structure(self, tmp_path):
        base = str(tmp_path / "new_evidence" / "artifacts")
        paths = ensure_dirs(base)
        assert os.path.isdir(paths["root"])
        assert os.path.isdir(paths["archive"])
        assert os.path.isdir(paths["quarantine"])
