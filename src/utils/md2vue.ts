import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

export async function markdownToVue(markdown: string) {
    const file = await unified().use(remarkParse).use(remarkRehype).use(rehypeStringify).process(markdown);

    return file.value as string;
}
