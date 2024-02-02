import type { Metadata, ResolvingMetadata } from 'next';
//import Image from 'next/image'

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

//
// Notes:
// If I can get the og.imageUrl in generateMetadata, then perhaps
// I don't need to use `getServerSideProps`. I can get the map data
// in the page's useEffect hook.
//
// I can then consider moving `index.tsx` back to `/app/page.tsx`.
//

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  console.log('generateMetadata');

  for (const key in searchParams) {
    console.log(key);
  }

  console.log(params);
  console.log(searchParams);

  // const previousTitle = (await parent).openGraph?.title;
  // const previousImages = (await parent).openGraph?.images;

  return {
    title: 'FooBar',
    openGraph: {
      images: ['/images/icons/crapola.png'],
    },
  };
}

// type PageProps = {
//   query: object,
//   url: URL,
// };
// type ContextObject = {
//   query: object,
//   resolvedUrl: URL,
// };
// export async function getServerSideProps(context: ContextObject) {
//   console.log('getServerSideProps');
//   const json: PageProps = {
//     query: context.query,
//     url: context.resolvedUrl,
//   }
//   console.log('context.query', context.query);
//   console.log('context.resolvedUrl', context.resolvedUrl);
//   return { props: json };
// }

export default function Page() {
  return <div>Atlasphere</div>;
}
