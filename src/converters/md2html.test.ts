import { test, expect, describe } from 'vitest'
import { md2html } from './md2html'

describe('Markdown to HTML: Basic Formats', async () => {
  test('headings', async () => {
    const html1 = (await md2html('# Heading level 1')).trim()
    expect(html1).toBe('<h1>Heading level 1</h1>')

    const html2 = (await md2html('## Heading level 2')).trim()
    expect(html2).toBe('<h2>Heading level 2</h2>')

    const html3 = (await md2html('### Heading level 3')).trim()
    expect(html3).toBe('<h3>Heading level 3</h3>')

    const html4 = (await md2html('#### Heading level 4')).trim()
    expect(html4).toBe('<h4>Heading level 4</h4>')

    const html5 = (await md2html('##### Heading level 5')).trim()
    expect(html5).toBe('<h5>Heading level 5</h5>')

    const html6 = (await md2html('###### Heading level 6')).trim()
    expect(html6).toBe('<h6>Heading level 6</h6>')
  })

  test('italic', async () => {
    const html1 = (await md2html('*italic*')).trim()
    expect(html1).toBe('<p><em>italic</em></p>')

    const html2 = (await md2html('_italic_')).trim()
    expect(html2).toBe('<p><em>italic</em></p>')
  })

  test('bold', async () => {
    const html = (await md2html('**bold**')).trim()
    expect(html).toBe('<p><strong>bold</strong></p>')
  })

  test('bold & italic', async () => {
    const html = (await md2html('This text is **_really important_**.')).trim()
    expect(html).toBe(
      '<p>This text is <strong><em>really important</em></strong>.</p>'
    )
  })

  test('code', async () => {
    const html1 = (await md2html('At the command prompt, type `nano`.')).trim()
    expect(html1).toBe('<p>At the command prompt, type <code>nano</code>.</p>')

    const html2 = (
      await md2html('``Use `code` in your Markdown file.``')
    ).trim()
    expect(html2).toBe('<p><code>Use `code` in your Markdown file.</code></p>')
  })

  test('code blocks', async () => {
    const html = (await md2html('```<html><head></head></html>```')).trim()
    expect(html).toBe(
      `<p><code>&#x3C;html>&#x3C;head>&#x3C;/head>&#x3C;/html></code></p>`
    )
  })

  test('line breaks', async () => {
    const html = (
      await md2html(`line\\
breaks`)
    ).trim()
    expect(html).toBe('<p>line<br>breaks</p>')
  })

  test('horizontal rules', async () => {
    const html = (await md2html('---')).trim()
    expect(html).toBe('<hr>')
  })

  test('blockquote', async () => {
    const html = (
      await md2html(
        '> Dorothy followed her through many of the beautiful rooms in her castle.'
      )
    ).trim()
    expect(html).toBe(`<blockquote>
  <p>Dorothy followed her through many of the beautiful rooms in her castle.</p>
</blockquote>`)
  })

  test('ordered list', async () => {
    const html = (
      await md2html(`
1. First item
2. Second item
3. Third item
4. Fourth item
  `)
    ).trim()
    expect(html).toBe(`<ol>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
  <li>Fourth item</li>
</ol>`)
  })

  //   test('neseted ordered list', async () => {
  //     const html = (
  //       await md2html(`
  // 1. First item
  // 2. Second item
  // 3. Third item
  //   1. Indented item
  //   2. Indented item
  // 4. Fourth item`)
  //     ).trim()

  //     console.log(html)

  //     expect(html).toBe(`<ol>
  //   <li>First item</li>
  //   <li>Second item</li>
  //   <li>Third item
  //     <ol>
  //       <li>Indented item</li>
  //       <li>Indented item</li>
  //     </ol>
  //   </li>
  //   <li>Fourth item</li>
  // </ol>`)
  //   })

  test('unordered list', async () => {
    const html = (
      await md2html(`
* First item
* Second item
* Third item
* Fourth item
`)
    ).trim()
    expect(html).toBe(`<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
  <li>Fourth item</li>
</ul>`)
  })

  test('nested unordered list', async () => {
    const html = (
      await md2html(`
* First item
* Second item
* Third item
  * Indented item
  * Indented item
* Fourth item
`)
    ).trim()
    expect(html).toBe(`<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item
    <ul>
      <li>Indented item</li>
      <li>Indented item</li>
    </ul>
  </li>
  <li>Fourth item</li>
</ul>`)
  })

  test('link', async () => {
    const html = (
      await md2html(
        'My favorite search engine is [Duck Duck Go](https://duckduckgo.com).'
      )
    ).trim()
    expect(html).toBe(
      `<p>My favorite search engine is <a href="https://duckduckgo.com">Duck Duck Go</a>.</p>`
    )
  })

  test('image', async () => {
    const html1 = (
      await md2html(
        '![The San Juan Mountains are beautiful!](https://mdg.imgix.net/assets/images/san-juan-mountains.jpg "San Juan Mountains")'
      )
    ).trim()
    expect(html1).toBe(`<p>
  <img src="https://mdg.imgix.net/assets/images/san-juan-mountains.jpg" alt="The San Juan Mountains are beautiful!" title="San Juan Mountains">
</p>`)

    // linking image
    const html2 = (
      await md2html(
        '[![An old rock in the desert](https://mdg.imgix.net/assets/images/shiprock.jpg "Shiprock, New Mexico by Beau Rogers")](https://www.flickr.com/photos/beaurogers/31833779864/in/abc.png)'
      )
    ).trim()

    expect(html2).toBe(
      `<p><a href="https://www.flickr.com/photos/beaurogers/31833779864/in/abc.png"><img src="https://mdg.imgix.net/assets/images/shiprock.jpg" alt="An old rock in the desert" title="Shiprock, New Mexico by Beau Rogers"></a></p>`
    )
  })
})

describe('Markdown to HTML: Figures', async () => {
  test('image figure', async () => {
    const html = (
      await md2html(
        '<figure class="image"><img src="https://assets.matters.news/embed/02403a12-040c-4e4b-bed9-e932658abb44.png" srcset="https://assets.matters.news/processed/540w/embed/02403a12-040c-4e4b-bed9-e932658abb44.png"><figcaption><span>caption</span></figcaption></figure>'
      )
    ).trim()

    expect(html).toBe(`<figure class="image">
  <img src="https://assets.matters.news/embed/02403a12-040c-4e4b-bed9-e932658abb44.png" srcset="https://assets.matters.news/processed/540w/embed/02403a12-040c-4e4b-bed9-e932658abb44.png">
  <figcaption><span>caption</span></figcaption>
</figure>`)
  })

  test('audio figure', async () => {
    const html = (
      await md2html(
        '<figure class="audio"><audio controls data-file-name="點數經濟：讓過路客成為回頭客"><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3" data-asset-id="0a45d56a-d19a-4300-bfa4-305639fd5a82"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="39:05"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption><span>區塊勢 Podcast</span></figcaption></figure>'
      )
    ).trim()

    expect(html).toBe(`<figure class="audio">
  <audio controls data-file-name="點數經濟：讓過路客成為回頭客">
    <source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3" data-asset-id="0a45d56a-d19a-4300-bfa4-305639fd5a82">
  </audio>
  <div class="player">
    <header>
      <div class="meta">
        <h4 class="title">點數經濟：讓過路客成為回頭客</h4>
        <div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="39:05"></span></div>
      </div><span class="play"></span>
    </header>
    <footer>
      <div class="progress-bar"><span></span></div>
    </footer>
  </div>
  <figcaption><span>區塊勢 Podcast</span></figcaption>
</figure>`)
  })

  test('iframe figure', async () => {
    const html = (
      await md2html(
        '<figure class="embed-code"><div class="iframe-container"><iframe loading="lazy" src="https://jsfiddle.net/Sokiraon/t0gycfvb/embedded/" frameborder="0" sandbox="allow-scripts allow-same-origin allow-popups"></iframe></div><figcaption><span>完整的JSFiddle代碼</span></figcaption></figure>'
      )
    ).trim()

    expect(html).toBe(`<figure class="embed-code">
  <div class="iframe-container">
    <iframe loading="lazy" src="https://jsfiddle.net/Sokiraon/t0gycfvb/embedded/" frameborder="0" sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
  </div>
  <figcaption><span>完整的JSFiddle代碼</span></figcaption>
</figure>`)
  })
})

describe('Markdown to HTML: Full Content', async () => {
  // https://web-develop.matters.news/@btl1/10020-laborum-incididunt
  test('all formats', async () => {
    const html = (
      await md2html(`Cupidatat officia aute adipisicing ut aute reprehenderit ea duis. Commodo elit dolore deserunt occaecat esse ut sint ad eu non. Exercitation dolor in aliquip pariatur non exercitation officia reprehenderit laborum ea duis. Magna tempor eu est.

Irure aliqua labore nisi proident\\
aliqua ullamco\\
id magna\\
enim.

## Basic Formats

Do ea esse amet **excepteur** **esse** incididunt irure.

Voluptate *aute magna* sint dolore sunt id tempor.

Quis non commodo ex id in non id cillum duis voluptate pariatur elit.

Excepteur nostrud* reprehenderit amet* adipisicing enim cillum.

Nostrud consequat **_mollit irure esse_** laborum amet cupidatat irure ipsum.

Dolore labore laboris **consequat nostrud** Lorem irure excepteur incididunt adipisicing id.

Ullamco cillum **_esse anim dolore_** duis adipisicing.

Cillum incididunt **_nostrud sunt occaecat_** fugiat commodo quis in pariatur exercitation.

Veniam pariatur labore [consectetur](https://google.com) laborum.

> Fugiat consectetur culpa anim enim sit nisi culpa consequat Lorem ipsum.\\
> \\
> Qui proident non pariatur veniam est irure.

---

## Lists

1. Consectetur consequat exercitation aute ullamco mollit cillum sunt.
2. Adipisicing enim laboris dolore mollit.

Qui velit id cupidatat reprehenderit velit sit.

* Eiusmod sunt in ipsum cupidatat sint.
* Consectetur voluptate ipsum est.

Anim aute id labore exercitation reprehenderit ut sunt sit excepteur cillum minim velit nisi.

## Image & Audio

<figure class="image"><img src="https://assets-develop.matters.news/embed/c746aa26-794f-4a26-9dd9-c2c3e72f89f4.jpeg" data-asset-id="c746aa26-794f-4a26-9dd9-c2c3e72f89f4"><figcaption><span>Ullamco cupidatat laborum eiusmod laborum.</span></figcaption></figure>

<figure class="audio"><audio controls data-file-name="file_example_MP3_700KB" preload="metadata"><source src="https://assets-develop.matters.news/embedaudio/b320f5ce-2828-4358-9e71-aab3cf2a3ce5.mpga" type="audio/mpeg" data-asset-id="b320f5ce-2828-4358-9e71-aab3cf2a3ce5"></audio><div class="player"><header><div class="meta"><h4 class="title">file_example_MP3_700KB</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="00:27"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption><span>Non non et deserunt mollit reprehenderit consectetur est laboris in aliqua irure.</span></figcaption></figure>

## Embeds

<figure class="embed-video"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/VQKMoT-6XSg?rel=0" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe></div><figcaption><span>Sit cillum minim minim excepteur nostrud Lorem aliquip sint elit reprehenderit aute ipsum minim.</span></figcaption></figure>

<figure class="embed-code"><div class="iframe-container"><iframe src="https://jsfiddle.net/scarabresearch/2bzfrg59/embedded/" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe></div><figcaption><span></span></figcaption></figure>`)
    ).trim()

    expect(html)
      .toBe(`<p>Cupidatat officia aute adipisicing ut aute reprehenderit ea duis. Commodo elit dolore deserunt occaecat esse ut sint ad eu non. Exercitation dolor in aliquip pariatur non exercitation officia reprehenderit laborum ea duis. Magna tempor eu est.</p>
<p>Irure aliqua labore nisi proident<br>aliqua ullamco<br>id magna<br>enim.</p>
<h2>Basic Formats</h2>
<p>Do ea esse amet <strong>excepteur</strong> <strong>esse</strong> incididunt irure.</p>
<p>Voluptate <em>aute magna</em> sint dolore sunt id tempor.</p>
<p>Quis non commodo ex id in non id cillum duis voluptate pariatur elit.</p>
<p>Excepteur nostrud* reprehenderit amet* adipisicing enim cillum.</p>
<p>Nostrud consequat <strong><em>mollit irure esse</em></strong> laborum amet cupidatat irure ipsum.</p>
<p>Dolore labore laboris <strong>consequat nostrud</strong> Lorem irure excepteur incididunt adipisicing id.</p>
<p>Ullamco cillum <strong><em>esse anim dolore</em></strong> duis adipisicing.</p>
<p>Cillum incididunt <strong><em>nostrud sunt occaecat</em></strong> fugiat commodo quis in pariatur exercitation.</p>
<p>Veniam pariatur labore <a href="https://google.com">consectetur</a> laborum.</p>
<blockquote>
  <p>Fugiat consectetur culpa anim enim sit nisi culpa consequat Lorem ipsum.<br><br>Qui proident non pariatur veniam est irure.</p>
</blockquote>
<hr>
<h2>Lists</h2>
<ol>
  <li>Consectetur consequat exercitation aute ullamco mollit cillum sunt.</li>
  <li>Adipisicing enim laboris dolore mollit.</li>
</ol>
<p>Qui velit id cupidatat reprehenderit velit sit.</p>
<ul>
  <li>Eiusmod sunt in ipsum cupidatat sint.</li>
  <li>Consectetur voluptate ipsum est.</li>
</ul>
<p>Anim aute id labore exercitation reprehenderit ut sunt sit excepteur cillum minim velit nisi.</p>
<h2>Image &#x26; Audio</h2>
<figure class="image">
  <img src="https://assets-develop.matters.news/embed/c746aa26-794f-4a26-9dd9-c2c3e72f89f4.jpeg" data-asset-id="c746aa26-794f-4a26-9dd9-c2c3e72f89f4">
  <figcaption><span>Ullamco cupidatat laborum eiusmod laborum.</span></figcaption>
</figure>
<figure class="audio">
  <audio controls data-file-name="file_example_MP3_700KB" preload="metadata">
    <source src="https://assets-develop.matters.news/embedaudio/b320f5ce-2828-4358-9e71-aab3cf2a3ce5.mpga" type="audio/mpeg" data-asset-id="b320f5ce-2828-4358-9e71-aab3cf2a3ce5">
  </audio>
  <div class="player">
    <header>
      <div class="meta">
        <h4 class="title">file_example_MP3_700KB</h4>
        <div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="00:27"></span></div>
      </div><span class="play"></span>
    </header>
    <footer>
      <div class="progress-bar"><span></span></div>
    </footer>
  </div>
  <figcaption><span>Non non et deserunt mollit reprehenderit consectetur est laboris in aliqua irure.</span></figcaption>
</figure>
<h2>Embeds</h2>
<figure class="embed-video">
  <div class="iframe-container">
    <iframe src="https://www.youtube.com/embed/VQKMoT-6XSg?rel=0" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
  </div>
  <figcaption><span>Sit cillum minim minim excepteur nostrud Lorem aliquip sint elit reprehenderit aute ipsum minim.</span></figcaption>
</figure>
<figure class="embed-code">
  <div class="iframe-container">
    <iframe src="https://jsfiddle.net/scarabresearch/2bzfrg59/embedded/" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-popups"></iframe>
  </div>
  <figcaption><span></span></figcaption>
</figure>`)
  })
})

// test santize
