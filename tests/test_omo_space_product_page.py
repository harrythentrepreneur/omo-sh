"""Regression checks for the product page, not a duplicate research paper."""
import unittest
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

class ProductPageTests(unittest.TestCase):
    def test_product_story_replaces_paper_body(self):
        text = (ROOT / 'omo-space.html').read_text()
        self.assertNotIn('class="rb-article"', text)
        self.assertNotIn('class="rb-cite"', text)
        self.assertNotIn('paper.js', text)
        self.assertIn('Give your agents', text)
        self.assertIn('Twenty agents.', text)
        self.assertIn('/papers/worlds-not-windows/whitepaper', text)

    def test_prompt_and_product_actions_are_preserved(self):
        text = (ROOT / 'omo-space.html').read_text()
        page = Page(text)
        ids = [a['id'] for _, a in page.tags if 'id' in a]
        self.assertEqual(len(ids), len(set(ids)))
        self.assertEqual(sum(t == 'h1' for t, _ in page.tags), 1)
        self.assertEqual(sum(t == 'button' and a.get('class') == 'aq-chip' for t, a in page.tags), 5)
        self.assertIn('Copy prompt', text)
        self.assertIn('navigator.clipboard.writeText', text)
        self.assertIn('Never sign in for me.', text)
        links = [a.get('href') for t, a in page.tags if t == 'a']
        self.assertIn('https://github.com/omoresearch/omo-space', links)
        self.assertIn('/demo', links)
        self.assertIn('#agent-quick-start', links)

    def test_all_local_links_and_images_resolve(self):
        page = Page((ROOT / 'omo-space.html').read_text())
        for tag, attrs in page.tags:
            for key in ('href', 'src'):
                url = attrs.get(key, '').split('#')[0].split('?')[0]
                if not url.startswith('/'):
                    continue
                path = ROOT / url.lstrip('/')
                with self.subTest(url=url):
                    self.assertTrue(any(p.exists() for p in (path, Path(str(path) + '.html'), path / 'index.html')))
            if tag == 'img':
                self.assertTrue(attrs.get('alt'))
                self.assertTrue(attrs.get('width'))
                self.assertTrue(attrs.get('height'))

if __name__ == '__main__':
    unittest.main()
