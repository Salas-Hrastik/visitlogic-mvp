# -*- coding: utf-8 -*-
"""Renderira inline SVG sheme iz HTML-a modula u PNG (svgpng/shemaNN.png)."""
import os
from playwright.sync_api import sync_playwright

HTML = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'modul-1-arhitektura-urbanizam.html'))
OUT = os.path.abspath('svgpng')
CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'

os.makedirs(OUT, exist_ok=True)
with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1200, 'height': 1000}, color_scheme='light', device_scale_factor=2)
    pg.goto('file://' + HTML); pg.wait_for_timeout(2500)
    els = pg.query_selector_all('figure svg')
    for i, el in enumerate(els):
        el.scroll_into_view_if_needed(); pg.wait_for_timeout(150)
        el.screenshot(path=os.path.join(OUT, f'shema{i+1:02d}.png'))
    print('renderirano shema:', len(els))
    b.close()
