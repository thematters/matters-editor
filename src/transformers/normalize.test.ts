import { stripIndent } from 'common-tags'
import { describe, expect, test } from 'vitest'

import { normalizeArticleHTML, normalizeCommentHTML } from './normalize'

const expectNormalizeArticleHTML = (input: string, output: string) => {
  const result = normalizeArticleHTML(input)
  expect(result.trim()).toBe(output)
}

const expectNormalizeCommentHTML = (input: string, output: string) => {
  const result = normalizeCommentHTML(input)
  expect(result.trim()).toBe(output)
}

/**
 * Tests
 */
describe('Normalization: Article', () => {
  test('bolds', () => {
    expectNormalizeArticleHTML(
      '<p><strong>abc</strong></p>',
      '<p><strong>abc</strong></p>',
    )

    expectNormalizeArticleHTML(
      '<p><b>abc</b></p>',
      '<p><strong>abc</strong></p>',
    )
  })

  test('strikethrough', () => {
    expectNormalizeArticleHTML('<p><s>abc</s></p>', '<p><s>abc</s></p>')

    expectNormalizeArticleHTML('<p><del>abc</del></p>', '<p><s>abc</s></p>')

    expectNormalizeArticleHTML(
      '<p><strike>abc</strike></p>',
      '<p><s>abc</s></p>',
    )
  })

  test('italic', () => {
    expectNormalizeArticleHTML(
      '<p><strong>abc</strong></p>',
      '<p><strong>abc</strong></p>',
    )

    expectNormalizeArticleHTML(
      '<p><i>abc</i></p>',
      '<p><strong>abc</strong></p>',
    )
  })

  test('underline', () => {
    expectNormalizeArticleHTML(
      '<p><u>abc</u></p>',
      '<p><strong>abc</strong></p>',
    )
  })

  test('self-closed tags', () => {
    expectNormalizeArticleHTML('<p />', '<p></p>')

    expectNormalizeArticleHTML('<br></br>', '<p><br class="smart"></p>')

    expectNormalizeArticleHTML('<hr/>', '<hr>')

    // <img /> -> <img>
    expectNormalizeArticleHTML(
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg" /><figcaption>左：女反派。右：女主。</figcaption></figure>',
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg"><figcaption>左：女反派。右：女主。</figcaption></figure>',
    )

    // <iframe /> -> <iframe></iframe>
    expectNormalizeArticleHTML(
      '<figure class="embed" data-provider="youtube"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0" /></div><figcaption></figcaption></figure>',
      '<figure class="embed embed-video" data-provider="youtube"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>',
    )
  })

  test('figure: image', () => {
    // identical
    expectNormalizeArticleHTML(
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg"><figcaption>左：女反派。右：女主。</figcaption></figure>',
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg"><figcaption>左：女反派。右：女主。</figcaption></figure>',
    )

    // backward compatible
    expectNormalizeArticleHTML(
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg" data-asset-id="c40d5045-0c03-44b6-afe6-93a285ffd1bb"><figcaption><span>左：女反派。右：女主。</span></figcaption></img></figure>',
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg"><figcaption>左：女反派。右：女主。</figcaption></figure>',
    )

    // unknown attributes
    expectNormalizeArticleHTML(
      '<figure class="image" something unknown><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg"><figcaption>左：女反派。右：女主。</figcaption></figure>',
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg"><figcaption>左：女反派。右：女主。</figcaption></figure>',
    )

    // unmatch
    expectNormalizeArticleHTML(
      '<figure class="image unknown class" something unknown><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg"><figcaption>左：女反派。右：女主。</figcaption></figure>',
      '<p>左：女反派。右：女主。</p>',
    )
  })

  test('figure: audio', () => {
    // identical
    expectNormalizeArticleHTML(
      '<figure class="audio"><audio controls><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption>區塊勢 Podcast</figcaption></figure>',
      '<figure class="audio"><audio controls data-file-name="點數經濟：讓過路客成為回頭客"><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption>區塊勢 Podcast</figcaption></figure>',
    )

    // backward compatible
    expectNormalizeArticleHTML(
      '<figure class="audio"><audio controls data-file-name="點數經濟：讓過路客成為回頭客"><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3" data-asset-id="0a45d56a-d19a-4300-bfa4-305639fd5a82"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption><span>區塊勢 Podcast</span></figcaption></figure>',
      '<figure class="audio"><audio controls data-file-name="點數經濟：讓過路客成為回頭客"><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption>區塊勢 Podcast</figcaption></figure>',
    )

    expectNormalizeArticleHTML(
      '<figure class="audio"><audio controls data-file-name="點數經濟：讓過路客成為回頭客"><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3" data-asset-id="0a45d56a-d19a-4300-bfa4-305639fd5a82"></audio><figcaption><span>區塊勢 Podcast</span></figcaption></figure>',
      '<figure class="audio"><audio controls data-file-name=""><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3"></audio><div class="player"><header><div class="meta"><h4 class="title"></h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption>區塊勢 Podcast</figcaption></figure>',
    )

    // unknown attributes
    expectNormalizeArticleHTML(
      '<figure class="audio" something unknown><audio controls><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption>區塊勢 Podcast</figcaption></figure>',
      '<figure class="audio"><audio controls data-file-name="點數經濟：讓過路客成為回頭客"><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption>區塊勢 Podcast</figcaption></figure>',
    )

    // unmatch
    expectNormalizeArticleHTML(
      '<figure class="audio unknown class"><audio controls><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption>區塊勢 Podcast</figcaption></figure>',
      '<p>點數經濟：讓過路客成為回頭客</p><p>區塊勢 Podcast</p>',
    )
  })

  test('figure: embeds', () => {
    // identical
    expectNormalizeArticleHTML(
      '<figure class="embed embed-video" data-provider="youtube"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>',
      '<figure class="embed embed-video" data-provider="youtube"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>',
    )

    // backward compatible
    expectNormalizeArticleHTML(
      '<figure class="embed-video"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" frameborder="0" allowfullscreen="true" sandbox="allow-scripts allow-same-origin allow-popups"></iframe></div><figcaption><span></span></figcaption></figure>',
      '<figure class="embed embed-video" data-provider="youtube"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>',
    )

    // unknown attributes
    expectNormalizeArticleHTML(
      '<figure class="embed" something unknown data-provider="youtube" style="font-size: 500"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>',
      '<figure class="embed embed-video" data-provider="youtube"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>',
    )

    // unmatch
    expectNormalizeArticleHTML(
      '<figure class="unknown class embed" something unknown data-provider="youtube" style="font-size: 500"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>',
      '<p></p>',
    )
  })

  test('figure: embed YouTube', () => {
    // correct URL
    const youtubeUrls = [
      'https://www.youtube.com/watch?v=Zk7DppcfaMY',
      'https://www.youtube.com/embed/Zk7DppcfaMY',
      'https://youtu.be/Zk7DppcfaMY',
      'https://youtu.be/Zk7DppcfaMY/',
      'https://youtu.be/Zk7DppcfaMY?abc=123',
    ]
    const youtubeTargetUrl = 'https://www.youtube.com/embed/Zk7DppcfaMY?rel=0'
    youtubeUrls.forEach((url) => {
      expectNormalizeArticleHTML(
        `<figure class="embed" data-provider="youtube"><div class="iframe-container"><iframe src="${url}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
        `<figure class="embed embed-video" data-provider="youtube"><div class="iframe-container"><iframe src="${youtubeTargetUrl}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
      )
    })
  })

  test('figure: embed Vimeo', () => {
    // correct URL
    const vimeoUrls = [
      'https://vimeo.com/332732612',
      'https://vimeo.com/332732612/',
      'https://player.vimeo.com/video/332732612',
      'https://player.vimeo.com/video/332732612/',
      'https://player.vimeo.com/video/332732612?abc=123',
    ]
    const vimeoTargetUrl = 'https://player.vimeo.com/video/332732612'
    vimeoUrls.forEach((url) => {
      expectNormalizeArticleHTML(
        `<figure class="embed" data-provider="vimeo"><div class="iframe-container"><iframe src="${url}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
        `<figure class="embed embed-video" data-provider="vimeo"><div class="iframe-container"><iframe src="${vimeoTargetUrl}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
      )
    })
  })

  test('figure: embed Bilibili', () => {
    // correct URL
    const bilibiliUrls = [
      'https://www.bilibili.com/video/BV1bW411n7fY/',
      'https://www.bilibili.com/video/BV1bW411n7fY',
      'https://www.bilibili.com/BV1bW411n7fY/',
      'https://www.bilibili.com/BV1bW411n7fY',
      'https://player.bilibili.com/player.html?bvid=BV1bW411n7fY',
      'https://www.bilibili.com/BV1bW411n7fY?abc=123',
    ]
    const bilibiliTargetUrl =
      // 'https://player.bilibili.com/player.html?bvid=BV1bW411n7fY'
      // 'https://player.bilibili.com/player.html?bvid=BV1bW411n7fY&autoplay=0'
      'https://player.bilibili.com/player.html?bvid=BV1bW411n7fY&amp;autoplay=0'

    bilibiliUrls.forEach((url) => {
      expectNormalizeArticleHTML(
        `<figure class="embed" data-provider="bilibili"><div class="iframe-container"><iframe src="${url}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
        `<figure class="embed embed-video" data-provider="bilibili"><div class="iframe-container"><iframe src="${bilibiliTargetUrl}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
      )
    })
  })

  // test('figure: embed Twitter',  () => {

  // })

  test('figure: embed Instagram', () => {
    // correct URL
    const twitterUrls = [
      'https://www.instagram.com/p/CkszmehL4hF/',
      'https://www.instagram.com/p/CkszmehL4hF/?abc=123',
    ]
    const instagramTargetUrl = 'https://www.instagram.com/p/CkszmehL4hF/embed'
    twitterUrls.forEach((url) => {
      expectNormalizeArticleHTML(
        `<figure class="embed" data-provider="instagram"><div class="iframe-container"><iframe src="${url}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
        `<figure class="embed" data-provider="instagram"><div class="iframe-container"><iframe src="${instagramTargetUrl}" loading="lazy" frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
      )
    })
  })

  test('figure: embed JSFiddle', () => {
    // correct URL
    const jsfiddleUrls = [
      'https://jsfiddle.net/zfUyN',
      'https://jsfiddle.net/zfUyN/',
      'https://jsfiddle.net/kizu/zfUyN/',
      'https://jsfiddle.net/kizu/zfUyN/embedded/',
      'https://jsfiddle.net/kizu/zfUyN/embedded/result/',
      'https://jsfiddle.net/kizu/zfUyN/embed/js,result/',
      'https://jsfiddle.net/kizu/zfUyN/embed/js,result/?abc=123',
    ]
    const jsfiddleTargetUrl = 'https://jsfiddle.net/zfUyN/embedded/'
    jsfiddleUrls.forEach((url) => {
      expectNormalizeArticleHTML(
        `<figure class="embed" data-provider="jsfiddle"><div class="iframe-container"><iframe src="${url}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
        `<figure class="embed embed-code" data-provider="jsfiddle"><div class="iframe-container"><iframe src="${jsfiddleTargetUrl}" loading="lazy" frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
      )
    })
  })

  test('figure: embed CodePen', () => {
    // correct URL
    const codepenUrls = [
      'https://codepen.io/ykadosh/pen/jOwjmJe/',
      'https://codepen.io/ykadosh/pen/jOwjmJe',
      'https://codepen.io/ykadosh/embed/jOwjmJe',
      'https://codepen.io/ykadosh/embed/preview/jOwjmJe',
      'https://codepen.io/ykadosh/embed/preview/jOwjmJe?abc=123',
    ]
    const codepenTargetUrl = 'https://codepen.io/ykadosh/embed/preview/jOwjmJe'
    codepenUrls.forEach((url) => {
      expectNormalizeArticleHTML(
        `<figure class="embed" data-provider="codepen"><div class="iframe-container"><iframe src="${url}" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
        `<figure class="embed embed-code" data-provider="codepen"><div class="iframe-container"><iframe src="${codepenTargetUrl}" loading="lazy" frameborder="0"></iframe></div><figcaption></figcaption></figure>`,
      )
    })
  })

  test('article content from thrid-party API', () => {
    expectNormalizeArticleHTML(
      '\n<figure class="is-layout-flex wp-block-gallery-1 wp-block-gallery has-nested-images columns-default is-cropped image">\n<figure class="wp-block-image size-large image"><img width="1024" height="1024" data-id="3381" src="https://assets.matters.news/embed/cd4e0177-e146-4fa0-8f40-4fd67189f385.jpeg" alt class="wp-image-3381" data-asset-id="cd4e0177-e146-4fa0-8f40-4fd67189f385"><figcaption class="wp-element-caption">金曲樂團百合花打造新世代抓姦神曲〈掠猴之歌〉(照片：Taiwan Beats提供)</figcaption></figure>\n<figcaption><span></span></figcaption></figure>\n\n\n\n<hr class="wp-block-separator has-alpha-channel-opacity is-style-wide">\n\n\n\n<p class="has-medium-font-size"><strong>金曲樂團百合花看透現代成人愛情關係 打造新世代抓姦神曲〈掠猴之歌〉</strong></p>\n\n\n\n<p class="has-text-align-justify">榮獲<a href="https://money.udn.com/money/story/7307/6432158" target="_blank" data-type="URL" data-id="https://money.udn.com/money/story/7307/6432158" rel="noreferrer noopener">金曲獎最佳台語專輯</a>的百合花樂團，近期宣布啟動海外演出計畫，即將前進新加坡、馬來西亞演出，然而許久未跟台灣樂迷互動的他們，也特別推出全新〈<a href="https://www.youtube.com/watch?v=u7AqYDBrjBI" data-type="URL" data-id="https://www.youtube.com/watch?v=u7AqYDBrjBI" target="_blank" rel="noopener">掠猴之歌</a>〉MV，搞怪奇幻色彩，宛如前世時空記憶，卻擁有千年不變的相同錯綜複雜感情議題，糾結惱人情緒，即便經過多次輪迴依舊解不開，<strong>原來「出軌」這件事，無論哪個世紀都可能存在</strong>。百合花打趣笑說：「掠猴就是抓偷吃的意思，也是每個人感情裡最不想遇到的事情，我們用幽默手法與旋律，窺探愛情裡各種面貌。」百合花特別也為〈掠猴之歌〉打造一款線上互動遊戲「掠猴之遊戲Monkey-Catching Game」，邀請樂迷替苦主「金蕉小姐」搜集猴子老公出軌的證據！</p>\n\n\n\n<p class="has-text-align-justify">百合花從首張大碟囊括金音獎最佳搖滾專輯、最佳新人，第二張作品贏得去年金曲獎最佳台語專輯殊榮，奠定當今獨立樂壇地位，樂團不斷嘗試以傳統樂器混搭流行旋律，透過幽默與嘲諷歌詞拼貼，企圖打造千禧世代的「<strong>後台灣新歌謠</strong>」，也表現出略帶異色卻又充滿社會百態風情的生命之作。其中描繪當代成人複雜愛情觀的〈掠猴之歌〉，名符其實是一首「<strong>抓姦歌</strong>」，樂團比擬歌曲如同奧斯卡大導演「<strong><a href="https://zh.wikipedia.org/zh-tw/%E7%A7%91%E6%81%A9%E5%85%84%E5%BC%9F" target="_blank" rel="noreferrer noopener">柯恩兄弟</a></strong>」的瀟灑態度，卻又加入金馬獎導演黃信堯擅於小人物縮影觀察，濃縮成一首現代社會面對愛情出軌的直球對決。</p>\n\n\n\n<hr class="wp-block-separator has-alpha-channel-opacity is-style-wide">\n\n\n\n<figure class="wp-block-image size-large image"><img width="1024" height="573" src="https://assets.matters.news/embed/1169f99f-f0a0-43ba-ac72-731267b0dd19.jpeg" alt class="wp-image-3380" data-asset-id="1169f99f-f0a0-43ba-ac72-731267b0dd19"><figcaption><span></span></figcaption></figure>\n\n\n\n<p class="has-palette-color-3-color has-text-color has-medium-font-size"><strong>MV上演抓姦千年穿越劇 警世寓言大讚宛如百合花式「戲說台灣」！</strong></p>\n\n\n\n<p class="has-text-align-justify">也因為〈掠猴之歌〉散發一股獨特電影感氣息，百合花決定讓MV呈現樂團從未有過的影像風格，特別邀請曾入圍金曲最佳MV的導演林毛執導，攜手<a href="https://www.instagram.com/sidandgeri/" target="_blank" rel="noreferrer noopener">藝術家sid and geri</a>合力操刀，把感情裡最不想觸碰的「抓猴」議題，也能變成一場又鏗又充滿警世意味寓言遊戲。<br>MV把場景拉到西元前3000年，在千年世紀之前，同樣也有出軌問題，女主角找來專業徵信雙人組做一場交易，藉由奇異魔法與幻術，企圖找出另一半偷吃證據，導演特別跟現代時空交錯，彷彿上演一場前世今生的「抓姦輪迴」大戲，他也表示：「<strong>過去華語歌曲常以哀怨節奏描繪外遇、偷吃等感情失敗關係，但百合花反其道而行，改以自嘲幽默手法，讓抓姦不再只是一場社會悲劇。」樂團成員看到MV成品後大讚導演瘋狂創意，繽紛視覺加上穿越劇方式，笑稱「我們也有屬於百合花式風格的《細說台灣》了！</strong>」</p>\n\n\n\n<hr class="wp-block-separator has-alpha-channel-opacity is-style-wide">\n\n\n\n<p class="has-medium-font-size"><strong>推出線上互動「掠猴之遊戲」 邀請樂迷一起上網協尋偷吃出軌證據</strong><br><strong>百合花宣布啟動海外巡演計畫！ 四月底前進星馬演出</strong></p>\n\n\n\n<figure class="wp-block-image aligncenter size-full image"><img width="960" height="200" src="https://assets.matters.news/embed/d9e8e43a-46be-4dd3-9c4a-7d3079144d3a.png" alt class="wp-image-3382" data-asset-id="d9e8e43a-46be-4dd3-9c4a-7d3079144d3a"><figcaption><span></span></figcaption></figure>\n\n\n\n<figure class="wp-block-image aligncenter size-full"><a href="https://liliumtaiwan.itch.io/monkey" target="_blank" rel="noreferrer noopener"><figure class="image"><img width="603" height="765" src="https://assets.matters.news/embed/c7a25d10-4820-42b3-8ec1-c56fbf8b75d7.jpeg" alt class="wp-image-3384" data-asset-id="c7a25d10-4820-42b3-8ec1-c56fbf8b75d7"><figcaption><span></span></figcaption></figure></a><figcaption><span></span></figcaption></figure>\n\n\n\n<p class="has-small-font-size"><strong><a href="https://liliumtaiwan.itch.io/monkey" target="_blank" data-type="URL" data-id="https://liliumtaiwan.itch.io/monkey" rel="noreferrer noopener">推出線上互動「掠猴之遊戲」 邀請樂迷一起上網協尋偷吃出軌證據</a></strong></p>\n\n\n\n<p class="has-text-align-justify">〈掠猴之歌〉MV還埋藏樂團先前推出的線上互動遊戲「<a href="https://liliumtaiwan.itch.io/monkey" target="_blank" rel="noreferrer noopener">掠猴之遊戲Monkey-Catching Game</a>」彩蛋，邀請樂迷一邊看MV也能從中挖掘，<strong>主唱奕碩表示：「〈掠猴之歌〉的編曲散發一股電視遊樂器復古感，所以我們打造一款8bit風格小遊戲，還讓三位團員化身三種樂器人物，包含月琴、電貝斯、北管通鼓，陪伴玩家一起闖關。」</strong>遊戲融合台灣既有街景文化特色，出現手搖杯店、小吃攤等，讓樂迷扮起偵探，協助苦主「金蕉小姐」搜集猴子老公出軌的證據。隨著MV與遊戲一併公開，<strong>百合花也宣布將啟動「2023 變猴弄」海外巡迴</strong>，將在4月底前進新加坡、馬來西亞，將台灣獨特音樂特色推廣到世界各地。</p>\n\n\n\n<figure class="wp-block-image aligncenter size-large image"><img width="1024" height="1024" src="https://assets.matters.news/embed/3ebc4a93-d887-40dc-a7bc-9f69cd728c8c.jpeg" alt class="wp-image-3385" data-asset-id="3ebc4a93-d887-40dc-a7bc-9f69cd728c8c"><figcaption class="wp-element-caption"><strong>百合花宣布啟動海外巡演計畫！ 四月底前進星馬演出</strong></figcaption></figure>\n\n\n\n<p></p>\n',
      '<p>金曲樂團百合花打造新世代抓姦神曲〈掠猴之歌〉(照片：Taiwan Beats提供)</p><hr><p><strong>金曲樂團百合花看透現代成人愛情關係 打造新世代抓姦神曲〈掠猴之歌〉</strong></p><p>榮獲<a target="_blank" rel="noopener noreferrer nofollow" href="https://money.udn.com/money/story/7307/6432158">金曲獎最佳台語專輯</a>的百合花樂團，近期宣布啟動海外演出計畫，即將前進新加坡、馬來西亞演出，然而許久未跟台灣樂迷互動的他們，也特別推出全新〈<a target="_blank" rel="noopener noreferrer nofollow" href="https://www.youtube.com/watch?v=u7AqYDBrjBI">掠猴之歌</a>〉MV，搞怪奇幻色彩，宛如前世時空記憶，卻擁有千年不變的相同錯綜複雜感情議題，糾結惱人情緒，即便經過多次輪迴依舊解不開，<strong>原來「出軌」這件事，無論哪個世紀都可能存在</strong>。百合花打趣笑說：「掠猴就是抓偷吃的意思，也是每個人感情裡最不想遇到的事情，我們用幽默手法與旋律，窺探愛情裡各種面貌。」百合花特別也為〈掠猴之歌〉打造一款線上互動遊戲「掠猴之遊戲Monkey-Catching Game」，邀請樂迷替苦主「金蕉小姐」搜集猴子老公出軌的證據！</p><p>百合花從首張大碟囊括金音獎最佳搖滾專輯、最佳新人，第二張作品贏得去年金曲獎最佳台語專輯殊榮，奠定當今獨立樂壇地位，樂團不斷嘗試以傳統樂器混搭流行旋律，透過幽默與嘲諷歌詞拼貼，企圖打造千禧世代的「<strong>後台灣新歌謠</strong>」，也表現出略帶異色卻又充滿社會百態風情的生命之作。其中描繪當代成人複雜愛情觀的〈掠猴之歌〉，名符其實是一首「<strong>抓姦歌</strong>」，樂團比擬歌曲如同奧斯卡大導演「<a target="_blank" rel="noopener noreferrer nofollow" href="https://zh.wikipedia.org/zh-tw/%E7%A7%91%E6%81%A9%E5%85%84%E5%BC%9F"><strong>柯恩兄弟</strong></a>」的瀟灑態度，卻又加入金馬獎導演黃信堯擅於小人物縮影觀察，濃縮成一首現代社會面對愛情出軌的直球對決。</p><hr><p><strong>MV上演抓姦千年穿越劇 警世寓言大讚宛如百合花式「戲說台灣」！</strong></p><p>也因為〈掠猴之歌〉散發一股獨特電影感氣息，百合花決定讓MV呈現樂團從未有過的影像風格，特別邀請曾入圍金曲最佳MV的導演林毛執導，攜手<a target="_blank" rel="noopener noreferrer nofollow" href="https://www.instagram.com/sidandgeri/">藝術家sid and geri</a>合力操刀，把感情裡最不想觸碰的「抓猴」議題，也能變成一場又鏗又充滿警世意味寓言遊戲。<br class="smart">MV把場景拉到西元前3000年，在千年世紀之前，同樣也有出軌問題，女主角找來專業徵信雙人組做一場交易，藉由奇異魔法與幻術，企圖找出另一半偷吃證據，導演特別跟現代時空交錯，彷彿上演一場前世今生的「抓姦輪迴」大戲，他也表示：「<strong>過去華語歌曲常以哀怨節奏描繪外遇、偷吃等感情失敗關係，但百合花反其道而行，改以自嘲幽默手法，讓抓姦不再只是一場社會悲劇。」樂團成員看到MV成品後大讚導演瘋狂創意，繽紛視覺加上穿越劇方式，笑稱「我們也有屬於百合花式風格的《細說台灣》了！</strong>」</p><hr><p><strong>推出線上互動「掠猴之遊戲」 邀請樂迷一起上網協尋偷吃出軌證據</strong><br class="smart"><strong>百合花宣布啟動海外巡演計畫！ 四月底前進星馬演出</strong></p><figure class="image"><img src="https://assets.matters.news/embed/c7a25d10-4820-42b3-8ec1-c56fbf8b75d7.jpeg"><figcaption></figcaption></figure><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://liliumtaiwan.itch.io/monkey"><strong>推出線上互動「掠猴之遊戲」 邀請樂迷一起上網協尋偷吃出軌證據</strong></a></p><p>〈掠猴之歌〉MV還埋藏樂團先前推出的線上互動遊戲「<a target="_blank" rel="noopener noreferrer nofollow" href="https://liliumtaiwan.itch.io/monkey">掠猴之遊戲Monkey-Catching Game</a>」彩蛋，邀請樂迷一邊看MV也能從中挖掘，<strong>主唱奕碩表示：「〈掠猴之歌〉的編曲散發一股電視遊樂器復古感，所以我們打造一款8bit風格小遊戲，還讓三位團員化身三種樂器人物，包含月琴、電貝斯、北管通鼓，陪伴玩家一起闖關。」</strong>遊戲融合台灣既有街景文化特色，出現手搖杯店、小吃攤等，讓樂迷扮起偵探，協助苦主「金蕉小姐」搜集猴子老公出軌的證據。隨著MV與遊戲一併公開，<strong>百合花也宣布將啟動「2023 變猴弄」海外巡迴</strong>，將在4月底前進新加坡、馬來西亞，將台灣獨特音樂特色推廣到世界各地。</p><p><strong>百合花宣布啟動海外巡演計畫！ 四月底前進星馬演出</strong></p><p></p>',
    )
  })
})

describe('Normalization: Comment', () => {
  test('quote', () => {
    expectNormalizeCommentHTML(
      stripIndent`
        <blockquote>
          <p>1</p>
          <p>2</p>
          <p>3</p>
        </blockquote>
      `,
      '<blockquote><p>1</p><p>2</p><p>3</p></blockquote>',
    )

    expectNormalizeCommentHTML(
      stripIndent`
        <blockquote>
          <p>hello,<br>world</p>
          <p>how are you today</p>
          <p><strong>strong</strong></p>
          <p>normal paragraph</p>
          <h2>heading</h2>hello,world
        </blockquote>
      `,
      '<blockquote><p>hello,<br class="smart">world</p><p>how are you today</p><p>strong</p><p>normal paragraph</p><p>heading</p><p>hello,world</p></blockquote>',
    )
  })

  test('link', () => {
    expectNormalizeCommentHTML(
      '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">abc</a></p>',
      '<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">abc</a></p>',
    )
  })

  test('bolds is not supported', () => {
    expectNormalizeCommentHTML('<p><strong>abc</strong></p>', '<p>abc</p>')
    expectNormalizeCommentHTML('<p><b>abc</b></p>', '<p>abc</p>')
  })

  test('strikethrough is not supported', () => {
    expectNormalizeCommentHTML('<p><s>abc</s></p>', '<p>abc</p>')
    expectNormalizeCommentHTML('<p><del>abc</del></p>', '<p>abc</p>')
    expectNormalizeCommentHTML('<p><strike>abc</strike></p>', '<p>abc</p>')
  })

  test('italic is not supported', () => {
    expectNormalizeCommentHTML('<p>abc</p>', '<p>abc</p>')

    expectNormalizeCommentHTML('<p><i>abc</i></p>', '<p>abc</p>')
  })

  test('underline is not supported', () => {
    expectNormalizeCommentHTML('<p><u>abc</u></p>', '<p>abc</p>')
  })

  test('self-closed tags', () => {
    expectNormalizeCommentHTML('<p />', '<p></p>')

    expectNormalizeCommentHTML('<br></br>', '<p><br class="smart"></p>')

    expectNormalizeCommentHTML('<hr/>', '<p></p>')

    // <img /> -> <img>
    expectNormalizeCommentHTML(
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg" /><figcaption>左：女反派。右：女主。</figcaption></figure>',
      '<p>左：女反派。右：女主。</p>',
    )

    // <iframe /> -> <iframe></iframe>
    expectNormalizeCommentHTML(
      '<figure class="embed" data-provider="youtube"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0" /></div><figcaption></figcaption></figure>',
      '<p></p>',
    )
  })

  test('figures are not supported', () => {
    // image
    expectNormalizeCommentHTML(
      '<figure class="image"><img src="https://assets.matters.news/embed/c40d5045-0c03-44b6-afe6-93a285ffd1bb.jpeg"><figcaption>左：女反派。右：女主。</figcaption></figure>',
      '<p>左：女反派。右：女主。</p>',
    )

    // audio
    expectNormalizeCommentHTML(
      '<figure class="audio"><audio controls><source src="https://assets.matters.news/embedaudio/0a45d56a-d19a-4300-bfa4-305639fd5a82/點數經濟-讓過路客成為回頭客.mp3" type="audio/mp3"></audio><div class="player"><header><div class="meta"><h4 class="title">點數經濟：讓過路客成為回頭客</h4><div class="time"><span class="current" data-time="00:00"></span><span class="duration" data-time="--:--"></span></div></div><span class="play"></span></header><footer><div class="progress-bar"><span></span></div></footer></div><figcaption>區塊勢 Podcast</figcaption></figure>',
      '<p>點數經濟：讓過路客成為回頭客</p><p>區塊勢 Podcast</p>',
    )

    // video
    expectNormalizeCommentHTML(
      '<figure class="embed embed-video" data-provider="youtube"><div class="iframe-container"><iframe src="https://www.youtube.com/embed/Zk7DppcfaMY?rel=0" loading="lazy" allowfullscreen frameborder="0"></iframe></div><figcaption></figcaption></figure>',
      '<p></p>',
    )
  })
})
