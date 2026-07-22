import type { Content, InlineCode, Link, Root } from "mdast";

export function remarkCitationGroups() {
      return (tree: Root) => {
            walk(tree as unknown as Parent);
      };
}

interface Parent {
      children?: Content[];
}

const URL_PATTERN = /^https?:\/\/\S+$/i;

function isBareUrlCode(node: Content): node is InlineCode {
      return node.type === "inlineCode" && URL_PATTERN.test(node.value.trim());
}

function isCitationNode(node: Content): boolean {
      return node.type === "link" || isBareUrlCode(node);
}

/** Extracts { url, title } from either a link node or a bare-URL code node. */
function toSource(node: Content): { url: string; title: string } {
      if (node.type === "link") {
            return { url: (node as Link).url, title: plainText(node).trim() };
      }
      const code = node as InlineCode;
      return { url: code.value.trim(), title: "" };
}

function walk(node: Parent) {
      if (Array.isArray(node.children)) {
            node.children = mergeCitations(node.children);
            for (const child of node.children) walk(child as unknown as Parent);
      }
}

function mergeCitations(children: Content[]): Content[] {
      const result: Content[] = [];
      let i = 0;

      while (i < children.length) {
            const node = children[i];

            if (!isCitationNode(node)) {
                  result.push(node);
                  i++;
                  continue;
            }

            const group: Content[] = [node];
            let j = i + 1;

            while (j < children.length) {
                  const candidate = children[j];
                  if (isCitationNode(candidate)) {
                        group.push(candidate);
                        j++;
                        continue;
                  }
                  const isConnectingSpace = candidate.type === "text" && /^\s+$/.test(candidate.value);
                  const nextIsCitation = children[j + 1] ? isCitationNode(children[j + 1]) : false;
                  if (isConnectingSpace && nextIsCitation) {
                        j++;
                        continue;
                  }
                  break;
            }

            result.push({
                  type: "citationGroup",
                  data: {
                        hName: "citation-group",
                        hProperties: {
                              sources: JSON.stringify(group.map(toSource)),
                        },
                  },
                  children: [],
            } as unknown as Content);

            i = j;
      }

      return result;
}

function plainText(node: unknown): string {
      const n = node as { type?: string; value?: string; children?: unknown[] };
      if (n.type === "text" && typeof n.value === "string") return n.value;
      if (Array.isArray(n.children)) return n.children.map(plainText).join("");
      return "";
}
