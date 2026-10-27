#!/usr/bin/env python3
"""Build the StoneBrook Carpentry pages from shared templates.

    python3 tools/build.py

One source for everything that repeats:
  data/projects.json      project categories, photos, captions and page SEO text
  partials/sprite.html    pencil-mark SVG symbols
  partials/estimate.html  the estimate form section (homepage + /free-estimate/)
  header / footer / phone bar / gallery markup below

It writes:
  projects/index.html               All Projects
  projects/<category>/index.html    one page per category
  free-estimate/index.html          standalone estimate page
  privacy-policy/, terms/           DRAFT placeholders (noindex)
  404.html                          custom not-found page
  projects.html                     redirect for old links
and refreshes the shared blocks inside index.html (between <!-- BUILD:x --> markers).

SITE is the public address used for canonical and share tags. Change it (and BASE_PATH
for the 404 page) when the site moves to its real domain.
"""
import html, json, re, time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = 'https://brilliantimpact-media.github.io/stonebrook-carpentry-website/'
BASE_PATH = '/stonebrook-carpentry-website/'
VERSION = time.strftime('%Y%m%d%H%M')
PHONE, PHONE_TEL = '(715) 308-2180', '+17153082180'

data = json.loads((ROOT / 'data/projects.json').read_text())
CATS = data['categories']
esc = lambda t: html.escape(t, quote=True)


def fill(text, **kw):
    for k, v in kw.items():
        text = text.replace('{{' + k + '}}', v)
    return text


# ---------------------------------------------------------------- shared pieces
def links(root, home):
    """Where the main links point from a page at this depth. On the homepage, sections are in-page."""
    h = home  # '' on the homepage, otherwise a relative path to it ('./', '../', '../../')
    return dict(
        services=f'{h}#services', process=f'{h}#process', reviews=f'{h}#reviews', about=f'{h}#about',
        work=f'{root}projects/',
        estimate='#estimate' if h == '' else f'{root}free-estimate/',
        home=h or './',
    )


def header(root, home, current=''):
    L = links(root, home)
    cur = lambda key: ' aria-current="page"' if current == key else ''
    sub = ''.join(
        f'\n          <li><a href="{root}projects/{c["slug"]}/"{cur(c["slug"])}>{c["name"].replace("&", "&amp;")}</a></li>' for c in CATS)
    msub = ''.join(f'\n      <a href="{root}projects/{c["slug"]}/">{c["name"].replace("&", "&amp;")}</a>' for c in CATS)
    work_cur = ' aria-current="page"' if current in ['all'] + [c['slug'] for c in CATS] else ''
    chevron = '<svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg>'
    return f'''<!-- Tape-measure scroll progress: the blade pulls out across the top as you scroll -->
<div class="tape" aria-hidden="true"><div class="tape-blade"><span class="tape-hook"></span></div></div>

<!-- ============ HEADER ============ -->
<header class="site-header" id="top">
  <div class="wrap header-inner">
    <a class="brand" href="{L['home']}" aria-label="StoneBrook Carpentry home">
      <img src="{root}assets/img/logo-horizontal-white.svg" alt="StoneBrook Carpentry" width="226" height="56">
    </a>
    <nav class="nav" aria-label="Main">
      <a href="{L['services']}">Services</a>
      <div class="nav-item has-menu">
        <a href="{L['work']}"{work_cur}>Our Work</a>
        <button class="sub-toggle" type="button" aria-expanded="false" aria-controls="work-menu" aria-label="Our Work pages">{chevron}</button>
        <ul class="submenu" id="work-menu">
          <li><a href="{root}projects/"{cur('all')}>All Projects</a></li>{sub}
        </ul>
      </div>
      <a href="{L['process']}">What to Expect</a>
      <a href="{L['reviews']}">Reviews</a>
      <a href="{L['about']}">About</a>
    </nav>
    <div class="header-cta">
      <a class="header-phone" href="tel:{PHONE_TEL}">{PHONE}</a>
      <a class="btn btn-tan btn-sm" href="{L['estimate']}"{cur('estimate')}>Get Your Free Estimate</a>
      <button class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu"><span></span><span></span></button>
    </div>
  </div>

  <nav class="mobile-nav" id="mobile-nav" aria-label="Mobile">
    <a href="{L['services']}">Services</a>
    <a href="{L['work']}">Our Work</a>
    <div class="m-sub">
      <a href="{root}projects/">All Projects</a>{msub}
    </div>
    <a href="{L['process']}">What to Expect</a>
    <a href="{L['reviews']}">Reviews</a>
    <a href="{L['about']}">About</a>
    <a href="{L['estimate']}">Get Your Free Estimate</a>
    <a href="tel:{PHONE_TEL}">Call {PHONE}</a>
  </nav>
</header>'''


def footer(root, home):
    L = links(root, home)
    return f'''<!-- ============ FOOTER ============ -->
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand-top" href="{L['home']}" aria-label="Back to top of the StoneBrook Carpentry homepage"><img src="{root}assets/img/logo-stacked-white.svg" alt="StoneBrook Carpentry" width="200" height="110"></a>
      <p>Carpentry and remodeling built to last, not just built fast.</p>
    </div>
    <nav class="footer-col" aria-label="Footer">
      <h4>Explore</h4>
      <a href="{L['services']}">Services</a>
      <a href="{L['work']}">Our Work</a>
      <a href="{L['process']}">What to Expect</a>
      <a href="{L['reviews']}">Reviews</a>
      <a href="{L['estimate']}">Free Estimate</a>
    </nav>
    <div class="footer-col">
      <h4>Contact</h4>
      <a href="tel:{PHONE_TEL}">{PHONE}</a>
      <span>Wilson, WI 54027</span>
      <span>Mon–Fri 7:30–5:30</span>
      <span>Licensed &amp; insured in Wisconsin</span>
    </div>
    <div class="footer-col">
      <h4>Serving</h4>
      <p>Hudson · North Hudson · River Falls · Somerset · Roberts · Hammond · Baldwin · Richmond · Menomonie · Plum City · Woodbury · Lakeland · Afton, and towns within 30 miles of Wilson.</p>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>© <span data-year>2026</span> StoneBrook Carpentry, LLC</p>
    <p class="footer-legal"><a href="{root}privacy-policy/">Privacy Policy</a><a href="{root}terms/">Terms &amp; Conditions</a></p>
    <p>Your Vision, Beautifully Built.</p>
  </div>
</footer>'''


def mbar(root, home):
    L = links(root, home)
    return f'''<!-- Phone-only call / estimate bar -->
<nav class="m-bar" aria-label="Quick contact"><a href="tel:{PHONE_TEL}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>Call</a><a href="{L['estimate']}">Free Estimate</a></nav>'''


def head(root, title, desc, path, css=(), noindex=False, extra=''):
    url = SITE + path
    robots = '\n<meta name="robots" content="noindex, follow">' if noindex else ''
    canon = '' if noindex else f'\n<link rel="canonical" href="{url}">'
    styles = ''.join(f'\n<link rel="stylesheet" href="{root}assets/css/{c}.css?v={VERSION}">' for c in ('main',) + tuple(css))
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">{robots}{canon}
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}assets/img/share-card.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="StoneBrook Carpentry: Your Vision, Beautifully Built.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:image" content="{SITE}assets/img/share-card.jpg">
<link rel="icon" href="{root}assets/img/logo-mark.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow+Semi+Condensed:wght@500;600&family=Barlow:ital,wght@0,400;0,500;0,600;1,400&family=Caveat:wght@600;700&display=swap" rel="stylesheet">{styles}
<script>
  // Only hide animated elements when JS is running and motion is wanted.
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('js');
</script>{extra}
</head>'''


def scripts(root, names):
    return ''.join(f'\n<script src="{root}assets/js/{n}.js?v={VERSION}"></script>' for n in names)


def page(root, home, *, title, desc, path, body, current='', css=(), js=('page', 'nav'), noindex=False,
         body_attr='', extra_head='', sprite=False):
    spr = '\n' + (ROOT / 'partials/sprite.html').read_text() if sprite else ''
    return f'''{head(root, title, desc, path, css, noindex, extra_head)}
<body{body_attr}>

<a class="skip" href="#main">Skip to content</a>
{spr}
{header(root, home, current)}

<main id="main">
{body}
</main>

{footer(root, home)}

{mbar(root, home)}{scripts(root, js)}
</body>
</html>
'''


def write(rel, text):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(text)
    print('wrote', rel)


def breadcrumb_ld(items):
    return '\n<script type="application/ld+json">\n' + json.dumps({
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': SITE + u} for i, (n, u) in enumerate(items)],
    }, indent=2) + '\n</script>'


# ---------------------------------------------------------------- project pages
def tabs(root, current):
    items = [('all', 'All Projects', f'{root}projects/')] + [(c['slug'], c['name'], f'{root}projects/{c["slug"]}/') for c in CATS]
    on = ' aria-current="page"'
    a = ''.join(
        f'\n      <a class="ptab{" on" if k == current else ""}" href="{u}" data-cat="{k}"{on if k == current else ""}>{esc(n)}</a>'
        for k, n, u in items)
    return f'''  <nav class="ptabs-bar" aria-label="Project types">
    <div class="wrap ptabs">{a}
    </div>
  </nav>'''


def gallery(root, cat):
    figs = []
    for p in cat['photos']:
        c = esc(p['caption'])
        figs.append(f'        <figure class="pshot"><button type="button" class="pshot-btn" aria-label="Open photo: {c}"><img src="{root}assets/img/projects/{p["file"]}" alt="{c}" width="{p["w"]}" height="{p["h"]}" loading="lazy" decoding="async"></button><figcaption>{c}</figcaption></figure>')
    return '      <div class="pgrid">\n' + '\n'.join(figs) + '\n      </div>'


def phero(root, img, pos, kicker, h1, intro, crumbs=''):
    return f'''  <section class="phero">
    <img class="phero-bg" src="{root}assets/img/projects/{img}" style="object-position:{pos}" alt="" fetchpriority="high">
    <div class="wrap">{crumbs}
      <p class="kicker">{kicker}</p>
      <h1>{h1}</h1>
      <p>{intro}</p>
    </div>
  </section>'''


def cta(root, heading):
    return f'''  <section class="pcta">
    <div class="wrap">
      <h2>{heading}</h2>
      <p>We'll come out, look closely at the space, and give you an honest, written quote.</p>
      <a class="btn btn-tan" href="{root}free-estimate/">Get Your Free Estimate</a>
    </div>
  </section>'''


LIGHTBOX = '''  <dialog class="lightbox" aria-label="Project photo">
    <button class="lightbox-close" aria-label="Close">×</button>
    <button class="lightbox-nav lightbox-prev" aria-label="Previous photo">‹</button>
    <figure>
      <img alt="">
      <figcaption class="lightbox-caption"></figcaption>
    </figure>
    <button class="lightbox-nav lightbox-next" aria-label="Next photo">›</button>
  </dialog>'''


def build_projects():
    a = data['all']
    root, home = '../', '../'
    sections = []
    for c in CATS:
        name = esc(c['name'])
        sections.append(f'''  <section class="pcat" id="{c["slug"]}" data-cat="{c["slug"]}">
    <div class="wrap">
      <header class="pcat-head"><h2><a href="{c["slug"]}/">{name}</a></h2><p>{esc(c["description"])}</p><a class="pcat-more" href="{c["slug"]}/">See all {name} projects</a></header>
{gallery(root, c)}
    </div>
  </section>''')
    body = '\n\n'.join([
        phero(root, a['hero'], a['pos'], 'Our Work', a['h1'], a['intro'], f'''
      <nav class="crumbs" aria-label="Breadcrumb"><a href="{home}">Home</a><span aria-hidden="true">/</span><span aria-current="page">Our Work</span></nav>'''),
        tabs(root, 'all'), *sections, cta(root, 'Thinking about a project like these?'), LIGHTBOX])
    write('projects/index.html', page(
        root, home, title=a['title'], desc=a['meta'], path='projects/', body=body, current='all',
        css=('projects',), js=('page', 'nav', 'projects'), body_attr=' class="projects-page" data-cat="all"',
        extra_head=breadcrumb_ld([('Home', ''), ('Our Work', 'projects/')])))

    for c in CATS:
        root, home = '../../', '../../'
        crumbs = f'''
      <nav class="crumbs" aria-label="Breadcrumb"><a href="{home}">Home</a><span aria-hidden="true">/</span><a href="../">Our Work</a><span aria-hidden="true">/</span><span aria-current="page">{esc(c["name"])}</span></nav>'''
        body = '\n\n'.join([
            phero(root, c['hero'], c['pos'], 'Our Work', c['h1'], esc(c['description']), crumbs),
            tabs(root, c['slug']),
            f'''  <section class="pcat pcat-single" data-cat="{c["slug"]}">
    <div class="wrap">
{gallery(root, c)}
      <p class="pcat-back"><a href="../">View all projects</a></p>
    </div>
  </section>''',
            cta(root, c['cta']), LIGHTBOX])
        write(f'projects/{c["slug"]}/index.html', page(
            root, home, title=c['title'], desc=c['meta'], path=f'projects/{c["slug"]}/', body=body, current=c['slug'],
            css=('projects',), js=('page', 'nav', 'projects'), body_attr=f' class="projects-page" data-cat="{c["slug"]}"',
            extra_head=breadcrumb_ld([('Home', ''), ('Our Work', 'projects/'), (c['name'], f'projects/{c["slug"]}/')])))


# ---------------------------------------------------------------- estimate page
def build_estimate():
    root = home = '../'
    est = fill((ROOT / 'partials/estimate.html').read_text(), root=root, est_h='h1')
    est = est.replace('<section class="estimate" id="estimate">', '<section class="estimate estimate-page" id="estimate">', 1)
    write('free-estimate/index.html', page(
        root, home,
        title='Get a Free Estimate | StoneBrook Carpentry, Wilson WI',
        desc="Request a free estimate from StoneBrook Carpentry. Tell us a little about your project and we'll call you back to set up a time to see the space. No pressure, no obligation.",
        path='free-estimate/', body=est, current='estimate', js=('page', 'nav', 'estimate'),
        body_attr=' class="estimate-landing"', sprite=True,
        extra_head=breadcrumb_ld([('Home', ''), ('Free Estimate', 'free-estimate/')])))


# ---------------------------------------------------------------- legal + 404
def legal(slug, h1, sections):
    root = home = '../'
    items = ''.join(f'\n      <h2>{h}</h2>\n      <p class="todo">{t}</p>' for h, t in sections)
    body = f'''  <section class="legal">
    <div class="wrap legal-wrap">
      <p class="draft-flag"><strong>Draft placeholder. Not legal text.</strong> This page needs content written or approved by StoneBrook Carpentry (and reviewed by whoever handles their legal matters) before the site launches. The headings below list what it usually covers.</p>
      <h1>{h1}</h1>
      <p class="legal-meta">Last updated: [date to be set when approved]</p>{items}
    </div>
  </section>'''
    write(f'{slug}/index.html', page(root, home, title=f'{h1} | StoneBrook Carpentry', desc=f'{h1} for the StoneBrook Carpentry website.',
                                     path=f'{slug}/', body=body, noindex=True, body_attr=' class="legal-page"'))


def build_legal():
    legal('privacy-policy', 'Privacy Policy', [
        ('Who we are', '[Business name, address and contact for privacy questions.]'),
        ('Information we collect', '[What the estimate form collects: name, phone, email, town, project details and notes.]'),
        ('How we use it', '[For example: to respond to estimate requests and schedule visits.]'),
        ('Form and email services', '[Name the form service once it is chosen, and any email or CRM tools that receive submissions.]'),
        ('Cookies and analytics', '[List analytics or tracking tools if any are added. The site currently uses Google Fonts.]'),
        ('Sharing', '[Whether information is shared with anyone, and when.]'),
        ('Your choices', '[How someone can ask to see, correct or delete their information.]'),
        ('Contact', '[Phone and email for privacy questions.]'),
    ])
    legal('terms', 'Terms & Conditions', [
        ('About this website', '[What the site is for and who operates it.]'),
        ('Estimates', '[Whether an online request creates any obligation. Formal quotes and contracts are separate.]'),
        ('Photos and content', '[Ownership of the photos and text on the site.]'),
        ('Links to other sites', '[For example, Google reviews.]'),
        ('Limitation of liability', '[To be written or reviewed by the business or its attorney.]'),
        ('Changes to these terms', '[How updates are handled.]'),
        ('Contact', '[Phone and email.]'),
    ])


def build_404():
    # Served for any missing path, so links resolve from the site root via <base>.
    root = home = ''
    body = '''  <section class="nf grid-paper">
    <div class="wrap nf-wrap">
      <p class="nf-num" aria-hidden="true">404</p>
      <h1>This page doesn't measure up.</h1>
      <p>The page you're looking for has moved or doesn't exist. Try one of these instead:</p>
      <p class="nf-links"><a class="btn btn-slate" href="./">Home</a><a class="btn btn-slate" href="projects/">Our Work</a><a class="btn btn-tan" href="free-estimate/">Get Your Free Estimate</a></p>
      <p>Or call us at <a href="tel:+17153082180">(715) 308-2180</a>.</p>
    </div>
  </section>'''
    out = page(root, './', title='Page Not Found | StoneBrook Carpentry', desc='This page could not be found.', path='404.html',
               body=body, noindex=True, body_attr=' class="nf-page"')
    out = out.replace('<meta charset="UTF-8">', f'<meta charset="UTF-8">\n<base href="{BASE_PATH}">', 1)
    write('404.html', out)


def build_redirect():
    # Old address of the gallery. Category hashes go to the new category pages.
    write('projects.html', f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Our Projects | StoneBrook Carpentry</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="{SITE}projects/">
<meta http-equiv="refresh" content="0; url=projects/">
<script>
  var cats = {json.dumps([c['slug'] for c in CATS])}, h = location.hash.slice(1);
  location.replace('projects/' + (cats.indexOf(h) > -1 ? h + '/' : ''));
</script>
</head>
<body><p>This page has moved to <a href="projects/">Our Work</a>.</p></body>
</html>
''')


# ---------------------------------------------------------------- homepage blocks
def build_index():
    p = ROOT / 'index.html'
    s = p.read_text()
    blocks = {
        'header': header('', ''),
        'sprite': (ROOT / 'partials/sprite.html').read_text().rstrip(),
        'estimate': fill((ROOT / 'partials/estimate.html').read_text(), root='', est_h='h2').rstrip(),
        'footer': footer('', ''),
        'mbar': mbar('', ''),
        'scripts': scripts('', ('nav', 'estimate', 'main')).strip(),
    }
    for k, v in blocks.items():
        pat = re.compile(rf'(<!-- BUILD:{k} -->\n).*?(\n<!-- /BUILD:{k} -->)', re.S)
        if not pat.search(s):
            raise SystemExit(f'index.html is missing the BUILD:{k} markers')
        s = pat.sub(lambda m: m.group(1) + v + m.group(2), s)
    s = re.sub(r'(assets/css/main\.css)\?v=\d+', rf'\1?v={VERSION}', s)
    p.write_text(s)
    print('updated index.html')


if __name__ == '__main__':
    build_projects()
    build_estimate()
    build_legal()
    build_404()
    build_redirect()
    build_index()
