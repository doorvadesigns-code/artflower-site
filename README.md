# Anna Bakaeva portfolio (static site)

A self-contained, hand-hostable copy of the Framer site at artflovver.framer.website. Every page, image, video and font lives in this folder, and the site no longer loads any code from Framer. It's plain HTML and CSS plus one small script (`assets/site.js`) that handles the scroll-in animations, the header menu, slideshows, the poster lightbox and the hover labels on the home page.

## What's in here

The home page is `index.html`. Every other page is a folder with its own `index.html`, so URLs stay clean (`/soma/`, `/posters/`, `/cv/` and so on). All media sits in `assets/`, and `404.html` is the page GitHub shows for broken links. The empty `.nojekyll` file tells GitHub Pages to serve the files as-is.

The CV page still embeds the PDF from Google Drive, and "Organizing the Chaos" still embeds its YouTube video. Those are external on purpose and work fine once the site is live.

## Put it live on GitHub Pages

1. Create a new repository on GitHub (public, unless you have a paid plan that allows private Pages).
2. Upload the contents of this folder to it (not the folder itself, the files inside). From a terminal in this folder:

   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   ```

   ```bash
   git push -u origin main
   ```

3. In the repository go to **Settings → Pages**. Under "Build and deployment" pick **Deploy from a branch**, branch `main`, folder `/ (root)`, and save. After a minute the site is live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

## Connect your own domain

1. In **Settings → Pages → Custom domain**, type your domain (for example `annabakaeva.com`) and save. GitHub adds a `CNAME` file to the repo for you.
2. At your domain registrar, add these DNS records:

   | Type  | Name  | Value                     |
   |-------|-------|---------------------------|
   | A     | @     | 185.199.108.153           |
   | A     | @     | 185.199.109.153           |
   | A     | @     | 185.199.110.153           |
   | A     | @     | 185.199.111.153           |
   | CNAME | www   | YOUR-USERNAME.github.io   |

3. DNS can take from a few minutes to a few hours. When GitHub shows the domain as verified, tick **Enforce HTTPS**.

Using a custom domain (or a `YOUR-USERNAME.github.io` repository) is recommended. All links in the site are relative, so it also works from a sub-path like `/YOUR-REPO/`, except the 404 page, whose "back" link points at the domain root.

## Editing

Text lives directly in each page's `index.html`. Search for the sentence you want to change and edit it in place. To swap an image, replace the file in `assets/fr/images/` with a new one of the same name, or point the `src`/`srcset` in the HTML at a new file. Framer generates several sizes of each image for `srcset`; if you only replace one, update or remove the others too.
