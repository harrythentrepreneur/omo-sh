from pathlib import Path
import unittest


PAGE = Path(__file__).parents[1] / "omo-space.html"


class OmoSpaceWhitepaperTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = PAGE.read_text(encoding="utf-8")

    def test_page_contains_whitepaper_sections_and_figures(self):
        for marker in (
            'id="walk"',
            'id="background"',
            'id="system"',
            'id="method"',
            'id="findings"',
            'id="broke"',
            'id="discussion"',
            'id="future"',
            'id="conclusion"',
            "/research/rooms-not-windows/img/il-agents-in-minecraft-world.jpg",
        ):
            self.assertIn(marker, self.html)

    def test_page_keeps_quick_start_and_github_actions(self):
        self.assertIn('id="agent-quick-start"', self.html)
        self.assertIn('class="aq-copy"', self.html)
        self.assertIn("https://github.com/omoresearch/omo-space", self.html)
        self.assertIn("https://github.com/omoresearch/omo-space/releases/download/v1.2.0/install.sh", self.html)

    def test_page_has_no_citations_or_reference_section(self):
        self.assertNotRegex(self.html, r'class="cite"|class="refs"|id="sources"|>Sources<')
        self.assertNotRegex(self.html, r'\[S\d+\]|href="#ref-\d+"|href="#s\d+"')

    def test_quick_start_script_is_present(self):
        self.assertIn("navigator.clipboard.writeText", self.html)
        self.assertIn("class=\"aq-chip\"", self.html)
        self.assertIn("class=\"aq-own\"", self.html)

    def test_hero_text_has_readable_contrast_guard(self):
        self.assertRegex(self.html, r"\.hero h1[^}]*color:\s*#51463d")
        self.assertIn("text-shadow:", self.html)


if __name__ == "__main__":
    unittest.main()
