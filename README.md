# Bookord

Bookord is an open source, feature-rich book reading app for desktop. It has an intuitive interface and lots of useful features to make your reading experience better.

With Bookord, you can read any book from your computer without having to worry about losing place the place where you left off or having to carry around a physical book.

You can read, annotate, highlight, organize your library, access advanced text-to-speech options, personalize the interface and much more!

### Dev

Running dev

```bash
npm run dev
```

Generating docs to `./docs/index.html`

```bash
npm run doc
```

### Dist

Updating targeted browser version & removing unnecessary polyfills

```bash
npx browserslist@latest --update-db
```

Building for windows to `./dist/Bookord.msi`

```bash
npm run dist-windows
```
