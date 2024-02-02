
import { visit } from 'unist-util-visit';

//
// Returns an array of rel code blocks including the
// value and meta query string.
//

function transformer(ast, file) {

  function visitor(node) {
    data.links.push(node);
    return node;
  }

  let data = { links: [] };
  visit(ast, 'link', visitor);
  file.data = Object.assign({}, file.data, data);
}

export default function remarkCollectLinks() {
  return transformer;
}
