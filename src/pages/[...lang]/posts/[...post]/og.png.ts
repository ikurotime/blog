import type { APIRoute, InferGetStaticPropsType } from 'astro'

import OG from '../../../../components/OpenGraph/OG'
import { PNG } from '../../../../components/OpenGraph/createImage'
import fs from 'fs/promises'
import { getCollection } from 'astro:content'
import matter from 'gray-matter'

export async function getStaticPaths() {
  const blog = await getCollection('posts')
  const blogData = await getBlogFrontmatterCollection()
  return blog.map((post) => {
    const postData = blogData.find((data) => data.title === post.data.title)
    return {
      params: {
        lang: post.slug.split('/').shift(),
        post: post.slug.split('/').pop()
      },
      props: {
        title: post.data.title,
        heroImage: postData?.heroImage?.replace('../../../images/blog/', '')
      }
    }
  })
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>

export const GET: APIRoute = async function get({ props, params }) {
  const { title, heroImage } = props as Props
  const png = await PNG(OG(title, heroImage))
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png'
    }
  })
}

const getBlogFrontmatterCollection = async () => {
  const contentDirs = ['src/content/posts/en', 'src/content/posts/es']
  const getFrontmatter = async (dir: string) => {
    const files = await fs.readdir(dir)
    return Promise.all(
      files
        .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
        .map(async (file) => {
          const content = await fs.readFile(`${dir}/${file}`, 'utf-8')
          return matter(content).data
        })
    )
  }

  const frontmatterPromises = contentDirs.map(getFrontmatter)
  const frontmatterCollections = await Promise.all(frontmatterPromises)

  return frontmatterCollections.flat()
}
