"""
Tests for the login banner.

Verifies:
- Banner contains required text markers
- get_banner() returns the LOGIN_BANNER constant
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from server import LOGIN_BANNER, get_banner


class TestLoginBanner:
    """Test login banner content."""

    def test_banner_contains_title(self):
        assert "HARRIS WILDLANDS" in LOGIN_BANNER

    def test_banner_contains_prompt(self):
        assert "Under what name shall your deeds be recorded?" in LOGIN_BANNER

    def test_banner_contains_domain(self):
        assert "mud.harriswildlands.com" in LOGIN_BANNER

    def test_banner_contains_governance(self):
        assert "PLAN" in LOGIN_BANNER
        assert "CONSENT" in LOGIN_BANNER
        assert "BUILD" in LOGIN_BANNER

    def test_banner_contains_bruce(self):
        assert "Bruce" in LOGIN_BANNER

    def test_get_banner_returns_constant(self):
        assert get_banner() == LOGIN_BANNER
        assert get_banner() is LOGIN_BANNER
