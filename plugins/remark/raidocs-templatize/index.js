//
// raidocsTemplatize - Adds component imports to the
// page so authors can use them directly without having
// to import them.
//
export default function raidocsTemplatize(text) {
  if (text.includes('{/* RAIDOCS-IGNORE-TEMPLATE */}')) {
    return text;
  }

  const header = `
import ImgFig from 'components/ImgFig'

`;
  return `${header}\n\n${text ? text : ''}\n\n`;
}
