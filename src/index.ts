import Handlebars, { template } from "handlebars";
import fs from "fs";

const contentPath = "content";
const templatePath = "template";

//read all files in the content folder,recursively
type Template = {
  path: string;
  name: string;
  content: string | null;
};
const templates: Template[] = fs
  .readdirSync(templatePath, { withFileTypes: true, recursive: true })
  .filter((file) => file.isFile())
  .filter((file) => file.name.split(".").pop() === "html")
  .map((file) => {
    return {
      path: `${file.path}/${file.name}`,
      name: `${file.name}`,
      content: null,
    };
  });

const files = fs
  .readdirSync(contentPath, {
    recursive: true,
    withFileTypes: true,
  })
  .filter((file) => file.isFile())
  .filter((file) => file.name.split(".").pop() === "md")
  .map((file) => `${file.path}/${file.name}`);

const parsedFiles: any = {};

// {
//   template1: [htmlcontent1, htmlcontent2] ,...
//   template2: [htmlcontent1, htmlcontent2
// }

for (let file of files) {
  const content = fs.readFileSync(file, "utf-8").toString();
  const frontMatter = parseFrontMatter(content);
  console.log(frontMatter);

  if (frontMatter === null) {
    // TODO: log  error
  } else {
    // TODO: read the template file
    if (!frontMatter.hasOwnProperty("template")) continue;

    const template = templates.find(
      (template) => template.name === frontMatter.template
    );

    //TODO : log error
    if (template === undefined) continue;

    if (!template.content) {
      template.content = fs.readFileSync(template.path, "utf-8").toString();
    }

    const handlebarTemplate = Handlebars.compile(template.content);

    // TODO: remove all reserved keywords in frontmatter object
    const result = handlebarTemplate(frontMatter);
    if (parsedFiles[template.name] === undefined) {
      parsedFiles[template.name] = [];
    } else {
      parsedFiles[template.name].push(result);
    }
  }
}

function parseFrontMatter(content: string) {
  const frontMatter = content.match(/---\n([\s\S]+?)\n---/)?.[1];
  if (frontMatter === undefined) return null;

  let result: any = {};
  for (let line of frontMatter.split("\n")) {
    line = line.trim();

    let [key, value] = line.split(":");

    if (key === undefined || value === undefined) continue;

    key = key.trim();

    // get inside the quotes, single or double
    const match = value.match(/['"](.*)['"]/);
    if (!match) continue;
    value = match[1];

    value = result[key] = value;
  }
  // TODO: remove all reserved keywords

  return result;
}
