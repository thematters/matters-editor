# Matters Editor

This rich text editor is based on three amazing projects [Quill](https://quilljs.com/), [react-quill](https://github.com/zenoamaro/react-quill) and [Tippy.js](https://atomiks.github.io/tippyjs/). This editor has been used in a real production called [Matters](http://matters.news), a writing platform built on top of IPFS. Currently, we're pulling it out as a standalone package, so there will be some big changes in the following. 😎

## Features

- This package includes two types of editor: article and comment.
- There languages support by default. (English, 正體中文, 简体中文)
- Inline formats such as Bold, Italic, Strike, Underline, Blockquote, List and Link.
- MP3 and AAC file upload.
- Image upload and drag & drop.
- Embed video from Youtube and Viemo.
- Embed code snippet from JSFiddle.

## How to install

```
npm i @matters/matters-editor
```

## How to run demo up

Default web server port is `9000`, and you can change it in `package.json`.

```
npm run demo
```

Then, check it by viewing `http://localhost:9000`.

## How to build

Default output destination is folder `build`.

```
npm run build
```
