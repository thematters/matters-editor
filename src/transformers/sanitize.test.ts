import { test, expect, describe } from 'vitest'
import { sanitizeHTML } from './sanitize'

const expectSanitizeHTML = async (input: string, output: string) => {
  const result = await sanitizeHTML(input)
  expect(result.trim()).toBe(output)
}

/**
 * Tests
 */
// via https://github.com/leizongmin/js-xss/blob/master/test/test_xss.js
describe('Sanitization: basic', async () => {
  test('unknown attributes', async () => {
    await expectSanitizeHTML('<a title xx oo>pp</a>', '<a title="">pp</a>')
    await expectSanitizeHTML('<a title "">pp</a>', '<a title="">pp</a>')
    await expectSanitizeHTML('<a t=""></a>', '<a></a>')
    await expectSanitizeHTML(
      '<a title="\'<<>>"></a>',
      '<a title="&#x27;<<>>"></a>'
    )
    await expectSanitizeHTML('<a title="""></a>', '<a title=""></a>')
    await expectSanitizeHTML('<a h=title="oo"></a>', '<a></a>')
    await expectSanitizeHTML('<a h= title="oo"></a>', '<a></a>')
    await expectSanitizeHTML(
      '<a title="javascript&colonalert(/xss/)"></a>',
      '<a title="javascript&#x26;colonalert(/xss/)"></a>'
    )
    await expectSanitizeHTML(
      '<a title"hell aa="fdfd title="ok">hello</a>',
      '<a>hello</a>'
    )
  })
})

// https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
describe('Sanitization: XSS_Filter_Evasion_Cheat_Sheet', async () => {
  test('scripts', async () => {
    await expectSanitizeHTML(
      '></SCRI' +
        'PT>">\'><SCRI' +
        'PT>alert(String.fromCharCode(88,83,83))</SCRI' +
        'PT>',
      '>">\'>'
    )

    await expectSanitizeHTML(';!--"<XSS>=&{()}', ';!--"=&#x26;{()}')

    await expectSanitizeHTML(
      '<SCRIPT SRC=http://ha.ckers.org/xss.js></SCRI' + 'PT>',
      ''
    )

    await expectSanitizeHTML(
      '<!--[if gte IE 4]><SCRI' +
        "PT>alert('XSS');</SCRI" +
        'PT><![endif]--> END',
      'END'
    )

    await expectSanitizeHTML(
      '<!--[if gte IE 4]><SCRI' +
        "PT>alert('XSS');</SCRI" +
        'PT><![endif]--> END',
      'END'
    )

    await expectSanitizeHTML(
      '<SCRIPT/XSS SRC="http://ha.ckers.org/xss.js"></SCRI' + 'PT>',
      ''
    )

    await expectSanitizeHTML(
      '<BODY onload!#$%&()*~+-_.,:;?@[/|]^`=alert("XSS")>',
      ''
    )

    await expectSanitizeHTML(
      '<<SCRI' + 'PT>alert("XSS");//<</SCRI' + 'PT>',
      '&#x3C;'
    )

    await expectSanitizeHTML('<SCRIPT SRC=http://ha.ckers.org/xss.js?< B >', '')

    await expectSanitizeHTML('<SCRIPT SRC=//ha.ckers.org/.j', '')

    await expectSanitizeHTML(
      '<ſcript src="https://xss.haozi.me/j.js"></ſcript>',
      '&#x3C;ſcript src="https://xss.haozi.me/j.js">'
    )

    await expectSanitizeHTML(
      '<a style="url(\'javascript:alert(1)\')"></a>',
      '<a></a>'
    )
    await expectSanitizeHTML(
      '<td background="url(\'javascript:alert(1)\')"></td>',
      ''
    )
  })

  test('HTML <iframe> tag', async () => {
    await expectSanitizeHTML(
      '<iframe src=http://ha.ckers.org/scriptlet.html <',
      ''
    )
  })

  test('HTML <img> tag', async () => {
    await expectSanitizeHTML('<IMG SRC="javascript:alert(\'XSS\');">', '<img>')

    await expectSanitizeHTML("<IMG SRC=javascript:alert('XSS')>", '<img>')

    await expectSanitizeHTML("<IMG SRC=JaVaScRiPt:alert('XSS')>", '<img>')

    await expectSanitizeHTML(
      '<IMG SRC=`javascript:alert("RSnake says, \'XSS\'")`>',
      '<img>'
    )

    await expectSanitizeHTML(
      '<IMG """><SCRI' + 'PT>alert("XSS")</SCRI' + 'PT>">',
      '<img>">'
    )

    await expectSanitizeHTML(
      '<IMG SRC=javascript:alert(String.fromCharCode(88,83,83))>',
      '<img>'
    )

    await expectSanitizeHTML(
      '<IMG SRC=&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#39;&#88;&#83;&#83;&#39;&#41;>',
      '<img>'
    )

    await expectSanitizeHTML(
      '<IMG SRC=&#0000106&#0000097&#0000118&#0000097&#0000115&#0000099&#0000114&#0000105&#0000112&#0000116&#0000058&#0000097&#0000108&#0000101&#0000114&#0000116&#0000040&#0000039&#0000088&#0000083&#0000083&#0000039&#0000041>',
      '<img>'
    )

    await expectSanitizeHTML(
      '<IMG SRC=&#x6A&#x61&#x76&#x61&#x73&#x63&#x72&#x69&#x70&#x74&#x3A&#x61&#x6C&#x65&#x72&#x74&#x28&#x27&#x58&#x53&#x53&#x27&#x29>',
      '<img>'
    )

    await expectSanitizeHTML('<IMG SRC="jav ascript:alert(\'XSS\');">', '<img>')

    await expectSanitizeHTML(
      '<IMG SRC="jav&#x09;ascript:alert(\'XSS\');">',
      '<img>'
    )

    await expectSanitizeHTML(
      '<IMG SRC="jav\nascript:alert(\'XSS\');">',
      '<img>'
    )

    await expectSanitizeHTML('<IMG SRC=java\0script:alert("XSS")>', '<img>')

    await expectSanitizeHTML(
      '<IMG SRC=" &#14;  javascript:alert(\'XSS\');">',
      '<img>'
    )

    await expectSanitizeHTML('<IMG SRC="javascript:alert(\'XSS\')"', '')
  })

  test('HTML style attributes', async () => {
    await expectSanitizeHTML(
      '<DIV STYLE="width: \nexpression(alert(1));"></DIV>',
      '<div></div>'
    )
    await expectSanitizeHTML(
      '<DIV STYLE="background:\n url (javascript:ooxx);"></DIV>',
      '<div></div>'
    )
    await expectSanitizeHTML(
      '<DIV STYLE="background:url (javascript:ooxx);"></DIV>',
      '<div></div>'
    )

    await expectSanitizeHTML(
      '<DIV STYLE="background: url (ooxx);"></DIV>',
      '<div></div>'
    )

    await expectSanitizeHTML('<IMG SRC=\'vbscript:msgbox("XSS")\'>', '<img>')

    await expectSanitizeHTML('<IMG SRC="livescript:[code]">', '<img>')

    await expectSanitizeHTML('<IMG SRC="mocha:[code]">', '<img>')
  })

  test('HTML href attributes', async () => {
    await expectSanitizeHTML(
      '<a href="javas/**/cript:alert(\'XSS\');"></a>',
      '<a href="javas/**/cript:alert(&#x27;XSS&#x27;);"></a>'
    )

    await expectSanitizeHTML(
      '<a href="javascript"></a>',
      '<a href="javascript"></a>'
    )
    await expectSanitizeHTML(
      '<a href="/javascript/a"></a>',
      '<a href="/javascript/a"></a>'
    )
    await expectSanitizeHTML(
      '<a href="/javascript/a"></a>',
      '<a href="/javascript/a"></a>'
    )
    await expectSanitizeHTML(
      '<a href="http://aa.com"></a>',
      '<a href="http://aa.com"></a>'
    )
    await expectSanitizeHTML(
      '<a href="https://aa.com"></a>',
      '<a href="https://aa.com"></a>'
    )
    await expectSanitizeHTML(
      '<a href="mailto:me@ucdok.com"></a>',
      '<a href="mailto:me@ucdok.com"></a>'
    )
    await expectSanitizeHTML(
      '<a href="tel:0123456789"></a>',
      '<a href="tel:0123456789"></a>'
    )
    await expectSanitizeHTML('<a href="#hello"></a>', '<a href="#hello"></a>')
    await expectSanitizeHTML('<a href="other"></a>', '<a href="other"></a>')
  })

  test('HTML5 entities', async () => {
    await expectSanitizeHTML(
      '<a href="javascript&colon;alert(/xss/)"></a>',
      '<a></a>'
    )
    await expectSanitizeHTML(
      '<a href="javascript&colonalert(/xss/)"></a>',
      '<a href="javascript&#x26;colonalert(/xss/)"></a>'
    )
    // await expectSanitizeHTML('<a href="a&NewLine;b">', '<a></a>')
    // await expectSanitizeHTML('<a href="a&NewLineb">', '<a></a>')
    await expectSanitizeHTML(
      '<a href="javasc&NewLine;ript&colon;alert(1)"></a>',
      '<a></a>'
    )
  })

  test('Data URL', async () => {
    await expectSanitizeHTML('<a href="data:"></a>', '<a></a>')
    await expectSanitizeHTML('<a href="d a t a : "></a>', '<a></a>')
    await expectSanitizeHTML('<a href="data: html/text;"></a>', '<a></a>')
    await expectSanitizeHTML('<a href="data:html/text;"></a>', '<a></a>')
    await expectSanitizeHTML('<a href="data:html /text;"></a>', '<a></a>')
    await expectSanitizeHTML('<a href="data: image/text;"></a>', '<a></a>')
    await expectSanitizeHTML('<img src="data: aaa/text;">', '<img>')
    await expectSanitizeHTML(
      '<img src="data:image/png; base64; ofdkofiodiofl">',
      '<img>'
    )
  })

  test('HTML Comments', async () => {
    await expectSanitizeHTML('<!--                               -->', '')
    await expectSanitizeHTML('<!--      a           -->', '')
    await expectSanitizeHTML('<!--sa       -->ss', 'ss')
    await expectSanitizeHTML('<!--                               ', '')
  })
})
