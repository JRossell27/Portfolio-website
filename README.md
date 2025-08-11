# Portfolio Starter v2

Header and categories configured per spec. No videos preloaded.

## Your categories
- Social Media Videos
- Interviews
- Shot On iPhone
- MLB Network
- Weddings

## Add your reel
In `index.html`, find the Reel section and replace `REEL_VIDEO_ID` with your Vimeo id.

## Add projects
Inside `#projectGrid` follow the HTML comment block instructions. Example card structure is in the comment.

Important
- `data-category` must match one of the category labels exactly.
- Thumbs go in `assets/img/` and can be JPG or PNG.
- `data-vimeo` takes the Vimeo numeric id.

## Deploy on Render
- Push this folder to a GitHub repo.
- Render -> New -> Static Site.
  - Build command: leave blank
  - Publish directory: `/`
- After deploy, point your Namecheap domain:
  - CNAME for `www` -> your onrender host (no https)
  - URL Redirect for `@` -> https://www.yourdomain.com (Permanent 301)

## Customize
- Edit colors and spacing in `assets/css/styles.css`
- Add Open Graph tags in `<head>` for rich link previews
