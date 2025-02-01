import { visit } from 'unist-util-visit'
import type { Link, Root } from 'mdast'

export function remarkYoutube() {
  return (tree: Root) => {
    visit(tree, 'link', (node: Link) => {
      const videoId = node.url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:&|$)/)?.[1]
      if (videoId) {
        node.type = 'html'
        node.value = `<div class="youtube-embed">
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube-nocookie.com/embed/${videoId}"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>`
      }
    })
  }
}
