import type { Content, Link, Root } from "mdast";

export function remarkCitationGroups() {
      return (tree: Root) => {
            walk(tree as unknown as Parent);
      };
}

interface Parent {
      children?: Content[];
}

function walk(node: Parent) {
      if (Array.isArray(node.children)) {
            node.children = mergeLinks(node.children);
            for (const child of node.children) walk(child as unknown as Parent);
      }
}

function mergeLinks(children: Content[]): Content[] {
      const result: Content[] = [];
      let i = 0;

      while (i < children.length) {
            const node = children[i];

            if (node.type !== "link") {
                  result.push(node);
                  i++;
                  continue;
            }

            const group: Link[] = [node as Link];
            let j = i + 1;

            while (j < children.length) {
                  const candidate = children[j];
                  if (candidate.type === "link") {
                        group.push(candidate as Link);
                        j++;
                        continue;
                  }
                  const isConnectingSpace = candidate.type === "text" && /^\s+$/.test(candidate.value);
                  const nextIsLink = children[j + 1]?.type === "link";
                  if (isConnectingSpace && nextIsLink) {
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
                              sources: JSON.stringify(
                                    group.map((link) => ({
                                          url: link.url,
                                          title: plainText(link).trim(),
                                    })),
                              ),
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
