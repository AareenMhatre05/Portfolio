# Aareen Mhatre: Portfolio

My personal portfolio site: who I am, what I work on, the projects I've built, and how to reach me.

**Live site: [aareen-mhatre-portfolio.vercel.app](https://aareen-mhatre-portfolio.vercel.app/)**

## What's on the site

- **Hero:** a starfield that gathers into a dot-matrix portrait of me. Hover it (or tap on a phone) to reveal the photo.
- **About:** a short introduction with a photo.
- **Stack:** the languages, tools and platforms I use.
- **What I do:** backend and databases, mobile and web apps, data and machine learning.
- **Projects:** each with a short summary, its stack and a link to the code.
- **Experience and education:** degree, roles and certifications.
- **Contact:** email, LinkedIn, GitHub and a downloadable résumé.

A short intro animation plays on load. Motion follows the system's "reduce motion" setting, and the content stays readable with JavaScript turned off.

## Built with

- [Next.js](https://nextjs.org) (App Router) with TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [GSAP](https://gsap.com) with ScrollTrigger and SplitText for scroll animations
- [Lenis](https://lenis.darkroom.engineering) for smooth scrolling
- Canvas 2D for the particle portrait, and WebGL for the contact section's smoke background

## Run it locally

You need Node.js 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

To check a production build:

```bash
npm run build
npm start
```

## Editing the content

All the text, links, skills, projects and experience are in [`src/data.ts`](src/data.ts), so you can update the site without touching the components. Images are in [`public/`](public):

- `me.png`: the cut-out photo used for the hero portrait. The crop and face boxes for it are also set in `src/data.ts`.
- `about.jpg`: the photo in the About section.
- `resume.pdf`: the résumé behind the download buttons.
- `projects/`: project screenshots.

## License

[MIT](LICENSE) © 2026 Aareen Mhatre
